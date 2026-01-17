import { NextResponse } from "next/server";

import { buildConnectUrl, createOAuthState } from "@/lib/mail/msGraph";

export async function GET() {
  const state = await createOAuthState();
  const url = buildConnectUrl(state);
  return NextResponse.redirect(url);
}
