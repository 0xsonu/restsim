"use climport NotificationCenter from '@/components/NotificationCenter';ent";

import React from "react";
import { LogOut, Moon, Sun, Settings, User, RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useServerStatus } from "@/hooks/useServerStatus";
import NotificationCenter from "@/components/NotificationCenter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { isOnline, isLoading, lastChecked, refetch } = useServerStatus();

  const formatLastChecked = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleTimeString();
  };

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="h-6 w-6 p-0"
              >
                <RefreshCw
                  className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            {/* Notifications */}
            <NotificationCenter />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 p-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 p-0">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user?.name || "User"}
                </div>
                <div className="px-2 py-1.5 text-xs text-gray-500">
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Server Status Details */}
        {lastChecked && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Last checked: {formatLastChecked(lastChecked)}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
