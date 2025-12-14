"use client";

import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Bars } from "react-loader-spinner";
import { getContractBalance } from "@/lib/balance";
import { toast } from "sonner";
import { FaLandmark } from "react-icons/fa";
import Image from "next/image";

export default function LoggedInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [contractBalance, setContractBalance] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        router.push("/auth");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchContractBalance = async () => {
      try {
        const balance = await getContractBalance();
        setContractBalance(balance);
      } catch (error) {
        console.error("Failed to fetch contract balance:", error);
        toast.error("Could not fetch DAO earnings.");
      }
    };

    fetchContractBalance();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]">
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="pl-20"> {/* Wrapper for padding to offset Navbar */}
        {contractBalance && (
          <div className="bg-black/50 backdrop-blur-md border-b border-cyan-400/30 p-2 text-center text-white sticky top-0 z-40">
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm uppercase tracking-wider text-cyan-400/80 flex items-center gap-2">
                <FaLandmark /> DAO Treasury
              </span>
              <div className="text-lg font-light flex items-center gap-2">
                <span className="font-bold">{parseInt(contractBalance).toLocaleString()}</span>
                <Image
                  src="https://res.cloudinary.com/dmbxx03vp/image/upload/v1762624908/flow_khaqxk.svg"
                  alt="FLOW Logo"
                  width={20}
                  height={20}
                />
              </div>
            </div>
          </div>
        )}
        <main className="relative flex items-center justify-center min-h-screen py-8">
          {children}
        </main>
      </div>
    </>
  );
}