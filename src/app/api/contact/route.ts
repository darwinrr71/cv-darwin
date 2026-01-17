import { NextResponse } from "next/server";

import { sendMail } from "@/lib/mail/msGraph";
import { upstashExpire, upstashIncr } from "@/lib/kv/upstash";

const MAX_LENGTHS = {
  name: 80,
  email: 120,
  subject: 120,
  message: 2000,
};

const RATE_LIMITS = {
  shortWindow: { seconds: 10 * 60, max: 3 },
  longWindow: { seconds: 24 * 60 * 60, max: 10 },
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

async function checkRateLimit(ip: string): Promise<boolean> {
  const key10 = `contact:ip:${ip}:10m`;
  const key24 = `contact:ip:${ip}:24h`;

  const [count10, count24] = await Promise.all([
    upstashIncr(key10),
    upstashIncr(key24),
  ]);

  if (count10 === 1) {
    await upstashExpire(key10, RATE_LIMITS.shortWindow.seconds);
  }

  if (count24 === 1) {
    await upstashExpire(key24, RATE_LIMITS.longWindow.seconds);
  }

  return (
    count10 <= RATE_LIMITS.shortWindow.max &&
    count24 <= RATE_LIMITS.longWindow.max
  );
}

export async function POST(request: Request) {
  let payload: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    honeypot?: string;
    defaultSubject?: string;
  };

  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const honeypot = payload.honeypot?.trim();
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const subject = payload.subject?.trim() ?? "";
  const message = payload.message?.trim() ?? "";
  const errors: Record<string, string> = {};

  if (!name) {
    errors.name = "required";
  } else if (name.length > MAX_LENGTHS.name) {
    errors.name = "max_length";
  }

  if (!email) {
    errors.email = "required";
  } else if (email.length > MAX_LENGTHS.email) {
    errors.email = "max_length";
  } else if (!emailRegex.test(email)) {
    errors.email = "invalid_email";
  }

  if (subject && subject.length > MAX_LENGTHS.subject) {
    errors.subject = "max_length";
  }

  if (!message) {
    errors.message = "required";
  } else if (message.length > MAX_LENGTHS.message) {
    errors.message = "max_length";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ fieldErrors: errors }, { status: 400 });
  }

  const ip = getClientIp(request);
  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const subjectFallback =
    payload.defaultSubject?.trim() || "Contact form message";
  const finalSubject = subject || subjectFallback;
  const emailBody = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject || "-"}`,
    "",
    message,
  ].join("\n");

  try {
    await sendMail({ subject: finalSubject, body: emailBody, replyTo: email });
  } catch {
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
