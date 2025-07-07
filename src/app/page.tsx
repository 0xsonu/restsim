"use client";

import { useAuth } from "@/contexts/AuthContext";
import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
// import NetworkBackground from "@/components/NetworkBackground";
import { useEffect } from "react";

export default function Home() {
  const { user } = useAuth();

  // Request notification permission on app load
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* <NetworkBackground /> */}
      {user ? <Dashboard /> : <Login />}
    </div>
  );
}
