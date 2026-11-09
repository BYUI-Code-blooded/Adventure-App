"use client";

import Image from "next/image";
import { useId, useState } from "react";
import team from "@/content/team.json";

type TeamMember = (typeof team)[number];

// Builds an OpenStreetMap embed (no API key needed) for a "lat,lon" location string.
function osmMap(location: string) {
  const [lat, lon] = location.split(",").map((part) => Number(part.trim()));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const bbox = [lon - 0.004, lat - 0.0025, lon + 0.004, lat + 0.0025].join(",");
  return {
    embed: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`,
    link: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`,
  };
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  const first = words[0]?.[0] ?? "";
  const last = words[words.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

export default function TeamCard({ member }: { member: TeamMember }) {
  const [isOpen, setIsOpen] = useState(false);
  const detailsId = `team-details-${useId().replace(/:/g, "")}`;
  const firstName = member.name.trim().split(/\s+/)[0] ?? member.name;
  const map = member.location ? osmMap(member.location) : null;

  function handleToggle() {
    setIsOpen((open) => !open);
  }

  return (
    <li className="overflow-hidden rounded-2xl bg-amber-50 shadow-sm">
      {member.photo ? (
        <Image
          src={member.photo}
          alt={`Photo of ${member.name}`}
          width={800}
          height={600}
          unoptimized
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={`${member.name}, no photo yet`}
          className="grid aspect-[4/3] place-items-center bg-emerald-900 text-amber-300"
        >
          <span className="grid size-16 place-items-center rounded-full border-2 border-amber-300 text-xl font-extrabold">
            {getInitials(member.name)}
          </span>
        </div>
      )}
      <div className="p-4">
        <p className="text-sm font-bold text-emerald-700">{member.role}</p>
        <h3 className="mt-2 text-lg font-bold">{member.name}</h3>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={detailsId}
          onClick={handleToggle}
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-emerald-900 px-4 py-2 text-sm font-semibold hover:bg-emerald-900 hover:text-amber-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
        >
          More about {firstName}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {isOpen && (
          <div id={detailsId} className="mt-4">
            {member.bio && <p className="text-emerald-900/80">{member.bio}</p>}
            {member.favorite && (
              <div className="mt-5 rounded-2xl bg-emerald-100/60 p-4">
                <p className="text-sm font-bold text-emerald-700">Favorite Rexburg spot</p>
                <p className="mt-1 font-bold text-emerald-950">{member.favorite}</p>
                {member.favoriteWhy && (
                  <p className="mt-2 text-sm text-emerald-900/80">{member.favoriteWhy}</p>
                )}
              </div>
            )}
            {map && (
              <div className="mt-4">
                <iframe
                  title={`Map of ${member.favorite}`}
                  src={map.embed}
                  className="h-56 w-full rounded-2xl border-0 md:h-64"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
                <a
                  href={map.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-emerald-700 underline hover:text-emerald-900"
                >
                  View larger map
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
