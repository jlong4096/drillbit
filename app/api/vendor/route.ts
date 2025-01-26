import { NextResponse } from "next/server";
import { getVendors } from ".";

export async function GET() {
  return NextResponse.json(getVendors());
}
