"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { GlowCard } from "@/components/ui/glow-card";
import { NeoCyberButton } from "@/components/ui/neo-cyber-button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FaBook, FaNetworkWired, FaCube, FaCoins, FaUserSecret, FaGraduationCap, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100 },
    },
};

export default function SystemDocsPage() {
    return (
        <main className="relative min-h-screen w-full flex flex-col items-center overflow-x-hidden text-white font-sans selection:bg-cyan-500/30">
            <AnimatedBackground />

            <div className="relative z-10 max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header Navigation */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                >
                    <Link href="/">
                        <NeoCyberButton variant="ghost" className="pl-0 gap-2 text-cyan-400 hover:text-cyan-300">
                            <FaArrowLeft /> RETURN TO NEXUS
                        </NeoCyberButton>
                    </Link>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-16"
                >
                    {/* 1. System Manifest */}
                    <section className="space-y-6 text-center">
                        <motion.div variants={itemVariants} className="inline-block">
                            <Badge className="bg-cyan-950/50 border-cyan-500/30 text-cyan-300 px-4 py-1 text-xs tracking-[0.3em] backdrop-blur-md">
                                SYSTEM_MANIFEST_V1.0
                            </Badge>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-slate-400"
                        >
                            PRAGYA NETRA
                            <span className="block text-2xl md:text-3xl font-light tracking-widest mt-2 text-cyan-500/50 font-mono">
                // THE THIRD EYE OF KNOWLEDGE
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed font-light"
                        >
                            In an era of localized data silos, we establish a decentralized educational protocol.
                            Pragya Netra is not merely a platform; it is a <span className="text-cyan-400 font-medium">sovereign network</span> where knowledge flows immutable, uncensored, and peer-to-peer.
                        </motion.p>
                    </section>

                    <Separator className="bg-gradient-to-r from-transparent via-cyan-900 to-transparent" />

                    {/* 2. Core Architecture */}
                    <section>
                        <motion.div variants={itemVariants} className="mb-8 flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-cyan-400">
                                <FaNetworkWired size={24} />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight uppercase">Core Architecture</h2>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div variants={itemVariants}>
                                <GlowCard className="h-full p-8 bg-black/40 backdrop-blur-md border-cyan-500/20">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                        The Bridge
                                    </h3>
                                    <p className="text-slate-400 leading-relaxed text-sm">
                                        Our system operates on a hybrid architecture. The <span className="text-purple-400">Identity Layer</span> leverages standard authentication for seamless onboarding, while the <span className="text-cyan-400">Value Layer</span> is purely on-chain. This "Bridge" ensures that while user experience remains fluid, the ownership of assets (Courses, Flow Tokens) remains cryptographically secure.
                                    </p>
                                </GlowCard>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <GlowCard className="h-full p-8 bg-black/40 backdrop-blur-md border-cyan-500/20" borderColors={{ first: "#a855f7", second: "#06b6d4" }}>
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                                        Immutable Ledger
                                    </h3>
                                    <p className="text-slate-400 leading-relaxed text-sm">
                                        Every course creation, every update, and every transaction is recorded. Once a course is deployed, its metadata is pinned. While content can be refined by the creator, the <i>existence</i> and <i>ownership</i> of the educational asset are guaranteed by the blockchain.
                                    </p>
                                </GlowCard>
                            </motion.div>
                        </div>
                    </section>

                    {/* 3. The Flow Protocol */}
                    <section>
                        <motion.div variants={itemVariants} className="mb-8 flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-green-950/30 border border-green-500/20 text-green-400">
                                <FaCube size={24} />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight uppercase">The Flow Protocol</h2>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <GlowCard className="p-1 bg-gradient-to-br from-green-500/10 to-emerald-900/10 border-green-500/20" borderColors={{ first: "#10b981", second: "#059669" }}>
                                <div className="bg-black/80 backdrop-blur-xl p-8 rounded-xl h-full">
                                    <p className="text-lg text-slate-300 mb-6 font-light">
                                        We chose <strong className="text-green-400">Flow Blockchain</strong> for its high throughput and developer-centric Cadence architecture. It allows us to execute micro-transactions for course updates without burdening creators with prohibitive gas fees.
                                    </p>

                                    <div className="space-y-4">
                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value="item-1" className="border-white/10">
                                                <AccordionTrigger className="text-emerald-300 hover:text-emerald-200 uppercase tracking-widest text-sm font-bold">
                                                    Why Cadence?
                                                </AccordionTrigger>
                                                <AccordionContent className="text-slate-400 leading-relaxed">
                                                    Cadence is a resource-oriented programming language. In our system, a "Course" isn't just a database entry; it's a <span className="text-white">Resource</span> in your account storage. If you create it, you hold it in your wallet. It cannot be deleted by the platform administrator, only by you.
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value="item-2" className="border-white/10">
                                                <AccordionTrigger className="text-emerald-300 hover:text-emerald-200 uppercase tracking-widest text-sm font-bold">
                                                    Transaction Throughput
                                                </AccordionTrigger>
                                                <AccordionContent className="text-slate-400 leading-relaxed">
                                                    Flow's multi-node architecture separates consensus from computation. This allows Pragya Netra to scale to millions of learners without the network congestion seen on legacy L1 chains.
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
                                </div>
                            </GlowCard>
                        </motion.div>
                    </section>

                    {/* 4. Utility & Economics */}
                    <section>
                        <motion.div variants={itemVariants} className="mb-8 flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-yellow-950/30 border border-yellow-500/20 text-yellow-400">
                                <FaCoins size={24} />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight uppercase">Utility & Economics</h2>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Creator Economy */}
                            <motion.div variants={itemVariants} className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl blur-xl group-hover:opacity-100 opacity-50 transition-opacity duration-500"></div>
                                <div className="relative border border-orange-500/20 bg-black/60 backdrop-blur-md p-8 rounded-2xl h-full hover:border-orange-500/40 transition-colors">
                                    <h3 className="text-xl font-bold text-orange-400 mb-2 uppercase tracking-wider flex items-center gap-3">
                                        <FaUserSecret /> Creator Node
                                    </h3>
                                    <div className="space-y-4 mt-6">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <span className="text-slate-400 text-sm">Deploy Course cost</span>
                                            <span className="text-white font-mono">~0.01 FLOW</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <span className="text-slate-400 text-sm">Edit Metadata cost</span>
                                            <span className="text-white font-mono">0.5 FLOW</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                                            *Costs are burned or redistributed to network validators to prevent spam and ensure high-quality content on the protocol.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Learner Economy */}
                            <motion.div variants={itemVariants} className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-xl group-hover:opacity-100 opacity-50 transition-opacity duration-500"></div>
                                <div className="relative border border-blue-500/20 bg-black/60 backdrop-blur-md p-8 rounded-2xl h-full hover:border-blue-500/40 transition-colors">
                                    <h3 className="text-xl font-bold text-blue-400 mb-2 uppercase tracking-wider flex items-center gap-3">
                                        <FaGraduationCap /> Learner Node
                                    </h3>
                                    <div className="space-y-4 mt-6">
                                        <p className="text-slate-300 text-sm leading-relaxed">
                                            Learners pay directly to the smart contract. The contract splits the payment instantly:
                                        </p>
                                        <ul className="space-y-2 text-sm text-slate-400 list-disc pl-4 marker:text-blue-500">
                                            <li>95% Direct to Creator Wallet</li>
                                            <li>5% Protocol Maintenance Fee</li>
                                        </ul>
                                        <div className="mt-4 bg-blue-950/20 p-4 rounded-lg border border-blue-500/20">
                                            <p className="text-blue-200 text-xs font-mono text-center">
                                                NO INTERMEDIARIES. INSTANT SETTLEMENT.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* 5. User Manual (Accordion Style) */}
                    <section>
                        <motion.div variants={itemVariants} className="mb-8 flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-pink-950/30 border border-pink-500/20 text-pink-400">
                                <FaBook size={24} />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight uppercase">Manual Interface</h2>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Accordion type="single" collapsible className="w-full space-y-4">
                                <AccordionItem value="start" className="border border-white/10 bg-white/5 rounded-xl px-4 overflow-hidden">
                                    <AccordionTrigger className="text-lg font-medium text-white hover:text-cyan-400 hover:no-underline py-4">
                                        <span className="flex items-center gap-4">
                                            <span className="text-xs font-mono text-slate-500">01</span>
                                            PROTOCOL INITIATION
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-4 text-slate-400 pl-10 leading-relaxed">
                                        Access the network via the "INITIATE LEARNING" terminal on the landing page.
                                        You will be required to authenticate via email. Once authenticated, a unique <span className="text-cyan-400">Provider ID</span> is assigned to your neural link (account).
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="create" className="border border-white/10 bg-white/5 rounded-xl px-4 overflow-hidden">
                                    <AccordionTrigger className="text-lg font-medium text-white hover:text-cyan-400 hover:no-underline py-4">
                                        <span className="flex items-center gap-4">
                                            <span className="text-xs font-mono text-slate-500">02</span>
                                            DEPLOYING KNOWLEDGE
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-4 text-slate-400 pl-10 leading-relaxed">
                                        Navigate to your Dashboard. Engage the "INITIATE NEW COURSE" protocol.
                                        You must provide a Title, Description, and Price (in FLOW).
                                        <br /><br />
                                        <em className="text-yellow-500/80">Caution: This action writes to the blockchain. Ensure your wallet has sufficient gas fees.</em>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="edit" className="border border-white/10 bg-white/5 rounded-xl px-4 overflow-hidden">
                                    <AccordionTrigger className="text-lg font-medium text-white hover:text-cyan-400 hover:no-underline py-4">
                                        <span className="flex items-center gap-4">
                                            <span className="text-xs font-mono text-slate-500">03</span>
                                            REFINING DATA
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-4 text-slate-400 pl-10 leading-relaxed">
                                        Course creators can update metadata (Title, Description, Banner Video).
                                        Due to the immutable nature of the initial record, updates are appended as new states.
                                        This incurs a <span className="text-cyan-400 font-mono">0.5 FLOW</span> tax to discourage frivolous state changes on the chain.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </motion.div>
                    </section>

                    {/* Footer CTA */}
                    <motion.div variants={itemVariants} className="pt-12 pb-20 text-center">
                        <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">Ready to Jack In?</h3>
                        <Link href="/auth">
                            <NeoCyberButton className="text-lg px-12 py-6">
                                ESTABLISH CONNECTION
                            </NeoCyberButton>
                        </Link>
                    </motion.div>

                </motion.div>
            </div>
        </main>
    );
}
