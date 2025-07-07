"use client";

import React from "react";
import { X, Download, Eye, Pause, Play, Square } from "lucide-react";
import { useAppStore, ProcessingJob } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProcessingStatusWidget: React.FC = () => {
  const { processingJobs, activeJobId, updateJob, completeJob, removeJob } =
    useAppStore();

  const activeJob = processingJobs.find((job) => job.id === activeJobId);
  const runningJobs = processingJobs.filter((job) => job.status === "running");
  const completedJobs = processingJobs.filter(
    (job) => job.status === "completed"
  );

  if (!activeJob && runningJobs.length === 0 && completedJobs.length === 0) {
    return null;
  }

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const duration = Math.floor((end.getTime() - startTime.getTime()) / 1000);

    if (duration < 60) {
      return `${duration}s`;
    } else if (duration < 3600) {
      return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    } else {
      return `${Math.floor(duration / 3600)}h ${Math.floor(
        (duration % 3600) / 60
      )}m`;
    }
  };

  const handleDownload = (job: ProcessingJob) => {
    if (job.downloadUrl) {
      window.open(job.downloadUrl, "_blank");
    }
  };

  const handlePauseResume = (jobId: string, status: string) => {
    if (status === "running") {
      updateJob(jobId, { status: "pending" });
    } else {
      updateJob(jobId, { status: "running" });
    }
  };

  const handleStop = (jobId: string) => {
    completeJob(jobId, { error: "Job stopped by user" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-80">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Processing Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Active/Running Jobs */}
          {[
            ...runningJobs,
            ...(activeJob && !runningJobs.includes(activeJob)
              ? [activeJob]
              : []),
          ].map((job) => (
            <div key={job.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {job.type === "chart-build"
                      ? "Chart Generation"
                      : "Site Values Export"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDuration(job.startTime)}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePauseResume(job.id, job.status)}
                    className="h-6 w-6 p-0"
                  >
                    {job.status === "running" ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStop(job.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Square className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Progress value={job.progress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{job.progress.toFixed(0)}% complete</span>
                  <span
                    className={`font-medium ${
                      job.status === "running"
                        ? "text-blue-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Completed Jobs (last 2) */}
          {completedJobs.slice(0, 2).map((job) => (
            <div key={job.id} className="space-y-2 border-t pt-2">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {job.type === "chart-build"
                      ? "Chart Generation"
                      : "Site Values Export"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Completed • {formatDuration(job.startTime, job.endTime)}
                  </p>
                </div>
                <div className="flex space-x-1">
                  {job.downloadUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(job)}
                      className="h-6 w-6 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeJob(job.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    job.error ? "bg-red-500" : "bg-green-500"
                  }`}
                />
                <span
                  className={`text-xs ${
                    job.error ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {job.error ? "Failed" : "Success"}
                </span>
                {job.error && (
                  <span className="text-xs text-gray-500 truncate">
                    {job.error}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* View All Button */}
          {processingJobs.length > 3 && (
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  // Navigate to history section
                  useAppStore.getState().setCurrentSection("history");
                }}
              >
                <Eye className="h-3 w-3 mr-1" />
                View All ({processingJobs.length - 3} more)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingStatusWidget;
