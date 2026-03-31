import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth-request";
import { uploadToImageKit } from "@/lib/imagekit";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

function slugify(v) {
  return String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function POST(request) {
  const auth = await getAuthFromRequest();
  if (!auth) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body." }, { status: 400 });
  }

  const { file: dataUrl, fileName, mimeType: clientMime, folderHint, folderType } = body;

  if (!dataUrl || typeof dataUrl !== "string") {
    return NextResponse.json({ error: "No image data." }, { status: 400 });
  }

  // Parse data URL: "data:<mime>;base64,<data>"
  const comma = dataUrl.indexOf(",");
  if (!dataUrl.startsWith("data:") || comma === -1) {
    return NextResponse.json({ error: "Invalid image format." }, { status: 400 });
  }
  const mime = dataUrl.slice(5, comma).split(";")[0].toLowerCase() || clientMime || "image/jpeg";
  const b64  = dataUrl.slice(comma + 1);

  if (!ALLOWED_TYPES.has(mime)) {
    return NextResponse.json({ error: `File type "${mime}" not allowed. Use JPG, PNG or WEBP.` }, { status: 400 });
  }

  const buffer = Buffer.from(b64, "base64");
  if (!buffer.length) return NextResponse.json({ error: "Empty image." }, { status: 400 });
  if (buffer.length > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Image exceeds 10 MB limit." }, { status: 413 });
  }

  const base = folderType === "users" ? "/ghumnp/users" : "/ghumnp/places";
  const folder = `${base}/${slugify(folderHint) || "contribution"}`;

  try {
    const result = await uploadToImageKit(buffer, { fileName, mime, folder });
    return NextResponse.json({ ok: true, url: result.url, fileId: result.fileId });
  } catch (err) {
    console.error("[upload]", err.message);
    return NextResponse.json({ error: err.message || "Upload failed." }, { status: 502 });
  }
}
