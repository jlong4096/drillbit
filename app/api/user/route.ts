import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { User, UserSchema } from "@/types/user";
import { getUser } from ".";

const user = getUser();

export async function POST(req: NextRequest) {
  const body = await req.json();
  let updatedUser: User | null = null;
  try {
    updatedUser = UserSchema.parse(body);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return new NextResponse("Could not parse the request body", {
        status: 400,
      });
    }
  }

  if (!updatedUser) {
    return new NextResponse("Request body not parsed correctly", {
      status: 500,
    });
  }

  user.name = updatedUser.name;
  user.phone = updatedUser.phone;
}

export async function GET() {
  return NextResponse.json(user);
}
