import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser, updateUser } from ".";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    updateUser(body);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return new NextResponse(`Could not parse the request body: ${e}`, {
        status: 400,
      });
    }
    return new NextResponse(`${e}`, {
      status: 500,
    });
  }
}

export async function GET() {
  return NextResponse.json(getUser());
}
