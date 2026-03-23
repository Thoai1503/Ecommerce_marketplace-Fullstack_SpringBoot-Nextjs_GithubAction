"use client";

import { Providers } from "./providers";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const randomNames = [
  "SwiftShip",
  "LogiFlow",
  "ShipWave",
  "CargoPulse",
  "Tranzo",
  "ShipRocket",
  "Freightly",
  "ShipMate",
  "ParcelPro",
  "GoLogi",
];

export default function Home() {
  const [brandName, setBrandName] = useState("Logistics");

  const subtitle = useMemo(
    () => `Tracking system powered by ${brandName}`,
    [brandName],
  );

  useEffect(() => {
    const next = randomNames[Math.floor(Math.random() * randomNames.length)];
    setBrandName(next);
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        {brandName}
      </h1>
      <p className="max-w-xl text-center text-zinc-600">
        {subtitle}. This project contains a tracking page for customers and an
        admin dashboard to manage shipments.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/tracking"
          className="rounded-md bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
        >
          Go to Tracking
        </Link>
        <Link
          href="/admin"
          className="rounded-md border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50"
        >
          Go to Admin
        </Link>
      </div>
    </div>
  );
}
