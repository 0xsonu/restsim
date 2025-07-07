"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Settings,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore, ProcessingJob } from "@/stores/useAppStore";
import { historyService, HistoryItem } from "@/services/historyService";

const History: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "chart-build" | "site-values">(
    "all"
  );

  const { processingJobs, removeJob } = useAppStore();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const items = await historyService.getHistory();
      setHistoryItems(items);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (item: HistoryItem | ProcessingJob) => {
    if ("downloadUrl" in item && item.downloadUrl) {
      window.open(item.downloadUrl, "_blank");
    }
  };

  const handleDelete = async (id: string, isProcessingJob = false) => {
    if (isProcessingJob) {
      removeJob(id);
    } else {
      await historyService.removeHistoryItem(id);
      await loadHistory();
    }
  };

  const handleClearHistory = async () => {
    await historyService.clearHistory();
    await loadHistory();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "chart-build":
        return <FileText className="h-4 w-4" />;
      case "site-values":
        return <Settings className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "running":
        return (
          <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        );
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-600">
            Completed
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "running":
        return <Badge variant="secondary">Running</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredHistoryItems = historyItems.filter(
    (item) => filter === "all" || item.type === filter
  );

  const filteredProcessingJobs = processingJobs.filter(
    (job) => filter === "all" || job.type === filter
  );

  const renderItem = (
    item: HistoryItem | ProcessingJob,
    isProcessingJob = false
  ) => (
    <Card key={item.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="mt-1">{getTypeIcon(item.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-sm font-medium truncate">
                  {"name" in item
                    ? item.name
                    : item.type === "chart-build"
                    ? "Helm Chart Build"
                    : "Site Values Export"}
                </h3>
                {getStatusBadge(item.status)}
              </div>

              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDate(
                      "timestamp" in item ? item.timestamp : item.startTime
                    )}
                  </span>
                </div>
                {"size" in item && item.size && <span>{item.size}</span>}
              </div>

              {item.error && (
                <p className="text-xs text-red-600 mt-1">Error: {item.error}</p>
              )}

              {isProcessingJob &&
                "progress" in item &&
                item.progress !== undefined && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.progress.toFixed(0)}% complete
                    </p>
                  </div>
                )}
            </div>
          </div>

          <div className="flex items-center space-x-1 ml-4">
            {getStatusIcon(item.status)}
            {item.downloadUrl && item.status === "completed" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(item)}
                className="h-8 w-8 p-0"
              >
                <Download className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(item.id, isProcessingJob)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Build History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage your processing history and downloads
          </p>
        </div>

        {(historyItems.length > 0 || processingJobs.length > 0) && (
          <Button variant="outline" onClick={handleClearHistory}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        )}
      </div>

      <Tabs
        value={filter}
        onValueChange={(value) =>
          setFilter(value as "all" | "chart-build" | "site-values")
        }
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="chart-build">Chart Builds</TabsTrigger>
          <TabsTrigger value="site-values">Site Values</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-500">Loading history...</p>
            </div>
          ) : (
            <>
              {/* Current Processing Jobs */}
              {filteredProcessingJobs.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Current Jobs
                  </h2>
                  {filteredProcessingJobs.map((job) => renderItem(job, true))}
                </div>
              )}

              {/* Historical Items */}
              {filteredHistoryItems.length > 0 && (
                <div className="space-y-4">
                  {filteredProcessingJobs.length > 0 && (
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      History
                    </h2>
                  )}
                  {filteredHistoryItems.map((item) => renderItem(item, false))}
                </div>
              )}

              {/* Empty State */}
              {filteredProcessingJobs.length === 0 &&
                filteredHistoryItems.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No {filter === "all" ? "" : filter.replace("-", " ")}{" "}
                        items found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {filter === "all"
                          ? "Start by creating a new node or generating site values"
                          : `No ${filter.replace(
                              "-",
                              " "
                            )} operations have been performed yet`}
                      </p>
                      <div className="flex justify-center space-x-4">
                        <Button
                          variant="outline"
                          onClick={() =>
                            useAppStore.getState().setCurrentSection("new-node")
                          }
                        >
                          New Node Addition
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            useAppStore
                              .getState()
                              .setCurrentSection("site-values")
                          }
                        >
                          Site Value Generation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;
