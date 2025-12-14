"use client";

import React, { useState, useEffect, useContext } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { WalletContext } from "@/context/Wallet";
import Link from "next/link";
import { FaPlusCircle } from "react-icons/fa";
import { NeoCyberButton } from "@/components/ui/neo-cyber-button";
import { GlowCard } from "@/components/ui/glow-card";
import { Bars } from "react-loader-spinner";
import { AnimatedBackground } from "@/components/ui/animated-background";

const MyCoursesPage = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userAddress } = useContext(WalletContext);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchCourses = async () => {
      // In a real app, we should probably wait for auth to initialize or check it in a parent
      // For now, if no user, we just stop loading.
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "courses"),
          where("providerId", "==", user.email)
        );
        const querySnapshot = await getDocs(q);
        const coursesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex w-full min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Bars
            height="60"
            width="60"
            color="#22D3EE"
            ariaLabel="bars-loading"
            visible={true}
          />
          <p className="font-mono text-cyan-400 animate-pulse text-sm tracking-widest">
            LOADING_COURSES...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-4">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase mb-2">
          My <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">Courses</span>
        </h1>
        <p className="text-slate-400 font-mono text-sm tracking-wider">
          MANAGE YOUR DECENTRALIZED CURRICULUM
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-cyan-500/20 rounded-2xl bg-black/20 backdrop-blur-sm">
          <p className="text-cyan-400 font-mono text-lg mb-4">NO COURSES DETECTED</p>
          <p className="text-slate-500 max-w-md text-center mb-8">
            You haven't uploaded any content to the node regular yet. Start by creating your first module.
          </p>
          <Link href="/add-course">
            <NeoCyberButton variant="secondary">
              Initialize First Course
            </NeoCyberButton>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <GlowCard
                key={course.id}
                className="p-6 flex flex-col h-full bg-black/40 backdrop-blur-md border border-cyan-500/20 group hover:border-cyan-400/50 transition-all duration-300"
                borderColors={{ first: "#06b6d4", second: "#8b5cf6" }}
              >
                <div className="flex-1">
                  <div className="mb-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-cyan-950/30 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
                      Course Node
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-slate-300 text-sm line-clamp-3 mb-6 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="mt-auto">
                  <Link href={`/my-courses/${course.id}`} className="block w-full">
                    <NeoCyberButton className="w-full text-xs">
                      ACCESS PROTOCOL
                    </NeoCyberButton>
                  </Link>
                </div>
              </GlowCard>
            ))}
          </div>

          <div className="flex justify-center mt-4 mb-20">
            <Link href="/add-course">
              <NeoCyberButton variant="primary">
                <FaPlusCircle className="mr-2" />
                Create New Course
              </NeoCyberButton>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
