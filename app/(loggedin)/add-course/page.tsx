"use client";

import React, { useState, ChangeEvent, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  FaPlusCircle,
  FaYoutube,
  FaImage,
  FaCheckCircle,
  FaSpinner,
  FaBook,
  FaInfoCircle,
  FaMoneyBillWave,
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

const AddCoursePage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [videoCount, setVideoCount] = useState<number>(0);
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
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
        videoLinks: videoLinks.filter((link) => link.trim()),
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl mb-4 border border-cyan-400/30">
            <FaBook className="text-3xl text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-3">
            Create Your Course
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Share your knowledge with learners worldwide. Fill in the details below to launch your course.
          </p>
        </div>

        {/* Wallet Connection Alert */}
        {!userAddress && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4 flex items-center gap-3">
              <FaInfoCircle className="text-cyan-400 text-xl flex-shrink-0" />
              <div className="flex-1">
                <p className="text-cyan-300 font-medium">Connect your wallet to continue</p>
                <p className="text-gray-400 text-sm">You need to connect your wallet before creating a course.</p>
              </div>
              <WalletButton />
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <Card className="max-w-4xl mx-auto border border-cyan-400/30 bg-black/40 backdrop-blur-xl text-white rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden">
          <CardContent className="p-0">
            {/* Progress Steps */}
            <div className="bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border-b border-cyan-400/20 px-8 py-6">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center font-bold text-cyan-400">
                    1
                  </div>
                  <span className="text-sm font-medium text-gray-300 hidden sm:inline">Details</span>
                </div>
                <div className="h-0.5 flex-1 bg-cyan-400/20 mx-4"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-400/50 flex items-center justify-center font-bold text-cyan-400/50">
                    2
                  </div>
                  <span className="text-sm font-medium text-gray-400 hidden sm:inline">Banner</span>
                </div>
                <div className="h-0.5 flex-1 bg-cyan-400/20 mx-4"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-400/50 flex items-center justify-center font-bold text-cyan-400/50">
                    3
                  </div>
                  <span className="text-sm font-medium text-gray-400 hidden sm:inline">Content</span>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-10">
              {/* Course Details Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-cyan-400">Course Details</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="course-title" className="text-base font-medium text-gray-300 flex items-center gap-2">
                      Course Title <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="course-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Advanced Solidity Programming"
                      className="bg-black/50 border-cyan-400/30 focus:border-cyan-400 hover:border-cyan-400/50 h-12 text-base text-white placeholder:text-gray-500 transition-all rounded-lg"
                      disabled={isLoading || !userAddress}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course-description" className="text-base font-medium text-gray-300 flex items-center gap-2">
                      Course Description <span className="text-red-400">*</span>
                    </Label>
                    <textarea
                      id="course-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what students will learn in this course. Include key topics, skills, and outcomes..."
                      className="w-full text-base bg-black/50 border border-cyan-400/30 focus:border-cyan-400 hover:border-cyan-400/50 rounded-lg p-4 min-h-[140px] resize-none text-white placeholder:text-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                      disabled={isLoading || !userAddress}
                    />
                    <p className="text-xs text-gray-500 text-right">{description.length} characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course-price" className="text-base font-medium text-gray-300 flex items-center gap-2">
                      <FaMoneyBillWave /> Course Price (in FLOW) <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="course-price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g., 10"
                      className="bg-black/50 border-cyan-400/30 focus:border-cyan-400 hover:border-cyan-400/50 h-12 text-base text-white placeholder:text-gray-500 transition-all rounded-lg"
                      disabled={isLoading || !userAddress}
                    />
                  </div>
                </div>
              </section>

              {/* Banner Upload Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-cyan-400">Course Banner</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="course-banner" className="text-base font-medium text-gray-300 flex items-center gap-2">
                        Upload Banner <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="course-banner"
                          type="file"
                          accept="image/*"
                          onChange={handleBannerChange}
                          className="bg-black/50 border-cyan-400/30 focus:border-cyan-400 hover:border-cyan-400/50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-cyan-500/20 file:text-cyan-300 file:font-medium hover:file:bg-cyan-500/30 file:cursor-pointer h-12 cursor-pointer transition-all rounded-lg"
                          disabled={isLoading || !userAddress}
                        />
                      </div>
                    </div>

                    <div className="bg-cyan-500/5 border border-cyan-400/20 rounded-xl p-4">
                      <p className="text-sm text-cyan-300 font-medium mb-3 flex items-center gap-2">
                        <FaImage className="text-cyan-400" />
                        Image Requirements
                      </p>
                      <ul className="text-xs text-gray-400 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-cyan-400 mt-0.5">•</span>
                          <span>Aspect ratio: 1:1 (square)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-cyan-400 mt-0.5">•</span>
                          <span>Max file size: 3MB</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-cyan-400 mt-0.5">•</span>
                          <span>Formats: JPG, PNG, WebP</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-cyan-400 mt-0.5">•</span>
                          <span>Recommended: 800x800px minimum</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    {bannerPreview ? (
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                        <div className="relative">
                          <Image
                            src={bannerPreview}
                            alt="Banner Preview"
                            width={280}
                            height={280}
                            className="rounded-2xl object-cover border-2 border-cyan-400/50 shadow-2xl transition-transform group-hover:scale-105"
                          />
                          <div className="absolute -top-2 -right-2 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full p-2.5 shadow-lg">
                            <FaCheckCircle className="text-lg" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full max-w-[280px] aspect-square border-2 border-dashed border-cyan-400/30 rounded-2xl flex items-center justify-center bg-black/20 hover:border-cyan-400/50 transition-all">
                        <div className="text-center p-8">
                          <div className="w-20 h-20 mx-auto mb-4 bg-cyan-500/10 rounded-2xl flex items-center justify-center">
                            <FaImage className="text-4xl text-cyan-400/40" />
                          </div>
                          <p className="text-gray-400 text-sm font-medium">Preview</p>
                          <p className="text-gray-500 text-xs mt-1">Upload to see preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Video Content Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-cyan-400">Course Content</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="flex-1 max-w-xs space-y-2">
                      <Label htmlFor="video-count" className="text-base font-medium text-gray-300 flex items-center gap-2">
                        Number of Videos <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="video-count"
                        type="number"
                        min="1"
                        max="50"
                        value={videoCount}
                        onChange={handleVideoCountChange}
                        className="bg-black/50 border-cyan-400/30 focus:border-cyan-400 hover:border-cyan-400/50 h-12 text-base text-white transition-all rounded-lg"
                        disabled={isLoading || !userAddress}
                      />
                    </div>
                    {videoCount > 0 && (
                      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl px-5 py-3 flex items-center gap-2">
                        <FaYoutube className="text-red-500 text-xl" />
                        <p className="text-sm text-cyan-300 font-medium">
                          {videoCount} video{videoCount !== 1 ? "s" : ""} to add
                        </p>
                      </div>
                    )}
                  </div>

                  {videoCount > 0 && (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
                      {videoLinks.map((link, index) => (
                        <div
                          key={index}
                          className="group bg-black/20 border border-cyan-400/20 rounded-xl p-5 hover:border-cyan-400/40 hover:bg-black/30 transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Label
                              htmlFor={`video-link-${index}`}
                              className="flex items-center gap-2 text-sm font-semibold text-cyan-300"
                            >
                              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                <FaYoutube className="text-red-500" />
                              </div>
                              Video {index + 1}
                            </Label>
                          </div>
                          <Input
                            id={`video-link-${index}`}
                            type="url"
                            value={link}
                            onChange={(e) => handleVideoLinkChange(index, e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="bg-black/50 border-cyan-400/30 focus:border-cyan-400 hover:border-cyan-400/50 h-11 text-sm text-white placeholder:text-gray-500 transition-all rounded-lg"
                            disabled={isLoading || !userAddress}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Upload Progress */}
              {uploadProgress && (
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <FaSpinner className="text-cyan-400 animate-spin text-xl" />
                  </div>
                  <div>
                    <p className="text-cyan-300 font-semibold text-base">{uploadProgress}</p>
                    <p className="text-gray-400 text-sm">Please wait while we process your course...</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6 border-t border-cyan-400/20">
                <Button
                  onClick={handleSubmit}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-[1.02] hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98]"
                  disabled={isLoading || !userAddress}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-3">
                      <FaSpinner className="animate-spin text-xl" />
                      Creating Your Course...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <FaPlusCircle className="text-xl" />
                      Create Course & Publish
                    </span>
                  )}
                </Button>
                <p className="text-center text-xs text-gray-500 mt-3">
                  By creating this course, you agree to pay {videoCount} FLOW for content quality
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddCoursePage;