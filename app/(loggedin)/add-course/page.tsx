"use client";

import React, { useState, ChangeEvent, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeoCyberButton } from "@/components/ui/neo-cyber-button";
import { GlowCard } from "@/components/ui/glow-card";
import {
  FaPlusCircle,
  FaYoutube,
  FaImage,
  FaCheckCircle,
  FaSpinner,
  FaBook,
  FaInfoCircle,
  FaMoneyBillWave,
  FaEye,
  FaClock
} from "react-icons/fa";
import { toast } from "sonner";
import Image from "next/image";
import { WalletContext } from "@/context/Wallet";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import WalletButton from "@/components/WalletButton";
import { ethers } from "ethers";
import { ABI } from "@/lib/abi";
import { getYouTubeVideoId, fetchVideoDetails, VideoDetails } from "@/utils/youtube";
import { Bars } from "react-loader-spinner";
import { Textarea } from "@/components/ui/textarea";

const AddCoursePage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [videoCount, setVideoCount] = useState<number>(0);
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [videoDetails, setVideoDetails] = useState<{ [key: number]: VideoDetails | null }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const { userAddress, signer } = useContext(WalletContext);
  const router = useRouter();
  const user = auth.currentUser;

  const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("File size must be less than 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.onload = () => {
        setBanner(file);
        setBannerPreview(img.src);
        toast.success("Banner image loaded successfully!");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleVideoCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10) || 0;
    const newCount = Math.max(0, Math.min(count, 50));
    setVideoCount(newCount);
    setVideoLinks(Array(newCount).fill(""));
  };

  const handleVideoLinkChange = (index: number, value: string) => {
    const newLinks = [...videoLinks];
    newLinks[index] = value;
    setVideoLinks(newLinks);

    const videoId = getYouTubeVideoId(value);
    if (videoId) {
      fetchVideoDetails(videoId).then((details) => {
        setVideoDetails((prev) => ({
          ...prev,
          [index]: details,
        }));
      });
    } else {
      setVideoDetails((prev) => ({
        ...prev,
        [index]: null,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!user || !user.email) {
      toast.error("Please log in with an email to create a course.");
      return;
    }

    if (!title || !description || !banner || !price) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (parseFloat(price) <= 0) {
      toast.error("Price must be greater than 0.");
      return;
    }

    if (videoCount < 1) {
      toast.error("A minimum of one video is required to launch a course.");
      return;
    }

    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (videoCount > 0 && videoLinks.some((link) => !urlRegex.test(link))) {
      toast.error("Please provide valid video links.");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Initiating course creation...");
    try {
      // Step 1: Stake
      setUploadProgress("Paying Fee...");
      toast.loading("Paying Fee...", { id: loadingToast });

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error("Contract address not configured");
      }

      if (!signer) {
        throw new Error("Signer not available");
      }

      const contract = new ethers.Contract(contractAddress, ABI, signer);
      const stakeAmount = ethers.parseEther(videoCount.toString());

      const tx = await contract.stake({ value: stakeAmount });
      await tx.wait();

      toast.loading("Payment successful! Uploading banner...", { id: loadingToast });

      // Step 2: Upload banner
      setUploadProgress("Uploading banner image...");

      const formData = new FormData();
      formData.append("file", banner);
      formData.append("folder", "courses");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload banner.");
      }

      const uploadResult = await uploadResponse.json();
      const bannerUrl = uploadResult.secure_url;

      // Step 3: Save to Firebase
      setUploadProgress("Saving course data...");
      toast.loading("Saving course data...", { id: loadingToast });

      const courseData = {
        providerId: user.email,
        title,
        description,
        price: parseFloat(price),
        bannerUrl,
        videoLinks: videoLinks
          .map((link, index) => {
            if (!link.trim()) return null;
            const details = videoDetails[index];
            return {
              url: link,
              title: details?.title || "Untitled Video",
              duration: details?.duration || "N/A",
              viewCount: details?.viewCount || "0",
              thumbnail: details?.thumbnail || "",
              likeCount: "0" // Default as we didn't fetch this in add-course originally, or simple schema update
            };
          })
          .filter((item) => item !== null),
        createdAt: new Date(),
      };

      await addDoc(collection(db, "courses"), courseData);

      toast.success("Course created successfully!", { id: loadingToast });

      // Reset form
      setTitle("");
      setDescription("");
      setBanner(null);
      setBannerPreview(null);
      setVideoCount(0);
      setVideoLinks([]);
      setPrice("");

      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course. Please try again.", {
        id: loadingToast,
      });
    } finally {
      setIsLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black/40 border border-cyan-500/30 rounded-2xl mb-4 shadow-[0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-sm">
            <FaBook className="text-4xl text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Create Your Course
          </h1>
          <p className="text-slate-400 font-mono text-sm tracking-wider max-w-2xl mx-auto">
            INITIATE EDUCATIONAL PROTOCOL: SHARE KNOWLEDGE ON THE CHAIN
          </p>
        </div>

        {/* Wallet Connection Alert */}
        {!userAddress && (
          <div className="max-w-4xl mx-auto mb-8">
            <GlowCard className="bg-red-950/20 border-red-500/30 p-6 flex flex-col md:flex-row items-center gap-6" borderColors={{ first: "#ef4444", second: "#fca5a5" }}>
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <FaInfoCircle className="text-red-400 text-2xl" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-red-400 font-bold uppercase tracking-wider mb-1">Wallet Disconnected</h3>
                <p className="text-gray-400 text-sm">Authentication required. Connect your wallet to deploy a course node.</p>
              </div>
              <WalletButton />
            </GlowCard>
          </div>
        )}

        {/* Main Form Card */}
        <GlowCard
          className="max-w-4xl mx-auto bg-black/60 backdrop-blur-xl border-cyan-500/20 p-0 overflow-hidden"
          borderColors={{ first: "#06b6d4", second: "#8b5cf6" }}
        >
          {/* Progress Steps */}
          <div className="bg-black/40 border-b border-cyan-500/20 px-8 py-6">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-cyan-500/20 border border-cyan-400 flex items-center justify-center font-bold text-cyan-400 text-sm font-mono">
                  01
                </div>
                <span className="text-xs font-bold text-cyan-100 uppercase tracking-widest hidden sm:inline">Details</span>
              </div>
              <div className="h-px flex-1 bg-cyan-800/50 mx-4"></div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-cyan-900/20 border border-cyan-800 flex items-center justify-center font-bold text-cyan-700 text-sm font-mono">
                  02
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">Banner</span>
              </div>
              <div className="h-px flex-1 bg-cyan-800/50 mx-4"></div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-cyan-900/20 border border-cyan-800 flex items-center justify-center font-bold text-cyan-700 text-sm font-mono">
                  03
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">Content</span>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-12">
            {/* Course Details Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-cyan-900/50"></div>
                <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-[0.2em] px-4 border border-cyan-500/30 py-1 rounded-full bg-cyan-950/30">
                  Course Metadata
                </h2>
                <div className="h-px flex-1 bg-cyan-900/50"></div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="course-title" className="text-xs font-bold text-cyan-500 uppercase tracking-widest">
                    Course Title <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="course-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., ADVANCED SOLIDITY PROTOCOLS"
                    disabled={isLoading || !userAddress}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course-description" className="text-xs font-bold text-cyan-500 uppercase tracking-widest">
                    Description <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    id="course-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Input course objectives and curriculum data..."
                    disabled={isLoading || !userAddress}
                    className="min-h-[150px]"
                  />
                  <p className="text-[10px] font-mono text-cyan-700 text-right">{description.length} CHARS</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course-price" className="text-xs font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                    <FaMoneyBillWave /> Price (FLOW) <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="course-price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.0"
                    disabled={isLoading || !userAddress}
                  />
                </div>
              </div>
            </section>

            {/* Banner Upload Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-cyan-900/50"></div>
                <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-[0.2em] px-4 border border-cyan-500/30 py-1 rounded-full bg-cyan-950/30">
                  Visual Asset
                </h2>
                <div className="h-px flex-1 bg-cyan-900/50"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="course-banner" className="text-xs font-bold text-cyan-500 uppercase tracking-widest">
                      Upload Image <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="course-banner"
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        className="file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:bg-cyan-900/40 file:text-cyan-400 file:font-mono file:text-xs hover:file:bg-cyan-800/40 cursor-pointer pt-2"
                        disabled={isLoading || !userAddress}
                      />
                    </div>
                  </div>

                  <div className="bg-cyan-950/20 border border-cyan-900/30 rounded-xl p-4">
                    <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <FaImage /> Specs
                    </p>
                    <ul className="text-[10px] font-mono text-slate-400 space-y-2">
                      <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-500 rounded-full"></div> 1:1 ASPECT RATIO PREFERRED</li>
                      <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-500 rounded-full"></div> MAX SIZE: 3MB</li>
                      <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-500 rounded-full"></div> PNG, JPG, WEBP SUPPORTED</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  {bannerPreview ? (
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
                      <div className="relative">
                        <Image
                          src={bannerPreview}
                          alt="Banner Preview"
                          width={280}
                          height={280}
                          className="rounded-xl object-cover border border-cyan-500/30 shadow-2xl"
                        />
                        <div className="absolute -top-2 -right-2 bg-green-500 text-black rounded-full p-1 shadow-lg border border-green-400">
                          <FaCheckCircle className="text-sm" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-w-[280px] aspect-square border-2 border-dashed border-cyan-900/40 rounded-xl flex items-center justify-center bg-black/40 hover:border-cyan-500/30 transition-all duration-300 group">
                      <div className="text-center p-8">
                        <FaImage className="text-4xl text-cyan-900/50 mb-4 mx-auto group-hover:text-cyan-500/50 transition-colors" />
                        <p className="text-cyan-900 text-xs font-mono group-hover:text-cyan-600 transition-colors">NO_DATA_UPLOADED</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Video Content Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-cyan-900/50"></div>
                <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-[0.2em] px-4 border border-cyan-500/30 py-1 rounded-full bg-cyan-950/30">
                  Content Nodes
                </h2>
                <div className="h-px flex-1 bg-cyan-900/50"></div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="flex-1 max-w-xs space-y-2">
                    <Label htmlFor="video-count" className="text-xs font-bold text-cyan-500 uppercase tracking-widest">
                      Total Modules <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="video-count"
                      type="number"
                      min="1"
                      max="50"
                      value={videoCount}
                      onChange={handleVideoCountChange}
                      disabled={isLoading || !userAddress}
                    />
                  </div>
                  {videoCount > 0 && (
                    <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg px-4 py-3 flex items-center gap-2 mb-1">
                      <FaYoutube className="text-red-500 text-lg" />
                      <p className="text-xs text-purple-300 font-mono">
                        {videoCount} LINKSLOTS ALLOCATED
                      </p>
                    </div>
                  )}
                </div>

                {videoCount > 0 && (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-900/50 scrollbar-track-transparent">
                    {videoLinks.map((link, index) => (
                      <div
                        key={index}
                        className="group bg-black/40 border border-cyan-900/30 rounded-lg p-5 hover:border-cyan-500/30 transition-all hover:bg-cyan-950/10"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Label
                            htmlFor={`video-link-${index}`}
                            className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider"
                          >
                            <span className="text-cyan-700">#{index + 1}</span> Video URL
                          </Label>
                        </div>
                        <Input
                          id={`video-link-${index}`}
                          type="url"
                          value={link}
                          onChange={(e) => handleVideoLinkChange(index, e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          disabled={isLoading || !userAddress}
                        />
                        {videoDetails[index] && (
                          <div className="mt-3 flex items-center gap-4 text-[10px] font-mono text-slate-500 border-t border-white/5 pt-2">
                            <div className="flex items-center gap-1.5">
                              <FaClock className="text-cyan-700" />
                              <span>{videoDetails[index]?.duration}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FaEye className="text-cyan-700" />
                              <span>{videoDetails[index]?.viewCount} views</span>
                            </div>
                            <div className="truncate max-w-[200px] text-cyan-600">
                              {videoDetails[index]?.title}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Upload Progress */}
            {uploadProgress && (
              <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-5 flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-cyan-900/30 flex items-center justify-center border border-cyan-500/50">
                  <FaSpinner className="text-cyan-400 animate-spin text-lg" />
                </div>
                <div>
                  <p className="text-cyan-300 font-bold font-mono text-sm uppercase tracking-wider">{uploadProgress}</p>
                  <p className="text-cyan-700 text-xs font-mono">PROCESSING BLOCKCHAIN TRANSACTION...</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t border-cyan-900/30">
              <NeoCyberButton
                onClick={handleSubmit}
                className="w-full text-lg py-6"
                disabled={isLoading || !userAddress}
                variant="primary"
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <FaSpinner className="animate-spin text-xl" />
                    EXECUTING PROTOCOL...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <FaPlusCircle className="text-xl" />
                    DEPLOY COURSE NODE
                  </span>
                )}
              </NeoCyberButton>

              <p className="text-center text-[10px] font-mono text-cyan-900 mt-4 uppercase tracking-widest">
                FEE REQUIRED: {videoCount} FLOW // SMART CONTRACT VERIFICATION
              </p>
            </div>
          </div>
        </GlowCard>
      </div>
    </div>
  );
};

export default AddCoursePage;