import Image from "next/image";
import { StarIcon } from "@/components/ui/icons";
import { formatDate } from "@/lib/utils";

export default function ReviewCard({ review }) {
  return (
    <article className="rounded-[24px] border border-black/5 bg-white p-4 shadow-[0_14px_34px_rgba(17,24,39,0.06)]">
      <div className="flex items-start gap-3">
        <div className="relative size-11 overflow-hidden rounded-full">
          <Image src={review.avatar} alt={review.author} fill sizes="44px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-semibold text-slate-900">{review.author}</h4>
              <p className="text-xs text-slate-500">{formatDate(review.date)}</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-600">
              {Array.from({ length: 5 }).map((_, index) => (
                <StarIcon
                  key={index}
                  filled={index < review.rating}
                  className="size-3.5"
                />
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>
        </div>
      </div>
    </article>
  );
}
