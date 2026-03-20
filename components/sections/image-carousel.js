"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export default function ImageCarousel({ images, alt }) {
  const [index, setIndex] = useState(0);

  function showPrevious() {
    setIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function showNext() {
    setIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  }

  return (
    <div className="relative h-96 overflow-hidden rounded-b-[34px]">
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((image, imageIndex) => (
          <div key={`${image}-${imageIndex}`} className="relative h-full min-w-full">
            <Image
              src={image}
              alt={alt}
              fill
              sizes="430px"
              className="object-cover"
              priority={imageIndex === 0}
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={showPrevious}
            className="absolute left-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.92] text-slate-900 shadow-lg"
            aria-label="Show previous image"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={showNext}
            className="absolute right-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.92] text-slate-900 shadow-lg"
            aria-label="Show next image"
          >
            <ChevronRightIcon className="size-5" />
          </button>
          <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
            {images.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                onClick={() => setIndex(dotIndex)}
                className={cn(
                  "h-2.5 rounded-full bg-white/60 transition-all",
                  dotIndex === index ? "w-8 bg-white" : "w-2.5"
                )}
                aria-label={`Go to image ${dotIndex + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
