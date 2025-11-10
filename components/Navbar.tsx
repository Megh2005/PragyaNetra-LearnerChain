"use client";

import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { FaSignOutAlt, FaTachometerAlt, FaUser } from "react-icons/fa";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import clsx from "clsx";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem("walletBalance");
    router.push("/");
  };

  const navItems = [
    { href: "/dashboard", icon: <FaTachometerAlt size={24} />, label: "Dashboard" },
    { href: "/profile", icon: <FaUser size={24} />, label: "Profile" },
  ];

  return (
    <TooltipProvider>
      <nav className="fixed top-0 left-0 h-screen w-20 bg-black/40 backdrop-blur-lg text-white flex flex-col items-center justify-between py-6 border-r border-cyan-400/20 z-50">
        <div className="flex flex-col items-center space-y-8">
          <div className="text-3xl font-bold text-cyan-400">
            <Link href="/dashboard">P</Link>
          </div>
          <div className="flex flex-col items-center space-y-6">
            {navItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={clsx(
                      "p-3 rounded-full hover:bg-cyan-400/20 transition-colors",
                      {
                        "bg-cyan-400/20 text-cyan-300": pathname === item.href,
                      }
                    )}
                  >
                    {item.icon}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="p-3 rounded-full hover:bg-red-500/20 transition-colors"
              >
                <FaSignOutAlt size={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </nav>
    </TooltipProvider>
  );
};

export default Navbar;
