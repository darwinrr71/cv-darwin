import { NextResponse } from "next/server";

import { defaultLocale } from "@/lib/i18n";
import { exchangeCodeForToken, validateOAuthState } from "@/lib/mail/msGraph";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json({ error: "missing_code" }, { status: 400 });
  }

  const isValid = await validateOAuthState(state);
  if (!isValid) {
    return NextResponse.json({ error: "invalid_state" }, { status: 400 });
  }

  await exchangeCodeForToken(code);

  const origin = new URL(request.url).origin;
  const baseUrl = (process.env.APP_URL ?? origin).replace(/\/$/, "");
  return NextResponse.redirect(`${baseUrl}/${defaultLocale}/contact?connected=1`);
}
