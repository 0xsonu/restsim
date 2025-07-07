"use client";

import React from "react";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Radio,
  Database,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";

const ProcessingStatusWidget: React.FC = () => {
  const { processingJobs } = useAppStore();

  const activeJobs = processingJobs.filter(
    (job) => job.status === "running" || job.status === "pending"
  );

  if (activeJobs.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {activeJobs.map((job) => (
        <div
          key={job.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[300px] max-w-[400px]"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {job.status === "running" ? (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              ) : job.status === "completed" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : job.status === "failed" ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Clock className="h-5 w-5 text-gray-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                {job.type === "chart-build" ? (
                  <Radio className="h-4 w-4 text-blue-500" />
                ) : (
                  <Database className="h-4 w-4 text-purple-500" />
                )}
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {job.type === "chart-build"
                    ? `Building ${job.data.nodeName}`
                    : `Generating ${job.data.siteType} values`}
                </p>
              </div>

              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {job.status === "running" ? "Processing..." : "Queued"}
                  </span>
                  <span>{job.progress.toFixed(0)}%</span>
                </div>
                <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>

              {job.status === "running" && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {job.type === "chart-build"
                    ? "Generating helm chart configuration..."
                    : "Processing site configuration..."}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProcessingStatusWidget;
