import crypto from "node:crypto";

import {
  upstashDel,
  upstashGet,
  upstashGetJson,
  upstashSet,
  upstashSetJson,
} from "@/lib/kv/upstash";

type TokenStore = {
  refresh_token: string;
  updated_at: number;
};

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
};

const ACCESS_TOKEN_KEY = "mail:msgraph:access";
const REFRESH_TOKEN_KEY = "mail:msgraph:refresh";
const STATE_KEY_PREFIX = "mail:msgraph:state:";
const STATE_TTL_SECONDS = 600;
const SCOPES = ["offline_access", "Mail.Send"];

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return value;
}

function getAuthorityBase(): string {
  return getEnv("MS_AUTHORITY").replace(/\/$/, "");
}

function getTokenUrl(): string {
  return `${getAuthorityBase()}/oauth2/v2.0/token`;
}

function getAuthorizeUrl(): string {
  return `${getAuthorityBase()}/oauth2/v2.0/authorize`;
}

async function requestToken(params: Record<string, string>): Promise<TokenResponse> {
  const response = await fetch(getTokenUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });

  if (!response.ok) {
    throw new Error("Microsoft token request failed");
  }

  return (await response.json()) as TokenResponse;
}

async function storeTokens(token: TokenResponse) {
  if (token.refresh_token) {
    await upstashSetJson<TokenStore>(REFRESH_TOKEN_KEY, {
      refresh_token: token.refresh_token,
      updated_at: Date.now(),
    });
  }

  if (token.access_token && token.expires_in) {
    await upstashSet(
      ACCESS_TOKEN_KEY,
      token.access_token,
      Math.max(60, token.expires_in - 60),
    );
  }
}

async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const token = await requestToken({
    client_id: getEnv("MS_CLIENT_ID"),
    client_secret: getEnv("MS_CLIENT_SECRET"),
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    redirect_uri: getEnv("MS_REDIRECT_URI"),
    scope: SCOPES.join(" "),
  });

  await storeTokens(token);
  return token;
}

async function getRefreshToken(): Promise<string> {
  const stored = await upstashGetJson<TokenStore>(REFRESH_TOKEN_KEY);
  if (!stored?.refresh_token) {
    throw new Error("Microsoft refresh token not found");
  }

  return stored.refresh_token;
}

export async function createOAuthState(): Promise<string> {
  const secret = getEnv("OAUTH_STATE_SECRET");
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now().toString();
  const payload = `${nonce}.${timestamp}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  const state = `${payload}.${signature}`;

  await upstashSet(`${STATE_KEY_PREFIX}${nonce}`, timestamp, STATE_TTL_SECONDS);
  return state;
}

export async function validateOAuthState(state: string): Promise<boolean> {
  const secret = getEnv("OAUTH_STATE_SECRET");
  const parts = state.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [nonce, timestamp, signature] = parts;
  const payload = `${nonce}.${timestamp}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  if (signature.length !== expected.length) {
    return false;
  }

  const stored = await upstashGet(`${STATE_KEY_PREFIX}${nonce}`);
  const valid =
    stored === timestamp &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!valid) {
    return false;
  }

  await upstashDel(`${STATE_KEY_PREFIX}${nonce}`);
  return true;
}

export function buildConnectUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: getEnv("MS_CLIENT_ID"),
    response_type: "code",
    redirect_uri: getEnv("MS_REDIRECT_URI"),
    response_mode: "query",
    scope: SCOPES.join(" "),
    state,
    prompt: "consent",
  });

  return `${getAuthorizeUrl()}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<void> {
  const token = await requestToken({
    client_id: getEnv("MS_CLIENT_ID"),
    client_secret: getEnv("MS_CLIENT_SECRET"),
    grant_type: "authorization_code",
    code,
    redirect_uri: getEnv("MS_REDIRECT_URI"),
    scope: SCOPES.join(" "),
  });

  await storeTokens(token);
}

export async function getAccessToken(): Promise<string> {
  const cached = await upstashGet(ACCESS_TOKEN_KEY);
  if (cached) {
    return cached;
  }

  const refreshToken = await getRefreshToken();
  const token = await refreshAccessToken(refreshToken);
  return token.access_token;
}

type SendMailPayload = {
  subject: string;
  body: string;
  replyTo: string;
};

async function sendGraphMail(accessToken: string, payload: SendMailPayload) {
  return fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject: payload.subject,
        body: {
          contentType: "Text",
          content: payload.body,
        },
        toRecipients: [
          { emailAddress: { address: getEnv("CONTACT_OWNER_EMAIL") } },
        ],
        replyTo: [{ emailAddress: { address: payload.replyTo } }],
      },
      saveToSentItems: "true",
    }),
  });
}

export async function sendMail(payload: SendMailPayload): Promise<void> {
  let accessToken = await getAccessToken();
  let response = await sendGraphMail(accessToken, payload);

  if (response.status === 401) {
    const refreshToken = await getRefreshToken();
    const token = await refreshAccessToken(refreshToken);
    accessToken = token.access_token;
    response = await sendGraphMail(accessToken, payload);
  }

  if (!response.ok) {
    throw new Error("Microsoft Graph sendMail failed");
  }
}
