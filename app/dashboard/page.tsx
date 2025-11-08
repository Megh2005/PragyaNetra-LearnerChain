"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Bars } from "react-loader-spinner";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  FaUser,
  FaBook,
  FaCoins,
  FaSignOutAlt,
  FaLinkedin,
  FaTwitter,
  FaWallet,
  FaEnvelope,
} from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getWalletBalance } from "@/lib/balance";
import { toast } from "sonner";

interface Provider {
  id: string;
  uid: string;
  email: string;
  name: string;
  bio: string;
  linkedin: string;
  twitter?: string;
  learnBalance: number;
  avatar: string;
  walletAddress?: string;
}

const DashboardPage = () => {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    let authCheckCompleted = false;
    let minTimeElapsed = false;

    const timer = setTimeout(() => {
      minTimeElapsed = true;
      if (authCheckCompleted) {
        setLoading(false);
      }
    }, 5000); // 5 seconds

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
            getWalletBalance(providerData.walletAddress).then(setBalance);
          }
        } else {
          router.push("/auth");
        }
      } else {
        router.push("/auth");
      }
      authCheckCompleted = true;
      if (minTimeElapsed) {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [router]);

  useEffect(() => {
    if (provider?.walletAddress) {
      getWalletBalance(provider.walletAddress).then(setBalance);
    }
  }, [provider]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleRechargeRedirect = () => {
    router.push("/recharge");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]">
        <div className="text-lg tracking-wide">
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
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]">
        <div className="text-lg tracking-wide">No provider data found.</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-4 md:p-8">
      <div className="absolute inset-0">
        <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      </div>
      <div className="relative mx-auto max-w-6xl space-y-6">
        {/* Profile Card */}
        <Card className="border-cyan-400/20 bg-black/40 backdrop-blur-lg">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              {/* Avatar */}
              <Avatar className="h-24 w-24 border-2 border-cyan-400/50">
                <AvatarImage src={provider.avatar} alt={provider.name} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-purple-600 text-2xl text-white">
                  {provider.name?.[0]}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-3xl font-bold text-white">
                      {provider.name}
                    </h1>
                    <Badge
                      variant="secondary"
                      className="w-fit bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30"
                    >
                      <FaBook className="mr-1 h-3 w-3" />
                      Provider
                    </Badge>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-cyan-400/70">
                    <FaEnvelope className="h-3 w-3" />
                    {provider.email}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-cyan-400/70">
                    <FaUser className="h-3 w-3" />
                    Username: {provider.id}
                  </p>
                  {provider.walletAddress && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-cyan-400/70">
                      <FaWallet className="h-3 w-3" />
                      Wallet: {provider.walletAddress}
                    </p>
                  )}
                </div>

                <p className="text-white/80">{provider.bio}</p>

                {/* Social Links */}
                <div className="flex gap-3">
                  {provider.linkedin && (
                    <a
                      href={provider.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 transition-colors hover:text-cyan-400"
                    >
                      <FaLinkedin size={20} />
                    </a>
                  )}
                  {provider.twitter && (
                    <a
                      href={provider.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 transition-colors hover:text-cyan-400"
                    >
                      <FaTwitter size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* LEARN Balance */}
          <Card className="border-cyan-400/20 bg-black/40 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-400">
                <FaCoins />
                PGN Balance
              </CardTitle>
              <CardDescription className="text-white/60">
                Your token balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">
                {provider.learnBalance.toLocaleString()}
              </div>
              <p className="mt-1 text-sm text-white/50">Tokens</p>
            </CardContent>
          </Card>

          {/* FLOW Balance */}
          {balance && (
            <Card className="border-cyan-400/20 bg-black/40 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-400">
                  <FaWallet />
                  FLOW Balance
                </CardTitle>
                <CardDescription className="text-white/60">
                  Your wallet balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white">
                  {parseInt(balance).toLocaleString()}
                </div>
                <p className="mt-1 text-sm text-white/50">FLOW</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions Card */}
        <Card className="border-cyan-400/20 bg-black/40 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex flex-col gap-3 md:flex-row">
              <Button
                onClick={handleRechargeRedirect}
                className="flex-1 bg-white text-black hover:bg-gray-300"
              >
                <FaCoins className="mr-2" />
                Bridge Tokens
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
              >
                <FaSignOutAlt className="mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;