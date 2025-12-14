"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Bars } from "react-loader-spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlowCard } from "@/components/ui/glow-card";
import { NeoCyberButton } from "@/components/ui/neo-cyber-button";
import { toast } from "sonner";
import { FaUserEdit, FaSave, FaLinkedin, FaTwitter, FaFingerprint } from "react-icons/fa";

interface Provider {
  id: string;
  role: string;
  uid: string;
  email: string;
  name: string;
  bio: string;
  linkedin: string;
  twitter?: string;
  walletAddress?: string;
}

const ProfilePage = () => {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({
    bio: "",
    linkedin: "",
    twitter: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
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
          setFormData({
            bio: providerData.bio,
            linkedin: providerData.linkedin,
            twitter: providerData.twitter || "",
          });
        } else {
          console.warn("Provider data not found for authenticated user.");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!provider) return;
    setIsSaving(true);
    try {
      const providerRef = doc(db, "providers", provider.id);
      await updateDoc(providerRef, {
        bio: formData.bio,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
      });
      toast.success("Profile updated successfully!", { description: "Your digital identity has been synchronized." });
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast.error("Failed to update profile.", { description: "Network error. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

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
          <p className="font-mono text-cyan-400 animate-pulse text-sm tracking-widest">LOADING_IDENTITY_MATRIX...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex w-full min-h-[60vh] items-center justify-center">
        <div className="text-lg tracking-wide text-white font-mono uppercase">
          <span className="text-red-500 mr-2">Error:</span>
          Could not load provider data.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl w-full py-10 px-4">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tighter mb-2">
          Identity Configuration
        </h1>
        <div className="flex items-center justify-center md:justify-start gap-2 text-cyan-500/60 font-mono text-sm uppercase tracking-widest">
          <FaFingerprint size={14} />
          <span>Manage Your Digital Presence</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Non-Editable Info Card */}
        <GlowCard
          className="border-cyan-400/20 bg-black/60 backdrop-blur-lg p-0 h-full"
          borderColors={{ first: "#06b6d4", second: "#22d3ee" }}
        >
          <div className="p-6 border-b border-cyan-500/20 bg-cyan-950/20">
            <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <span className="w-2 h-6 bg-cyan-500 rounded-sm"></span>
              Core Identity
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1 opacity-70">
              IMMUTABLE SYSTEM PARAMETERS
            </p>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-2 group">
              <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600 group-hover:text-cyan-400 transition-colors">Name</Label>
              <p id="name" className="text-white text-lg font-bold tracking-tight border-b border-white/10 pb-2 transition-colors group-hover:border-cyan-500/30">{provider?.name}</p>
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600 group-hover:text-cyan-400 transition-colors">Contact Protocol</Label>
              <p id="email" className="text-slate-300 font-mono text-sm break-all">{provider?.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 group">
                <Label htmlFor="username" className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600 group-hover:text-cyan-400 transition-colors">System ID</Label>
                <p id="username" className="text-slate-300 font-mono text-xs">{provider?.id.slice(0, 12)}...</p>
              </div>
              <div className="space-y-2 group">
                <Label htmlFor="role" className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600 group-hover:text-cyan-400 transition-colors">Designation</Label>
                <div className="inline-flex">
                  <span className="text-xs font-bold px-2 py-1 rounded bg-purple-900/40 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                    {provider?.role}
                  </span>
                </div>
              </div>
            </div>

            {provider?.walletAddress && (
              <div className="space-y-2 group">
                <Label htmlFor="wallet" className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600 group-hover:text-cyan-400 transition-colors">Wallet Hash</Label>
                <div className="bg-black/40 p-3 rounded-lg border border-white/10 font-mono text-[10px] text-slate-400 break-all group-hover:border-cyan-500/30 transition-colors">
                  {provider.walletAddress}
                </div>
              </div>
            )}
          </div>
        </GlowCard>

        {/* Editable Info Card */}
        <GlowCard
          className="border-purple-400/20 bg-black/60 backdrop-blur-lg p-0 h-full"
          borderColors={{ first: "#7c3aed", second: "#a78bfa" }}
        >
          <div className="p-6 border-b border-purple-500/20 bg-purple-950/10">
            <h2 className="text-xl font-bold text-purple-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <FaUserEdit />
              Editable Data
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1 opacity-70">
              UPDATE PUBLIC VISIBILITY SETTINGS
            </p>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-widest text-purple-300">Biography</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Enter your professional summary..."
                className="bg-black/50 border-purple-500/20 text-white min-h-[120px] focus:border-purple-500/60 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 pb-2">Social Uplinks</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-purple-300 font-bold uppercase tracking-wider">
                    <FaLinkedin /> LinkedIn
                  </div>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/..."
                    className="bg-black/50 border-purple-500/20 text-white text-xs font-mono h-9 focus:border-purple-500/60 focus:ring-purple-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-purple-300 font-bold uppercase tracking-wider">
                    <FaTwitter /> Twitter / X
                  </div>
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="https://twitter.com/..."
                    className="bg-black/50 border-purple-500/20 text-white text-xs font-mono h-9 focus:border-purple-500/60 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <NeoCyberButton
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-6"
                variant="primary"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <Bars height="20" width="20" color="white" /> SAVING...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FaSave /> SAVE CHANGES
                  </span>
                )}
              </NeoCyberButton>
            </div>
          </div>
        </GlowCard>
      </div>
    </div>
  );
};

export default ProfilePage;
