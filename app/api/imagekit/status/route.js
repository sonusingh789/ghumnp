import { NextResponse } from "next/server";
import { getImageKitConfigStatus } from "@/lib/imagekit";

export async function GET() {
  return NextResponse.json(getImageKitConfigStatus());
}
