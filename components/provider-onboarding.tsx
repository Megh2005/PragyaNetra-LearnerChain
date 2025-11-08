"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InteractiveHoverButton } from "./ui/interactive-hover-button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup, User } from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { connectWallet } from "@/utils/connectWallet";
import { getWalletBalance } from "@/lib/balance";
import { toast } from "sonner";
import {
  FaGoogle,
  FaUser,
  FaWallet,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";

interface ProviderOnboardingProps {
  initialOpen?: boolean;
}

const ProviderOnboarding: React.FC<ProviderOnboardingProps> = ({ initialOpen = false }) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [signer, setSigner] = useState<any>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [open, setOpen] = useState(initialOpen);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const checkUsername = debounce(async (username: string) => {
    if (username.length > 3) {
      const docRef = doc(db, "providers", username);
      const docSnap = await getDoc(docRef);
      setUsernameAvailable(!docSnap.exists());
    } else {
      setUsernameAvailable(null);
    }
  }, 500);

  useEffect(() => {
    checkUsername(username);
  }, [username]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user already exists
      const providersRef = collection(db, "providers");
      const q = query(providersRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.error("This email is already registered as a provider.");
        return;
      }

      setUser(result.user);
      nextStep();
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      toast.error("Google sign-in failed.");
    }
  };

  const handleSaveProfile = async () => {
    if (!linkedin) {
      toast.error("LinkedIn profile is mandatory.");
      return;
    }
    if (!username || usernameAvailable === false) {
      toast.error("Please choose an available username.");
      return;
    }
    if (!user) {
      toast.error("Something went wrong, please try again.");
      return;
    }

    if (bio.length > 150) {
      toast.error("Bio should not exceed 150 characters.");
      return;
    }

    const avatarUrl = `https://robohash.org/${username}`;

    await setDoc(
      doc(db, "providers", username),
      {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        bio,
        linkedin,
        twitter,
        learnBalance: 0,
        avatar: avatarUrl,
      },
      { merge: true }
    );
    nextStep();
  };

  const handleConnectWallet = async () => {
    await connectWallet(setIsConnected, setUserAddress, setSigner);
    if (userAddress) {
      const walletBalance = await getWalletBalance(userAddress);
      setBalance(walletBalance);
    }
  };

  const handleWalletNext = async () => {
    if (isConnected && userAddress && username) {
      await setDoc(
        doc(db, "providers", username),
        {
          walletAddress: userAddress,
        },
        { merge: true }
      );
      onFinish();
    } else {
      toast.error("Please connect your wallet first.");
    }
  };

  const onFinish = () => {
    setOpen(false);
    router.push("/dashboard");
  };

  useEffect(() => {
    if (isConnected && userAddress) {
      getWalletBalance(userAddress).then(setBalance);
    }
  }, [isConnected, userAddress]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <InteractiveHoverButton className="border-2 border-cyan-400">
          Provider
        </InteractiveHoverButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] flex flex-col items-center justify-center bg-black/50 backdrop-blur-lg border-cyan-400 text-white">
        <DialogHeader className="text-center">
          <DialogTitle>Provider Onboarding</DialogTitle>
        </DialogHeader>
        <div className="py-4 w-full">
          {step === 1 && (
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaGoogle className="mr-2" /> Step 1: Authenticate with Google
              </h3>
              <InteractiveHoverButton
                onClick={handleGoogleSignIn}
                className="w-full"
              >
                Sign in with Google
              </InteractiveHoverButton>
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaUser className="mr-2" /> Step 2: Tell us about yourself
              </h3>
              <div className="grid gap-4 w-full">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-black/50 border-cyan-400"
                    />
                    {usernameAvailable === true && (
                      <FaCheckCircle className="absolute right-2 top-2 text-green-500" />
                    )}
                    {usernameAvailable === false && (
                      <FaTimesCircle className="absolute right-2 top-2 text-red-500" />
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Short Bio</Label>
                  <Textarea
                    id="bio"
                    maxLength={100}
                    rows={4}
                    placeholder="Tell us a little bit about yourself"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="bg-black/50 resize-none border-cyan-400"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://www.linkedin.com/in/your-profile"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="bg-black/50 border-cyan-400"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter Profile (Optional)</Label>
                  <Input
                    id="twitter"
                    placeholder="https://twitter.com/your-handle"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="bg-black/50 border-cyan-400"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-4 w-full">
                <InteractiveHoverButton onClick={prevStep}>
                  Previous
                </InteractiveHoverButton>
                <InteractiveHoverButton
                  onClick={handleSaveProfile}
                  disabled={!usernameAvailable}
                >
                  Next
                </InteractiveHoverButton>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaWallet className="mr-2" /> Step 3: Connect your wallet
              </h3>
              <InteractiveHoverButton
                onClick={handleConnectWallet}
                className="w-full"
                disabled={isConnected}
              >
                {isConnected
                  ? `Connected: ${userAddress.substring(
                      0,
                      6
                    )}...${userAddress.substring(userAddress.length - 4)}`
                  : "Connect Wallet"}
              </InteractiveHoverButton>
              {balance && (
                <p className="mt-4 text-lg">Balance: {balance} FLOW</p>
              )}
              <div className="flex justify-between mt-4 w-full">
                <InteractiveHoverButton onClick={prevStep}>
                  Previous
                </InteractiveHoverButton>
                <InteractiveHoverButton onClick={handleWalletNext}>
                  Finish
                </InteractiveHoverButton>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProviderOnboarding;
