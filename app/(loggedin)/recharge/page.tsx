"use client";

import React, { useState, useEffect } from "react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Contract, parseEther } from "ethers";
import { ABI } from "@/lib/abi";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { toast } from "sonner";
import { FaCoins, FaArrowDown, FaWallet, FaExchangeAlt } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getWalletBalance } from "@/lib/balance";
import { BrowserProvider } from "ethers";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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

const RechargePage = () => {
  const router = useRouter();
  const [flowAmount, setFlowAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [signer, setSigner] = useState<any>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const providersRef = collection(db, "providers");
        const q = query(providersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const providerDoc = querySnapshot.docs[0];
          const providerData = { id: providerDoc.id, ...providerDoc.data() } as Provider;
          setProvider(providerData);
          setUid(providerData.id);
          if (providerData.walletAddress) {
            getWalletBalance(providerData.walletAddress).then(setBalance);
            const provider = new BrowserProvider(window.ethereum);
            provider.getSigner().then(setSigner);
          }
        } else {
          router.push("/auth");
        }
      } else {
        router.push("/auth");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleRecharge = async () => {
    if (!signer || !uid) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    if (!flowAmount || parseFloat(flowAmount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setIsStaking(true);
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
    const contract = new Contract(contractAddress, ABI, signer);
    const toastId = toast.loading("Processing transaction...");

    try {
      const tx = await contract.stake({
        value: parseEther(flowAmount),
      });
      await tx.wait();
      toast.success("Bridge successful!", { id: toastId });

      const learnAmount = Math.floor(parseFloat(flowAmount)) * 1000;
      const userDocRef = doc(db, "providers", uid);
      const userDoc = await getDoc(userDocRef);
      const currentBalance = userDoc.data()?.learnBalance || 0;

      await setDoc(
        userDocRef,
        {
          learnBalance: currentBalance + learnAmount,
        },
        { merge: true }
      );

      toast.success(`${learnAmount.toLocaleString()} PGN tokens added!`);
      setFlowAmount("");
      if (provider?.walletAddress) {
        getWalletBalance(provider.walletAddress).then(setBalance);
      }
    } catch (error) {
      console.error("Bridge failed:", error);
      toast.error("Transaction failed. Please try again.", { id: toastId });
    } finally {
      setIsStaking(false);
    }
  };

  const learnAmount = (Math.floor(parseFloat(flowAmount)) || 0) * 1000;

  return (
    <div className="min-h-screen w-full bg-black text-white [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-black/70 backdrop-blur-xl border border-cyan-400/30 shadow-2xl text-white">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-400/20 to-purple-600/20 rounded-full border border-cyan-400/30">
              <FaExchangeAlt className="text-cyan-400" size={24} />
            </div>
          </div>
          <h2 className="text-3xl font-light tracking-tight text-center">
            Bridge Assets
          </h2>
          <p className="text-sm text-gray-400 text-center">
            Convert FLOW to PGN tokens
          </p>
        </CardHeader>

        <CardContent className="space-y-6 px-6">
          {balance && (
            <div className="bg-gradient-to-r from-cyan-400/10 via-purple-600/10 to-cyan-400/10 border border-cyan-400/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaWallet className="text-cyan-400" size={16} />
                  <span className="text-sm text-gray-400">
                    Available Balance
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-light">{parseInt(balance)}</p>
                  <p className="text-xs text-gray-500">FLOW</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wider text-gray-400">
                You Pay
              </Label>
              {balance && parseFloat(balance) > 0 && (
                <button
                  onClick={() =>
                    setFlowAmount(Math.floor(parseFloat(balance)).toString())
                  }
                  className="text-xs px-2 py-1 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 rounded border border-cyan-400/30 transition-all"
                >
                  MAX
                </button>
              )}
            </div>
            <div className="relative group">
              <Input
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={flowAmount}
                onChange={(e) => setFlowAmount(e.target.value)}
                className="bg-gradient-to-br from-cyan-400/5 to-purple-600/5 border-cyan-400/30 hover:border-cyan-400/50 focus:border-cyan-400 text-white text-4xl font-light h-20 pr-28 text-left px-6 placeholder:text-gray-700 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-2 bg-black/50 rounded-lg border border-cyan-400/30">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  <Image
                    src="https://res.cloudinary.com/dmbxx03vp/image/upload/v1762624908/flow_khaqxk.svg"
                    alt="FLOW Logo"
                    width={32}
                    height={32}
                  />
                </div>
                <span className="font-medium">FLOW</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-gray-400">
              You Receive
            </Label>
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-500/5 to-yellow-600/5 border border-yellow-500/30 text-white text-4xl font-light h-24 rounded-xl flex items-center px-6 pr-32 shadow-inner">
                <span
                  className={learnAmount > 0 ? "text-white" : "text-gray-700"}
                >
                  {learnAmount > 0 ? learnAmount.toLocaleString() : "0"}
                </span>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-2 bg-black/50 rounded-lg border border-yellow-500/30">
                <FaCoins className="text-yellow-500" size={24} />
                <span className="font-medium">PGN</span>
              </div>
            </div>
          </div>

          
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-2">
          <Button
            onClick={handleRecharge}
            className="w-full text-lg h-14 font-light tracking-wide"
            disabled={isStaking || !flowAmount || parseFloat(flowAmount) <= 0}
          >
            {isStaking ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FaExchangeAlt />
                Bridge Tokens
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RechargePage;
