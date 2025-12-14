"use client";

import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Bars } from "react-loader-spinner";
import { toast } from "sonner";
import { AnimatedBackground } from "@/components/ui/animated-background";

export default function LoggedInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black opacity-50" />
        <Bars
          height="60"
          width="60"
          color="#22D3EE"
          ariaLabel="bars-loading"
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
      <AnimatedBackground />
      <Navbar />
      <div className="pl-20 relative"> {/* Wrapper for padding to offset Navbar */}
        <main className="relative flex items-center justify-center min-h-screen py-8 z-10 w-full">
          {children}
        </main>
      </div>
    </>
  );
}