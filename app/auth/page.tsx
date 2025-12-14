"use client";

import { NeoCyberButton } from "@/components/ui/neo-cyber-button";
import ProviderOnboarding from "@/components/provider-onboarding";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Bars } from "react-loader-spinner";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/ui/glow-card";
import { BookOpen, GraduationCap } from "lucide-react";

const AuthPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const providersRef = collection(db, "providers");
        const q = query(providersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          router.push("/dashboard");
        } else {
          setShowOnboarding(true);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0c0a15] text-white">
        <Bars
          height="60"
          width="60"
          color="#22D3EE"
          ariaLabel="bars-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
        <p className="ml-4 text-cyan-400 font-mono animate-pulse tracking-widest">
          INITIALIZING PROTOCOL...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-4 bg-[#050505]">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-50"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-0 -left-64 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-6xl w-full z-10 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-white text-center"
        >
          CHOOSE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">PATH</span>
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* Learner Card */}
          <GlowCard className="p-10 flex flex-col items-center text-center bg-black/40 border-white/5 hover:border-cyan-500/30 transition-all duration-500 group">
            <div className="w-24 h-24 mb-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
              <GraduationCap className="w-10 h-10 text-cyan-400" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">LEARNER</h2>
            <p className="text-slate-400 mb-10 leading-relaxed max-w-sm">
              Access decentralized courses, earn <span className="text-cyan-300">PGN tokens</span>, and build your on-chain verified resume.
            </p>

            <Link href="/explore" className="w-full">
              <NeoCyberButton variant="primary" className="w-full text-lg">
                ACCESS_LEARNER_NODE
              </NeoCyberButton>
            </Link>
          </GlowCard>

          {/* Provider Card */}
          <GlowCard borderColors={{ first: "#a855f7", second: "#ec4899" }} className="p-10 flex flex-col items-center text-center bg-black/40 border-white/5 hover:border-purple-500/30 transition-all duration-500 group relative">
            {/* Cyberpunk Accents */}
            <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500/50 rounded-sm animate-pulse"></div>
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-pink-500/50 rounded-sm animate-pulse delay-75"></div>

            <div className="w-24 h-24 mb-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
              <BookOpen className="w-10 h-10 text-purple-400" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors tracking-tighter">PROVIDER_MODE</h2>
            <p className="text-slate-400 mb-10 leading-relaxed max-w-sm font-mono text-sm">
              Create courses, mint video NFTs, and earn while you teach. Join the <span className="text-purple-300">Faculty DAO</span>.
            </p>

            <div className="w-full">
              <ProviderOnboarding initialOpen={showOnboarding} />
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
