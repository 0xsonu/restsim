"use client";

import React from "react";
import { LogOut, Moon, Sun, Settings, User, RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useServerStatus } from "@/hooks/useServerStatus";
import NotificationCenter from "@/components/NotificationCenter";

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { isOnline, isLoading, lastChecked, refetch } = useServerStatus();

  const formatLastChecked = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleTimeString();
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              RESTSim Network Simulation Platform
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Server Status */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                {isLoading ? (
                  <RefreshCw className="h-3 w-3 text-gray-500 animate-spin" />
                ) : (
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isOnline
                        ? "bg-green-500 animate-pulse"
                        : "bg-red-500 animate-pulse"
                    }`}
                  />
                )}
                <span
                  className={`text-xs font-medium ${
                    isOnline
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {isLoading ? "Checking..." : isOnline ? "Online" : "Offline"}
                </span>
              </div>
              <button
                onClick={() => refetch()}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title={`Last checked: ${formatLastChecked(lastChecked)}`}
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>

            {/* Notifications */}
            <NotificationCenter />

            {/* User Info */}
            <div className="flex items-center space-x-3 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Administrator
                </div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>

            {/* Settings */}
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <Settings className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 transition-colors group"
            >
              <LogOut className="h-5 w-5 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
