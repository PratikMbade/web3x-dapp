import { getServerUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ user });
}