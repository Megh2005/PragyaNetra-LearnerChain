"use client";

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { TypingAnimation } from "@/components/ui/typing-animation";
import Link from "next/link";
import React from "react";

const HeroSection: React.FC = () => {
  return (
    <div className="relative h-screen">
      <div className="absolute inset-0">
        <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <div className="max-w-4xl text-center">
          <h1 className="mb-8 text-4xl font-bold tracking-loose sm:text-6xl lg:text-7xl text-white">
            Open Your <span className="text-sky-400">PragyaNetra</span>
          </h1>
          <TypingAnimation
            typeSpeed={50}
            className="mx-auto mb-8 capitalize max-w-2xl font-semibold tracking-wider text-lg text-slate-300"
            showCursor={false}
          >
            An exceptional initiative of creating DAO for fully education &amp;
            learning purposes which is governed by Proof of learning Concensus &amp;
            Incentivised by our own coin PGN
          </TypingAnimation>
          <div className="flex my-6 flex-wrap justify-center gap-4">
            <InteractiveHoverButton className="rounded-full px-6 py-3 font-bold text-xl tracking-wider bg-black border-cyan-400">
              <Link href="/auth">Explore More</Link>
            </InteractiveHoverButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
