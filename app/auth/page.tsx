"use client";

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import ProviderOnboarding from "@/components/provider-onboarding";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase"; // Import db
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore"; // Import firestore functions

const AuthPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false); // New state to control onboarding dialog

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, check if provider data exists
        const providersRef = collection(db, "providers");
        const q = query(providersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Provider data found, redirect to dashboard
          router.push("/dashboard");
        } else {
          // User signed in but no provider data, show onboarding
          setShowOnboarding(true);
          setLoading(false);
        }
      } else {
        // No user signed in, show auth options (including manual onboarding trigger)
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-black text-white">Loading...</div>;
  }

  return (
    <div className="relative h-screen">
      <div className="absolute inset-0">
        <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <div className="max-w-4xl text-center">
          <h1 className="mb-8 text-4xl font-bold tracking-loose sm:text-6xl lg:text-7xl text-white">
            Identify <span className="text-sky-400">Yourself </span>As
          </h1>
          <div className="flex my-6 flex-wrap justify-center gap-8">
            <InteractiveHoverButton className="rounded-full px-6 py-3 font-bold text-xl tracking-wider bg-black border-cyan-400">
              <Link href="/explore">Learner</Link>
            </InteractiveHoverButton>
            {/* Pass showOnboarding state to ProviderOnboarding */}
            <ProviderOnboarding initialOpen={showOnboarding} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
