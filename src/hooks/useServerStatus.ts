"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface ServerStatus {
  isOnline: boolean;
  isLoading: boolean;
  lastChecked: Date | null;
  refetch: () => void;
}

// Mock server status check - replace with actual endpoint
const checkServerStatus = async (): Promise<boolean> => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    // For demo purposes, randomly return online/offline
    return Math.random() > 0.1; // 90% chance of being online
  } catch {
    return false;
  }
};

export const useServerStatus = (): ServerStatus => {
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const {
    data: isOnline = false,
    isLoading,
    refetch,
  } = useQuery<boolean>({
    queryKey: ["serverStatus"],
    queryFn: checkServerStatus,
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Update last checked time when query succeeds
  useEffect(() => {
    if (!isLoading) {
      setLastChecked(new Date());
    }
  }, [isLoading]);

  return {
    isOnline,
    isLoading,
    lastChecked,
    refetch: () => {
      refetch();
    },
  };
};
