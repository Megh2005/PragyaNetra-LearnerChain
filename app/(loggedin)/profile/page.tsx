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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

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
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

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
    <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Non-Editable Info Card */}
      <Card className="border-cyan-400/20 bg-black/40 backdrop-blur-lg text-white">
        <CardHeader>
          <CardTitle className="text-cyan-400">Your Identity</CardTitle>
          <CardDescription>These details are permanent and cannot be changed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-sm text-cyan-400/70">Name</Label>
            <p id="name" className="text-white/90">{provider?.name}</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm text-cyan-400/70">Email</Label>
            <p id="email" className="text-white/90">{provider?.email}</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="username" className="text-sm text-cyan-400/70">Username</Label>
            <p id="username" className="text-white/90">{provider?.id}</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="role" className="text-sm capitalize text-cyan-400/70">Role</Label>
            <p id="role" className="text-white/90">{provider?.role}</p>
          </div>
          {provider?.walletAddress && (
            <div className="space-y-1">
              <Label htmlFor="wallet" className="text-sm text-cyan-400/70">Wallet Address</Label>
              <p id="wallet" className="text-white/90 break-words">{provider.walletAddress}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editable Info Card */}
      <Card className="border-cyan-400/20 bg-black/40 backdrop-blur-lg text-white">
        <CardHeader>
          <CardTitle className="text-cyan-400">Edit Profile</CardTitle>
          <CardDescription>Update your public profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={handleChange}
              className="bg-black/50 border-cyan-400/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="bg-black/50 border-cyan-400/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              value={formData.twitter}
              onChange={handleChange}
              className="bg-black/50 border-cyan-400/30"
            />
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
