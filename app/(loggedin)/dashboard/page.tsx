"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Bars } from "react-loader-spinner";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaBook,
  FaLinkedin,
  FaTwitter,
  FaWallet,
  FaEnvelope,
  FaPlusCircle,
} from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

interface Provider {
  id: string;
  uid: string;
  email: string;
  name: string;
  bio: string;
  linkedin: string;
  twitter?: string;
  avatar: string;
  walletAddress?: string;
}

const DashboardPage = () => {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const providersRef = collection(db, "providers");
          const q = query(providersRef, where("email", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const providerDoc = querySnapshot.docs[0];
            const providerData = {
              id: providerDoc.id,
              ...providerDoc.data(),
            } as Provider;

            setProvider(providerData);
          } else {
            console.warn("Provider data not found for authenticated user.");
          }
        } catch (error) {
          console.error("Error fetching provider data:", error);
        }
      } else {
        // Not authenticated, redirect to auth
        router.push("/auth");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex w-full min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Bars
            height="60"
            width="60"
            color="#22D3EE"
            ariaLabel="bars-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
          <p className="font-mono text-cyan-400 animate-pulse text-sm tracking-widest">LOADING_DASHBOARD_PROTOCOL...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex w-full min-h-[60vh] items-center justify-center">
        <div className="text-lg tracking-wide text-white text-center">
          <p>User node not found.</p>
          <Button onClick={() => router.push('/auth')} className="mt-4" variant="outline">
            Return to Authentication
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4">
      <Card className="w-full border-cyan-400/20 bg-black/40 backdrop-blur-lg text-white rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.1)] overflow-hidden">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
            {/* Left Column - Profile */}
            <div className="md:col-span-1 flex flex-col items-center text-center space-y-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                <Avatar className="h-32 w-32 border-2 border-black relative">
                  <AvatarImage src={provider.avatar} alt={provider.name} className="object-cover" />
                  <AvatarFallback className="bg-zinc-900 text-4xl text-white font-mono">
                    {provider.name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  {provider.name}
                </h1>
                <p className="text-sm font-mono text-cyan-400">@{provider.id}</p>
              </div>

              <Badge
                variant="secondary"
                className="px-4 py-1.5 bg-cyan-950/50 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-900/50"
              >
                <FaBook className="mr-2 h-3 w-3" />
                PROVIDER_NODE
              </Badge>

              <div className="flex gap-4 pt-2">
                {provider.linkedin && (
                  <a
                    href={provider.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 transition-colors hover:text-cyan-400"
                  >
                    <FaLinkedin size={20} />
                  </a>
                )}
                {provider.twitter && (
                  <a
                    href={provider.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 transition-colors hover:text-cyan-400"
                  >
                    <FaTwitter size={20} />
                  </a>
                )}
              </div>
            </div>

            {/* Right Column - Info */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Bio
                </h2>
                <p className="text-slate-300 leading-relaxed text-sm md:text-base">{provider.bio}</p>
              </div>

              <Separator className="bg-white/10" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500 mb-1 flex items-center gap-2">
                    <FaEnvelope /> Contact
                  </h2>
                  <p className="text-slate-300 font-mono text-sm break-all bg-black/30 p-2 rounded border border-white/5 inline-block">
                    {provider.email}
                  </p>
                </div>
              </div>

              {provider.walletAddress && (
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500 mb-1 flex items-center gap-2">
                    <FaWallet /> Wallet Address
                  </h2>
                  <div className="bg-black/40 border border-cyan-500/20 rounded p-3 font-mono text-xs text-cyan-400/80 break-all">
                    {provider.walletAddress}
                  </div>
                </div>
              )}

              <Separator className="bg-white/10" />

              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500 mb-4">
                  Quick Actions
                </h2>
                <Button
                  onClick={() => router.push('/add-course')}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white border-0"
                >
                  <FaPlusCircle className="mr-2" />
                  Add New Course
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;