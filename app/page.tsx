"use client";

import { NeoCyberButton } from "@/components/ui/neo-cyber-button";
import { GlowCard } from "@/components/ui/glow-card";
import { TypingAnimation } from "@/components/ui/typing-animation";
import Link from "next/link";
import React from "react";
import { motion, Variants } from "framer-motion";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden text-white font-sans selection:bg-cyan-500/30">
      <AnimatedBackground />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center py-20"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="relative group cursor-default">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative px-6 py-2 bg-black ring-1 ring-white/10 rounded-full flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-medium tracking-[0.2em] text-cyan-400 uppercase">
                Web3 Education Protocol
              </span>
            </div>
          </div>
        </motion.div>

        {/* Hero Text */}
        <div className="text-center space-y-6 max-w-7xl mx-auto mb-16">
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.9] mix-blend-overlay break-words"
          >
            <span className="block text-white/90 drop-shadow-2xl">OPEN YOUR</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient-x drop-shadow-[0_0_35px_rgba(34,211,238,0.4)]">
              PRAGYA NETRA
            </span>
          </motion.h1>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10"
          >
            <Link href="/auth">
              <NeoCyberButton variant="primary" className="w-64">
                INITIATE LEARNING
              </NeoCyberButton>
            </Link>
            <Link href="/system-docs">
              <NeoCyberButton variant="secondary" className="w-48">
                SYSTEM DOCS
              </NeoCyberButton>
            </Link>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl mt-20"
        >
          {[
            { label: "Total Value Locked", value: "$100K+", color: "text-cyan-400" },
            { label: "Active Learners", value: "100+", color: "text-purple-400" },
            { label: "Community Courses", value: "50+", color: "text-pink-400" },
            { label: "Rewards Distributed", value: "100+", color: "text-emerald-400" },
          ].map((stat, i) => (
            <GlowCard key={i} className="p-8 flex flex-col items-center justify-center text-center group">
              <h3 className={cn("text-4xl font-bold mb-2 tracking-tight", stat.color, "drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]")}>
                {stat.value}
              </h3>
              <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold group-hover:text-gray-200 transition-colors">
                {stat.label}
              </p>
            </GlowCard>
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
};

