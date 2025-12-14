"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import {
  FaPlay,
  FaBook,
  FaClock,
  FaUser,
  FaSpinner,
  FaVideo,
} from "react-icons/fa";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  price?: string;
  providerId: string;
  videoLinks: string[];
}

const CourseDetailPage = ({ params }: { params: { id: string } }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoDurations, setVideoDurations] = useState<{
    [key: number]: string;
  }>({});

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, "courses", params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const courseData = { id: docSnap.id, ...docSnap.data() } as Course;
          setCourse(courseData);

          // Fetch durations for all videos
          if (courseData.videoLinks) {
            fetchAllVideoDurations(courseData.videoLinks);
          }
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [params.id]);

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

  const fetchAllVideoDurations = async (videoLinks: string[]) => {
    const durations: { [key: number]: string } = {};

    for (let i = 0; i < videoLinks.length; i++) {
      const videoId = getYouTubeVideoId(videoLinks[i]);
      if (videoId) {
        try {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`
          );
          const data = await response.json();

          if (data.items && data.items.length > 0) {
            const duration = data.items[0].contentDetails.duration;
            durations[i] = formatDuration(duration);
          }
        } catch (error) {
          console.error(`Error fetching duration for video ${i}:`, error);
          durations[i] = "N/A";
        }
      }
    }

    setVideoDurations(durations);
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
    const durations = Object.values(videoDurations);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-cyan-500/10 rounded-full flex items-center justify-center">
            <FaBook className="text-5xl text-cyan-400/50" />
          </div>
          <h2 className="text-3xl font-bold text-gray-300 mb-2">
            Course not found
          </h2>
          <p className="text-gray-500">
            The course you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 text-sm font-medium mb-6"
          >
            <span>←</span> Back to Courses
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Course Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Course Banner Card */}
            <div className="bg-black/40 backdrop-blur-xl border border-cyan-400/30 rounded-2xl overflow-hidden shadow-xl shadow-cyan-500/10 sticky top-8">
              <div className="relative w-full aspect-square">
                <Image
                  src={course.bannerUrl}
                  alt={course.title}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <h1 className="text-xl font-bold text-white mb-3">
                    {course.title}
                  </h1>

                  {course.price && (
                    <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-base px-4 py-1.5 hover:from-cyan-600 hover:to-blue-600">
                      {course.price} FLOW
                    </Badge>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-cyan-400/20">
                  <div className="flex items-start gap-3">
                    <FaUser className="text-cyan-400 text-lg mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-1">Created by</p>
                      <p className="text-sm text-gray-200 font-mono break-all">
                        {course.providerId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FaVideo className="text-cyan-400 text-lg flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Total Videos</p>
                      <p className="text-lg font-bold text-white">
                        {course.videoLinks?.length || 0} Lessons
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FaClock className="text-cyan-400 text-lg flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Total Duration</p>
                      <p className="text-lg font-bold text-white">
                        {getTotalDuration()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Description and Videos */}
          <div className="lg:col-span-3 space-y-8">
            {/* Course Description */}
            <div className="bg-black/40 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-8 shadow-xl shadow-cyan-500/10">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyan-400/20">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <FaBook className="text-cyan-400 text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-cyan-400">
                  About This Course
                </h2>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                  {course.description}
                </p>
              </div>
            </div>

            {/* Video Grid */}
            <div className="bg-black/40 backdrop-blur-xl border border-cyan-400/30 rounded-2xl overflow-hidden shadow-xl shadow-cyan-500/10">
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-cyan-400/20 px-8 py-5">
                <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <FaPlay className="text-lg" />
                  </div>
                  Course Content
                </h2>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {course.videoLinks.map((link: string, index: number) => (
                    <div
                      key={index}
                      className="bg-black/30 border border-cyan-400/20 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all group hover:shadow-lg hover:shadow-cyan-500/20"
                    >
                      <div className="aspect-video w-full bg-black relative overflow-hidden">
                        <iframe
                          src={getYouTubeEmbedUrl(link)}
                          title={`Video ${index + 1}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        ></iframe>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-white text-base group-hover:text-cyan-400 transition-colors">
                            Lesson {index + 1}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30 text-xs flex-shrink-0"
                          >
                            {index + 1}/{course.videoLinks.length}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <FaClock className="text-xs text-cyan-400" />
                          <span>{videoDurations[index] || "Loading..."}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
