"use client";

import Image from "next/image";

/**
 * BlurImage — thin wrapper around next/image.
 * The skeleton effect is handled purely by CSS background-color on the
 * parent container — no JS state, no race conditions, no blank flash.
 */
export default function BlurImage(props) {
  return <Image {...props} />;
}
