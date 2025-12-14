"use client";

import React, { useState, useEffect, useContext } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { WalletContext } from "@/context/Wallet";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaPlusCircle } from "react-icons/fa";

const MyCoursesPage = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userAddress } = useContext(WalletContext);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchCourses = async () => {
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
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-7xl w-full relative">
        <div className="absolute top-0 left-0 mt-4 ml-4">
          <Button asChild>
            <Link href="/add-course">
              <FaPlusCircle className="mr-2" /> Create New Course
            </Link>
          </Button>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            My Courses
          </h1>
        </div>

        {courses.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-400 text-lg">You haven't created any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card key={course.id} className="bg-black/60 backdrop-blur-xl text-white rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">{course.description.substring(0, 100)}...</p>
                  <Button asChild>
                    <Link href={`/my-courses/${course.id}`}>View Course</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
