type UpstashResponse<T> = {
  result?: T;
  error?: string;
};

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error("Missing Upstash Redis configuration");
  }

  return { url: url.replace(/\/$/, ""), token };
}

async function upstashCommand<T>(
  command: string,
  ...args: Array<string | number>
): Promise<T> {
  const { url, token } = getUpstashConfig();
  const encodedArgs = args.map((arg) => encodeURIComponent(String(arg)));
  const endpoint = `${url}/${command}/${encodedArgs.join("/")}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = (await response.json()) as UpstashResponse<T>;

  if (!response.ok || data.error) {
    throw new Error("Upstash request failed");
  }

  return data.result as T;
}

export async function upstashGet(key: string): Promise<string | null> {
  return upstashCommand<string | null>("get", key);
}

export async function upstashSet(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<string | null> {
  if (ttlSeconds) {
    return upstashCommand<string | null>("set", key, value, "EX", ttlSeconds);
  }

  return upstashCommand<string | null>("set", key, value);
}

export async function upstashGetJson<T>(key: string): Promise<T | null> {
  const value = await upstashGet(key);
  if (!value) {
    return null;
  }

  return JSON.parse(value) as T;
}

export async function upstashSetJson<T>(
  key: string,
  value: T,
  ttlSeconds?: number,
): Promise<void> {
  await upstashSet(key, JSON.stringify(value), ttlSeconds);
}

export async function upstashIncr(key: string): Promise<number> {
  const result = await upstashCommand<number | string>("incr", key);
  return typeof result === "number" ? result : Number(result);
}

export async function upstashExpire(
  key: string,
  ttlSeconds: number,
): Promise<number> {
  const result = await upstashCommand<number | string>("expire", key, ttlSeconds);
  return typeof result === "number" ? result : Number(result);
}

export async function upstashDel(key: string): Promise<number> {
  const result = await upstashCommand<number | string>("del", key);
  return typeof result === "number" ? result : Number(result);
}
