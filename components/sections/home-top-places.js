"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PlaceCard from "@/components/cards/place-card";
import { ChevronRightIcon } from "@/components/ui/icons";

const INITIAL_VISIBLE_COUNT = 10;
const MAX_VISIBLE_COUNT = 20;

export default function HomeTopPlaces({ places = [] }) {
  const [showAll, setShowAll] = useState(false);

  const visiblePlaces = useMemo(() => {
    const limitedPlaces = places.slice(0, MAX_VISIBLE_COUNT);
    return showAll ? limitedPlaces : limitedPlaces.slice(0, INITIAL_VISIBLE_COUNT);
  }, [places, showAll]);

  const canShowMore = places.length > INITIAL_VISIBLE_COUNT;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <Link
          href="/allplaces"
          style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 13, fontWeight: 600, color: "var(--jade)" }}
        >
          View all <ChevronRightIcon className="size-4" />
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visiblePlaces.map((place, index) => (
          <PlaceCard key={place.id} place={place} imagePriority={index === 0} />
        ))}
      </div>

      {canShowMore && !showAll ? (
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            style={{
              border: "1px solid rgba(15, 23, 42, 0.08)",
              background: "#fff",
              color: "var(--jade)",
              borderRadius: 999,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 700,
              boxShadow: "var(--shadow-sm)",
              cursor: "pointer",
            }}
          >
            Show more
          </button>
        </div>
      ) : null}
    </>
  );
}
