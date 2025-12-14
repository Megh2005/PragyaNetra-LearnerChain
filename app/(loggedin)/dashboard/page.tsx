"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Bars } from "react-loader-spinner";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaBook,
  FaLinkedin,
  FaTwitter,
  FaWallet,
  FaEnvelope,
  FaPlusCircle,
} from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlowCard } from "@/components/ui/glow-card";
import { Badge } from "@/components/ui/badge";
import { NeoCyberButton } from "@/components/ui/neo-cyber-button";
import { Separator } from "@/components/ui/separator";

interface Provider {
  id: string;
  uid: string;
  email: string;
  name: string;
  bio: string;
  linkedin: string;
  twitter?: string;
  avatar: string;
  walletAddress?: string;
}

const DashboardPage = () => {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
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

            // Fetch Courses
            const coursesRef = collection(db, "courses");
            const coursesQuery = query(coursesRef, where("providerId", "==", user.email));
            const coursesSnapshot = await getDocs(coursesQuery);

            const fetchedCourses = coursesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setCourses(fetchedCourses);

          } else {
            console.warn("Provider data not found for authenticated user.");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        // Not authenticated, redirect to auth
        router.push("/auth");
      }
      setLoading(false);
      setCoursesLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

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
          <p className="font-mono text-cyan-400 animate-pulse text-sm tracking-widest">LOADING_DASHBOARD_PROTOCOL...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex w-full min-h-[60vh] items-center justify-center">
        <div className="text-lg tracking-wide text-white text-center">
          <p>User node not found.</p>
          <NeoCyberButton onClick={() => router.push('/auth')} className="mt-4" variant="secondary">
            Return to Authentication
          </NeoCyberButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        {/* Left Column - Profile Identity */}
        <div className="lg:col-span-4">
          <GlowCard
            className="flex flex-col items-center text-center space-y-6 bg-black/60 backdrop-blur-xl border-cyan-500/30 p-8"
            borderColors={{ first: "#06b6d4", second: "#8b5cf6" }}
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500 animate-pulse-slow"></div>
              <Avatar className="h-40 w-40 border-4 border-black relative shadow-2xl">
                <AvatarImage src={provider.avatar} alt={provider.name} className="object-cover" />
                <AvatarFallback className="bg-zinc-900 text-5xl text-white font-mono flex items-center justify-center">
                  {provider.name?.[0]}
                </AvatarFallback>
              </Avatar>
              {/* Status Indicator */}
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-black rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            </div>

            <div className="space-y-2 w-full">
              <h1 className="text-2xl font-bold text-white tracking-tight uppercase">
                {provider.name}
              </h1>
              <p className="text-xs font-mono text-cyan-400 bg-cyan-950/30 py-1 px-3 rounded-full inline-block border border-cyan-500/20">
                ID: {provider.id}
              </p>
            </div>

            <Badge
              variant="secondary"
              className="px-6 py-2 bg-gradient-to-r from-cyan-950/50 to-purple-950/50 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all uppercase tracking-widest text-[10px]"
            >
              <FaBook className="mr-2 h-3 w-3" />
              PROVIDER_NODE
            </Badge>

            <div className="flex gap-4 pt-4 border-t border-cyan-500/10 w-full justify-center">
              {provider.linkedin && (
                <a
                  href={provider.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-cyan-950/20 border border-cyan-500/20 text-slate-400 hover:text-cyan-400 hover:border-cyan-500 hover:scale-110 hover:bg-cyan-900/30 transition-all duration-300 group shadow-[0_0_15px_rgba(6,182,212,0.05)]"
                >
                  <FaLinkedin size={18} className="group-hover:rotate-12 transition-transform" />
                </a>
              )}
              {provider.twitter && (
                <a
                  href={provider.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-cyan-950/20 border border-cyan-500/20 text-slate-400 hover:text-cyan-400 hover:border-cyan-500 hover:scale-110 hover:bg-cyan-900/30 transition-all duration-300 group shadow-[0_0_15px_rgba(6,182,212,0.05)]"
                >
                  <FaTwitter size={18} className="group-hover:rotate-12 transition-transform" />
                </a>
              )}
            </div>
          </GlowCard>

          <div className="mt-6">
            <NeoCyberButton
              onClick={() => router.push('/add-course')}
              className="w-full text-base py-6 group"
              variant="primary"
            >
              <span className="flex items-center gap-3">
                <FaPlusCircle className="text-xl group-hover:rotate-90 transition-transform duration-500" />
                INITIATE NEW COURSE
              </span>
            </NeoCyberButton>
          </div>
        </div>

        {/* Right Column - Data & Metrics */}
        <div className="lg:col-span-8 space-y-6">
          <GlowCard
            className="bg-black/60 backdrop-blur-xl border-cyan-500/20 p-8 h-full relative overflow-hidden"
            borderColors={{ first: "#8b5cf6", second: "#06b6d4" }}
          >
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

            <div className="space-y-8 relative z-10">
              {/* Bio Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-500/50"></div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-2 px-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                    BioData
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-2xl p-6 backdrop-blur-sm relative group hover:border-cyan-500/20 transition-colors">
                  <p className="text-slate-300 leading-relaxed text-sm md:text-lg font-light font-sans">
                    {provider.bio || "No biographical data available in the system."}
                  </p>
                </div>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 mb-2">
                    <FaEnvelope className="text-cyan-600" /> Comm Link
                  </h2>
                  <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-4 group hover:bg-cyan-950/30 transition-colors">
                    <p className="text-cyan-100 font-mono text-xs break-all">
                      {provider.email}
                    </p>
                  </div>
                </div>

                {provider.walletAddress && (
                  <div className="space-y-3">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 mb-2">
                      <FaWallet className="text-purple-500" /> Wallet Hash
                    </h2>
                    <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-4 group hover:bg-purple-950/30 transition-colors">
                      <p className="text-purple-200 font-mono text-xs break-all">
                        {provider.walletAddress}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </GlowCard>
        </div>
      </div>

      <Separator className="my-12 bg-cyan-500/20" />

      {/* Created Courses Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-500/50"></div>
          <h2 className="text-2xl font-bold uppercase tracking-[0.2em] text-white flex items-center gap-3">
            <FaBook className="text-cyan-400" />
            CREATED_COURSES
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-500/50"></div>
        </div>

        {coursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-black/40 border border-cyan-500/10 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <GlowCard
                key={course.id}
                className="bg-black/80 backdrop-blur-xl overflow-hidden flex flex-col h-full border-cyan-500/20 group hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-500"
                borderColors={{ first: "#a21caf", second: "#3b82f6" }}
              >
                {/* Image Section */}
                <div className="relative aspect-video w-full overflow-hidden border-b border-cyan-500/10">
                  {course.bannerUrl ? (
                    <img
                      src={course.bannerUrl}
                      alt={course.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900/50 flex items-center justify-center text-slate-700">
                      <FaBook size={32} />
                    </div>
                  )}
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-2 right-2">
                     <Badge className="bg-black/60 backdrop-blur-md border border-cyan-500/30 text-cyan-300 font-mono text-[10px] tracking-wider uppercase px-2 py-0.5">
                        {course.price ? `${course.price} FLOW` : "FREE"}
                     </Badge>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col relative">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors line-clamp-2 uppercase tracking-tight">
                      {course.title}
                    </h3>
                  </div>

                  <p className="text-sm text-slate-400 line-clamp-3 mb-6 font-light leading-relaxed flex-1">
                    {course.description}
                  </p>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                        Protocol #{course.id.slice(0, 4)}
                    </span>
                    <NeoCyberButton
                      onClick={() => router.push(`/my-courses/${course.id}`)}
                      className="text-[10px] py-2 px-4 h-auto min-h-0"
                    >
                      ACCESS NODE
                    </NeoCyberButton>
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-black/20 border border-dashed border-cyan-500/20 rounded-3xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-cyan-950/30 flex items-center justify-center mb-2">
                <FaBook className="text-4xl text-cyan-500/50" />
              </div>
              <h3 className="text-xl font-bold text-slate-300 uppercase tracking-widest">No Courses Found</h3>
              <p className="text-slate-500 max-w-md">You haven't initialized any course protocols yet.</p>
              <NeoCyberButton
                onClick={() => router.push('/add-course')}
                variant="secondary"
                className="mt-4"
              >
                CREATE FIRST COURSE
              </NeoCyberButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;