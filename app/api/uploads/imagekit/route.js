import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth-request";
import { uploadFileToImageKit } from "@/lib/imagekit";

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request) {
  const auth = await getAuthFromRequest();
  if (!auth) {
    return NextResponse.json({ error: "Please log in to upload images." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folderHint = String(formData.get("folderHint") || "contribution").trim();
  const folderType = String(formData.get("folderType") || "places").trim().toLowerCase();

  if (!file || typeof file !== "object" || !("arrayBuffer" in file) || !file.size) {
    return NextResponse.json({ error: "Select an image file first." }, { status: 400 });
  }

  const fileType = String(file.type || "").trim().toLowerCase();
  if (!SUPPORTED_IMAGE_TYPES.has(fileType)) {
    return NextResponse.json(
      { error: `${file.name || "This file"} must be a JPG, PNG, or WEBP image.` },
      { status: 400 }
    );
  }

  if (Number(file.size || 0) > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `${file.name || "This image"} is still too large after processing. Please try a smaller image.` },
      { status: 400 }
    );
  }

  try {
    const baseFolder = folderType === "users" ? "/ghumnp/users" : "/ghumnp/places";
    const uploaded = await uploadFileToImageKit(file, {
      folder: `${baseFolder}/${slugify(folderHint) || "contribution"}`,
    });

    return NextResponse.json({
      ok: true,
      url: uploaded.url,
      fileId: uploaded.fileId,
      thumbnailUrl: uploaded.thumbnailUrl,
    });
  } catch (error) {
    console.error("[imagekit-upload] Upload failed:", error?.message);
    return NextResponse.json(
      { error: error?.message || "Image upload failed." },
      { status: 500 }
    );
  }
}
