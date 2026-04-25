"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import Footer from "@/component/Footer";
import Header from "@/component/Header";
import PageBackground from "@/component/PageBackground";

export default function ProfileIndexPage() {
  const [address, setAddress] = useState("");

  const normalized = useMemo(() => address.trim(), [address]);
  const href = normalized ? `/profile/${encodeURIComponent(normalized)}` : "";

  return (
    <PageBackground>
      <Header />

      <main className="mx-auto max-w-5xl px-6 pt-32 pb-20 text-white">
        <section className="rounded-[2rem] border border-white/10 bg-[#111726]/85 p-8 shadow-[0_25px_80px_rgba(2,6,23,0.45)] backdrop-blur sm:p-12">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#4FD1C5]">
            Public Profile
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            View a creator or predictor
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[#94a3b8] sm:text-lg">
            Public profiles are available at{" "}
            <span className="font-semibold text-white">/profile/[address]</span>
            . Paste a Stellar wallet address to view a user’s stats, recent
            predictions, and markets created.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <label
                htmlFor="stellar-address"
                className="text-sm font-medium text-white"
              >
                Stellar address
              </label>
              <input
                id="stellar-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. GB3JD...WQZ2"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-[#64748b] outline-none focus:border-orange-500/50"
              />
            </div>

            <Link
              href={href || "/profile"}
              aria-disabled={!href}
              className={[
                "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition",
                href
                  ? "bg-orange-500 text-white hover:bg-orange-500/90"
                  : "cursor-not-allowed bg-white/5 text-gray-500",
              ].join(" ")}
              onClick={(e) => {
                if (!href) e.preventDefault();
              }}
            >
              View Profile
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-[#94a3b8]">
              Example:{" "}
              <Link
                href="/profile/GBRPYHIL2COW3Y7L5H5O5XWYWQ6X5TQJQCB7JPC2MWF4E4QWQZ2"
                className="font-medium text-orange-300 hover:text-orange-200"
              >
                /profile/GBRPYHIL2COW3Y7L5H5O5XWYWQ6X5TQJQCB7JPC2MWF4E4QWQZ2
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </PageBackground>
  );
}

