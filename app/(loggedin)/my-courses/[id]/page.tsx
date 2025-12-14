"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FaPlay,
  FaBook,
  FaClock,
  FaUser,
  FaSpinner,
  FaVideo,
  FaLinkedin,
  FaTwitter,
  FaGlobe,
  FaGraduationCap
} from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlowCard } from "@/components/ui/glow-card";
import { NeoCyberButton } from "@/components/ui/neo-cyber-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { updateDoc } from "firebase/firestore";
import { connectWallet } from "@/utils/connectWallet";
import { parseEther, BrowserProvider } from "ethers";
import { TREASURY_ADDRESS, EDIT_COST_FLOW } from "@/utils/constants";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchVideoDetails } from "@/utils/youtube";

interface Course {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  price?: string;
  providerId: string;
  videoLinks: (string | VideoData)[];
}

interface VideoData {
  title: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
  likeCount: string;
  url: string;
}

interface Provider {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  email: string;
}

const CourseDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  // @ts-expect-error React 19 use API
  const { id } = React.use(params);
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab = searchParams.get("tab") || "overview";

  const [course, setCourse] = useState<Course | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Video State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Wallet State
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [signer, setSigner] = useState<any>(null);

  // Check Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Video Modal State
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const [videoDataMap, setVideoDataMap] = useState<{ [key: number]: VideoData }>({});

  // Fetch Course
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!id) return;

        const docRef = doc(db, "courses", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const courseData = { id: docSnap.id, ...docSnap.data() } as Course;
          setCourse(courseData);

          // Process video data: Use cached if available, fetch if string
          if (courseData.videoLinks) {
            const initialDataMap: { [key: number]: VideoData } = {};
            const linksToFetch: string[] = [];
            const indicesToFetch: number[] = [];

            courseData.videoLinks.forEach((link, index) => {
              if (typeof link === 'object' && link !== null) {
                // It's already cached metadata
                initialDataMap[index] = link as VideoData;
              } else if (typeof link === 'string') {
                // It's a legacy string, needs fetching
                linksToFetch.push(link);
                indicesToFetch.push(index);
              }
            });

            setVideoDataMap(initialDataMap);

            if (linksToFetch.length > 0) {
              fetchMissingVideoMetadata(linksToFetch, indicesToFetch, initialDataMap);
            }
          }

          // Fetch Provider
          if (courseData.providerId) {
            fetchProvider(courseData.providerId);
          }
        } else {
          setCourse(null);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const fetchProvider = async (email: string) => {
    try {
      const q = query(collection(db, "providers"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        setProvider({ id: querySnapshot.docs[0].id, ...docData } as Provider);
      }
    } catch (error) {
      console.error("Error fetching provider:", error);
    }
  };

  const handleEditClick = (index: number, currentUrl: string) => {
    setEditingVideoIndex(index);
    setNewVideoUrl(currentUrl);
    setIsEditing(true);

    // Auto-connect wallet if not connected
    if (!isConnected) {
      connectWallet(setIsConnected, setUserAddress, setSigner);
    }
  };

  const handleConfirmEdit = async () => {
    if (!course || editingVideoIndex === null || !signer) {
      toast.error("Initialization Error", { description: "Please ensure wallet is connected." });
      return;
    }

    try {
      setIsProcessingPayment(true);

      // 1. Process Payment
      if (parseFloat(EDIT_COST_FLOW) > 0) {
        const costWei = parseEther(EDIT_COST_FLOW);
        const tx = await signer.sendTransaction({
          to: TREASURY_ADDRESS,
          value: costWei,
        });

        toast.info("Transaction Sent/Processing...", { description: "Waiting for confirmation." });
        await tx.wait();
        toast.success("Payment Successful!", { description: `${EDIT_COST_FLOW} FLOW paid.` });
      }

      // 2. Fetch New Metadata
      let newVideoData: VideoData = {
        url: newVideoUrl,
        title: "Untitled Video",
        thumbnail: "",
        duration: "N/A",
        viewCount: "0",
        likeCount: "0"
      };

      const videoId = getYouTubeVideoId(newVideoUrl);
      if (videoId) {
        const details = await fetchVideoDetails(videoId);
        if (details) {
          newVideoData = {
            url: newVideoUrl,
            title: details.title || "Untitled Video",
            thumbnail: details.thumbnail || "",
            duration: details.duration,
            viewCount: details.viewCount,
            likeCount: "0"
          };
        }
      }

      // 3. Update Firestore
      const updatedVideoLinks = [...course.videoLinks];
      updatedVideoLinks[editingVideoIndex] = newVideoData;

      const courseRef = doc(db, "courses", course.id);
      await updateDoc(courseRef, {
        videoLinks: updatedVideoLinks
      });

      // 4. Update Local State
      setCourse({ ...course, videoLinks: updatedVideoLinks });
      setVideoDataMap(prev => ({
        ...prev,
        [editingVideoIndex]: newVideoData
      }));

      toast.success("Video Updated Successfully");
      setIsEditing(false);
      setEditingVideoIndex(null);

    } catch (error: any) {
      console.error("Edit failed:", error);
      toast.error("Edit Failed", { description: error.message || "Transaction or update failed." });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getYouTubeVideoId = (url: string) => {
    let videoId;
    if (url.includes("youtu.be")) {
      videoId = url.split("/").pop()?.split("?")[0];
    } else if (url.includes("youtube.com")) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get("v");
    }
    return videoId;
  };


  const fetchMissingVideoMetadata = async (links: string[], indices: number[], currentMap: { [key: number]: VideoData }) => {
    const newDataMap = { ...currentMap };

    for (let i = 0; i < links.length; i++) {
      const globalIndex = indices[i];
      const videoId = getYouTubeVideoId(links[i]);

      if (videoId) {
        try {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`
          );
          const data = await response.json();

          if (data.items && data.items.length > 0) {
            const item = data.items[0];
            newDataMap[globalIndex] = {
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
              duration: formatDuration(item.contentDetails.duration),
              viewCount: formatCount(item.statistics.viewCount),
              likeCount: formatCount(item.statistics.likeCount),
              url: links[i],
            };
          }
        } catch (error) {
          console.error(`Error fetching data for video ${globalIndex}:`, error);
        }
      }
    }
    setVideoDataMap(newDataMap);
  };

  const formatCount = (count: string) => {
    if (!count) return "0";
    const num = parseInt(count);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return count;
  };

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return "N/A";

    const hours = (match[1] || "").replace("H", "");
    const minutes = (match[2] || "").replace("M", "");
    const seconds = (match[3] || "").replace("S", "");

    let formatted = "";
    if (hours) formatted += `${hours}h `;
    if (minutes) formatted += `${minutes}m `;
    if (seconds && !hours) formatted += `${seconds}s`;

    return formatted.trim() || "N/A";
  };

  const getTotalDuration = () => {
    const durations = Object.values(videoDataMap).map(v => v.duration);
    if (durations.length === 0) return "Calculating...";

    let totalMinutes = 0;
    durations.forEach((duration) => {
      const hourMatch = duration.match(/(\d+)h/);
      const minuteMatch = duration.match(/(\d+)m/);
      const secondMatch = duration.match(/(\d+)s/);

      if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
      if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);
      if (secondMatch) totalMinutes += Math.ceil(parseInt(secondMatch[1]) / 60);
    });

    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${totalMinutes}m`;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  };

  const handleTabChange = (tab: string) => {
    router.push(`?tab=${tab}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-400 font-mono tracking-widest">LOADING COURSE DATA...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-cyan-900/20 border border-cyan-500/30 rounded-full flex items-center justify-center">
            <FaBook className="text-5xl text-cyan-500/50" />
          </div>
          <h2 className="text-3xl font-bold text-gray-300 mb-2 uppercase tracking-widest">
            Node Not Found
          </h2>
          <p className="text-gray-500 font-mono text-sm">
            THE REQUESTED EDUCATIONAL DATA BLOCK DOES NOT EXIST.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-black/40">
      <div className="max-w-7xl mx-auto">
        {/* Navigation & Header */}
        <div className="space-y-6 mb-10">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 text-cyan-500 hover:text-cyan-400 transition-colors font-mono text-xs tracking-widest uppercase border border-cyan-500/30 px-4 py-2 rounded-full hover:bg-cyan-950/30 w-fit"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Return into the Matrix
          </button>

          <div className="border-b border-cyan-500/20 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight font-mono uppercase tracking-tight">
                  {course.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-cyan-400/80 font-mono">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-xs" />
                    <span className="uppercase tracking-wider">Operator:</span>
                    <span className="text-white">{course.providerId}</span>
                  </div>
                  <span className="text-cyan-500/30">|</span>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-xs" />
                    <span>RUNTIME: {getTotalDuration()}</span>
                  </div>
                </div>
              </div>

              {course.price && (
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-950/30 border border-cyan-500/50 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                    <FaPlay className="text-xs text-cyan-400" />
                    <span className="text-cyan-400 font-bold font-mono text-lg">{course.price} FLOW</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-cyan-500/20">
            {['overview', 'study', 'creator'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-8 py-3 text-sm font-bold uppercase tracking-widest font-mono transition-all border-b-2 ${activeTab === tab
                  ? "border-cyan-500 text-cyan-400 bg-cyan-950/20"
                  : "border-transparent text-slate-500 hover:text-cyan-300 hover:bg-cyan-950/10"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* --- TAB CONTENT --- */}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-12 gap-10 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Sidebar - Poster Image (Portrait) */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-6">
              <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)] relative group">
                {/* Changed aspect ratio to 3/4 for portrait banners */}
                <div className="relative w-full aspect-[3/4]">
                  <Image
                    src={course.bannerUrl}
                    alt={course.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-black/60 text-cyan-400 border-cyan-400/50 backdrop-blur-md font-mono text-xs">
                      ID: {course.id.slice(0, 8)}...
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 space-y-4">
                <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-4 border-b border-cyan-500/20 pb-2">
                  System Metrics
                </h3>
                <div className="flex items-center justify-between group">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Modules</span>
                  <span className="text-sm font-bold text-white font-mono">{course.videoLinks?.length || 0} UNITS</span>
                </div>
                <div className="flex items-center justify-between group">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Status</span>
                  <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-400 h-5">ONLINE</Badge>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-10">
              {/* Description Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-2">
                  <FaBook className="text-cyan-500" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-widest font-mono">
                    Mission Briefing
                  </h2>
                </div>
                <div className="bg-black/20 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                  <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap font-sans">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Video Metadata Preview */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-cyan-500 rounded-sm"></div>
                    <h2 className="text-lg font-bold text-white uppercase tracking-widest font-mono">
                      Content Matrix
                    </h2>
                  </div>
                  <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                    {course.videoLinks?.length} NODES PREVIEW
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-6 bg-black/20 p-6 rounded-xl border border-cyan-900/20 text-center">
                  <p className="col-span-2 text-cyan-500/60 font-mono text-sm uppercase tracking-widest">
                    ACCESS FULL CURRICULUM VIA THE "STUDY" TAB
                  </p>
                  <NeoCyberButton onClick={() => handleTabChange('study')} variant="secondary" className="col-span-2 max-w-sm mx-auto">
                    <FaPlay className="mr-2" /> Launch Study Protocol
                  </NeoCyberButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STUDY TAB - MODULE GRID (User Requested) */}
        {activeTab === 'study' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {course.videoLinks.map((linkOrObj, index) => {
                const metadata = videoDataMap[index];
                const videoUrl = typeof linkOrObj === 'string' ? linkOrObj : linkOrObj.url;

                return (
                  <GlowCard key={index} className="bg-black/40 backdrop-blur-xl group overflow-hidden border-cyan-500/20 hover:border-cyan-500/60 transition-all duration-300">
                    {/* Thumbnail Section */}
                    <div
                      className="relative w-full aspect-video bg-black/50 border-b border-white/10 group-hover:border-cyan-500/30 transition-colors cursor-pointer"
                      onClick={() => setPlayingVideo(videoUrl)}
                    >
                      {metadata?.thumbnail ? (
                        <Image
                          src={metadata.thumbnail}
                          alt={metadata.title || `Module ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                          className="group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FaVideo className="text-4xl text-cyan-500/20" />
                        </div>
                      )}

                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                          <FaPlay className="text-cyan-400 ml-1" />
                        </div>
                      </div>

                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-black/80 text-white font-mono text-xs border border-white/10 backdrop-blur-md">
                          {metadata?.duration || "00:00"}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-4">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-white font-bold text-lg line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors cursor-pointer" onClick={() => setPlayingVideo(videoUrl)}>
                            {metadata?.title || `Module ${index + 1}`}
                          </h3>
                          {/* EDIT BUTTON FOR CREATOR */}
                          {currentUser && course.providerId === currentUser.email && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(index, videoUrl);
                              }}
                              className="ml-2 p-1.5 text-xs bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded hover:bg-amber-500/20 transition-colors uppercase font-mono tracking-widest whitespace-nowrap"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <FaPlay className="text-[10px]" />
                            <span>{metadata?.viewCount || '0'} views</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-pink-500">♥</span>
                            <span>{metadata?.likeCount || '0'} likes</span>
                          </div>
                        </div>
                      </div>

                      <NeoCyberButton
                        onClick={() => setPlayingVideo(videoUrl)}
                        className="w-full text-xs"
                        variant="secondary"
                      >
                        <FaPlay className="mr-2" size={10} /> ACCESS NODE
                      </NeoCyberButton>
                    </div>
                  </GlowCard>
                );
              })}
            </div>

            {/* Video Modal */}
            <Dialog open={!!playingVideo} onOpenChange={(open) => !open && setPlayingVideo(null)}>
              <DialogContent className="max-w-6xl w-[95vw] h-[80vh] p-0 bg-black border-cyan-500/30 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 bg-black/80 border-b border-white/10 flex-shrink-0 flex flex-row items-center justify-between">
                  <DialogTitle className="text-cyan-400 font-mono tracking-widest uppercase text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                    Secure Video Stream
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-grow w-full h-full relative bg-black">
                  {playingVideo && (
                    <iframe
                      src={`${getYouTubeEmbedUrl(playingVideo)}?autoplay=1&modestbranding=1&rel=0`}
                      title="Video Player"
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* EDIT VIDEO MODAL */}
            <Dialog open={isEditing} onOpenChange={(open) => !isProcessingPayment && setIsEditing(open)}>
              <DialogContent className="bg-black/90 border border-cyan-500/30 text-white backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-cyan-400 font-mono uppercase tracking-widest">
                    Edit Video Node
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400 font-mono">YouTube URL</label>
                    <Input
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      className="bg-black/50 border-cyan-500/30 text-white font-mono text-sm"
                      placeholder="https://youtube.com/..."
                    />
                  </div>

                  <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-lg">
                    <div className="flex items-center gap-3 text-amber-400">
                      <FaClock />
                      <span className="font-bold font-mono">COST: {EDIT_COST_FLOW} FLOW</span>
                    </div>
                    <p className="text-xs text-amber-400/70 mt-1 pl-7">
                      Modifying the educational matrix requires computational resources.
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isProcessingPayment}
                    className="border-white/10 hover:bg-white/10 text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmEdit}
                    disabled={isProcessingPayment}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-mono uppercase tracking-widest"
                  >
                    {isProcessingPayment ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm & Pay
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* CREATOR TAB */}
        {activeTab === 'creator' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto py-8">
            <GlowCard className="bg-black/80 backdrop-blur-2xl overflow-hidden relative border-cyan-500/30" borderColors={{ first: "#06b6d4", second: "#8b5cf6" }}>
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

              <div className="flex flex-col md:flex-row gap-10 relative z-10 p-2 md:p-6">
                {/* Left Column: Avatar & Identity */}
                <div className="flex flex-col items-center space-y-6 shrink-0 md:w-1/3">
                  <div className="relative group perspective-1000">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 animate-pulse-slow"></div>
                    <Avatar className="w-40 h-40 md:w-48 md:h-48 border-4 border-black relative shadow-2xl">
                      <AvatarImage src={provider?.avatar} alt={provider?.name} className="object-cover" />
                      <AvatarFallback className="bg-zinc-900 text-6xl text-white font-mono flex items-center justify-center">
                        {provider?.name?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    {/* Status Indicator */}
                    <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-6 h-6 bg-green-500 border-4 border-black rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  </div>

                  <div className="text-center w-full space-y-3">
                    <Badge variant="outline" className="border-cyan-500/50 text-cyan-300 bg-cyan-950/50 font-mono text-xs py-1 px-3 backdrop-blur-md">
                      SYS_ID: {provider?.id.slice(0, 8)}...
                    </Badge>

                    <div className="flex justify-center gap-3 pt-2">
                      {provider?.website && (
                        <a href={provider.website} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-black/40 border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500 hover:scale-110 hover:bg-cyan-950/30 transition-all duration-300 group">
                          <FaGlobe size={18} className="group-hover:rotate-12 transition-transform" />
                        </a>
                      )}
                      {provider?.linkedin && (
                        <a href={provider.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-black/40 border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500 hover:scale-110 hover:bg-cyan-950/30 transition-all duration-300 group">
                          <FaLinkedin size={18} className="group-hover:rotate-12 transition-transform" />
                        </a>
                      )}
                      {provider?.twitter && (
                        <a href={provider.twitter} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-black/40 border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500 hover:scale-110 hover:bg-cyan-950/30 transition-all duration-300 group">
                          <FaTwitter size={18} className="group-hover:rotate-12 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vertical Divider (Desktop) */}
                <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>

                {/* Right Column: Bio & Info */}
                <div className="flex-1 flex flex-col items-center md:items-start space-y-6 text-center md:text-left">
                  <div className="space-y-2 w-full">
                    <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-400 uppercase tracking-tighter drop-shadow-sm">
                      {provider?.name}
                    </h2>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <div className="h-1 w-12 bg-cyan-500 rounded-full"></div>
                      <p className="text-cyan-500 font-mono text-sm tracking-widest uppercase font-bold">
                        Certified Knowledge Architect
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/30 border border-white/5 rounded-2xl p-6 md:p-8 w-full relative group hover:border-cyan-500/20 transition-colors">
                    <FaUser className="absolute top-6 right-6 text-6xl text-white/5 group-hover:text-cyan-500/10 transition-colors" />
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                      Operator Biography
                    </h3>
                    <p className="text-slate-300 leading-8 text-lg font-light">
                      {provider?.bio || "Data unavailable. This operator prefers to remain an enigma in the digital void."}
                    </p>
                  </div>
                </div>
              </div>
            </GlowCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;
