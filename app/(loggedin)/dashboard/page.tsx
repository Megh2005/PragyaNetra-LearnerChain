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
import { getWalletBalance } from "@/lib/balance";
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
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const dataFetchLogic = async () => {
        if (user) {
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
            if (providerData.walletAddress) {
              // Always fetch balance, remove sessionStorage
              const newBalance = await getWalletBalance(
                providerData.walletAddress
              );
              setBalance(newBalance);
            }
          } else {
            console.warn("Provider data not found for authenticated user.");
          }
        }
      };

      const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 5000));

      await Promise.all([dataFetchLogic(), minDelayPromise]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // This useEffect also needs to be updated to always fetch balance
  useEffect(() => {
    if (provider?.walletAddress) {
      getWalletBalance(provider.walletAddress).then((newBalance) => {
        setBalance(newBalance);
      });
    }
  }, [provider]);

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center">
        <Bars
          height="60"
          width="60"
          color="#22D3EE"
          ariaLabel="bars-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="text-lg tracking-wide text-white">
          Could not load provider data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="w-full border-cyan-400/20 bg-black/40 backdrop-blur-lg text-white rounded-2xl shadow-2xl shadow-cyan-500/10">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Left Column */}
            <div className="md:col-span-1 flex flex-col items-center text-center space-y-4">
              <Avatar className="h-32 w-32 border-4 border-cyan-400/50 shadow-lg">
                <AvatarImage src={provider.avatar} alt={provider.name} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-purple-600 text-4xl text-white">
                  {provider.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-white">
                  {provider.name}
                </h1>
                <p className="text-sm text-cyan-400/80">@{provider.id}</p>
              </div>
              <Badge
                variant="secondary"
                className="w-fit bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30"
              >
                <FaBook className="mr-2 h-3 w-3" />
                Provider
              </Badge>
              <div className="flex gap-4 pt-2">
                {provider.linkedin && (
                  <a
                    href={provider.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 transition-colors hover:text-cyan-400"
                  >
                    <FaLinkedin size={22} />
                  </a>
                )}
                {provider.twitter && (
                  <a
                    href={provider.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 transition-colors hover:text-cyan-400"
                  >
                    <FaTwitter size={22} />
                  </a>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-cyan-400/80 mb-2">
                  About
                </h2>
                <p className="text-white/90 text-base">{provider.bio}</p>
              </div>
              <Separator className="bg-cyan-400/20" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {balance && (
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-cyan-400/80 flex items-center gap-2">
                      <FaWallet /> Balance
                    </h2>
                    <div className="text-3xl font-light flex items-center gap-2">
                      <span className="font-bold">
                        {parseInt(balance).toLocaleString()}
                      </span>
                      <Image
                        src="https://res.cloudinary.com/dmbxx03vp/image/upload/v1762624908/flow_khaqxk.svg"
                        alt="FLOW Logo"
                        width={28}
                        height={28}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-cyan-400/80 flex items-center gap-2">
                    <FaEnvelope /> Contact
                  </h2>
                  <p className="text-white/90 break-all">{provider.email}</p>
                </div>
              </div>
              {provider.walletAddress && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-cyan-400/80 mb-2 flex items-center gap-2">
                    <FaWallet /> Wallet Address
                  </h2>
                  <p className="text-white/90 font-mono text-sm break-all">
                    {provider.walletAddress}
                  </p>
                </div>
              )}
              <Separator className="bg-cyan-400/20" />
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-cyan-400/80 mb-2">
                  Actions
                </h2>
                <Button onClick={() => router.push('/add-course')} className="bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300">
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