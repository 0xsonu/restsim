"use client";

import React, { useState, useEffect } from "react";
import {
  History as HistoryIcon,
  Download,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Search,
  Filter,
  Database,
  Radio,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore, ProcessingJob } from "@/stores/useAppStore";
import { historyService, HistoryItem } from "@/services/historyService";

const ProcessingHistory: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [filterType, setFilterType] = useState<
    "all" | "chart-build" | "site-values"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "failed" | "running"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");

  const { processingJobs } = useAppStore();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const items = await historyService.getHistory();
      setHistoryItems(items);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const handleDownload = (item: HistoryItem | ProcessingJob) => {
    if ("downloadUrl" in item && item.downloadUrl) {
      const link = document.createElement("a");
      link.href = item.downloadUrl;
      link.target = "_blank";
      link.click();
    }
  };

  const handleClearHistory = async () => {
    if (
      confirm(
        "Are you sure you want to clear all history? This action cannot be undone."
      )
    ) {
      try {
        await historyService.clearHistory();
        setHistoryItems([]);
      } catch (error) {
        console.error("Failed to clear history:", error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "chart-build" || type === "chart" ? (
      <Radio className="h-5 w-5 text-blue-500" />
    ) : (
      <Database className="h-5 w-5 text-purple-500" />
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Combine history items and current processing jobs
  const allItems = [
    ...historyItems,
    ...processingJobs.map((job) => ({
      ...job,
      type: job.type as "chart-build" | "site-values",
    })),
  ];

  const filteredItems = allItems
    .filter((item) => {
      if (filterType !== "all" && item.type !== filterType) return false;
      if (filterStatus !== "all" && item.status !== filterStatus) return false;

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const itemName =
          "name" in item
            ? item.name
            : item.type === "chart-build"
            ? "Helm Chart Build"
            : "Site Values Generation";
        return itemName.toLowerCase().includes(searchLower);
      }

      return true;
    })
    .sort((a, b) => {
      const aDate = "timestamp" in a ? a.timestamp : a.startTime;
      const bDate = "timestamp" in b ? b.timestamp : b.startTime;

      switch (sortBy) {
        case "oldest":
          return aDate.getTime() - bDate.getTime();
        case "name":
          const aName =
            "name" in a
              ? a.name
              : a.type === "chart-build"
              ? "Helm Chart Build"
              : "Site Values Generation";
          const bName =
            "name" in b
              ? b.name
              : b.type === "chart-build"
              ? "Helm Chart Build"
              : "Site Values Generation";
          return aName.localeCompare(bName);
        case "newest":
        default:
          return bDate.getTime() - aDate.getTime();
      }
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
            <HistoryIcon className="h-8 w-8 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Processing History
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Track and manage your chart builds and site value generations
            </p>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Monitor the status of your processing jobs, download completed
          results, and manage your build history.
        </p>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type:
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) =>
                      setFilterType(
                        e.target.value as "all" | "chart-build" | "site-values"
                      )
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="chart-build">Chart Builds</option>
                    <option value="site-values">Site Values</option>
                  </select>
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(
                      e.target.value as
                        | "all"
                        | "completed"
                        | "failed"
                        | "running"
                    )
                  }
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="running">Running</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "newest" | "oldest" | "name")
                  }
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name</option>
                </select>

                <Button
                  onClick={loadHistory}
                  variant="outline"
                  size="sm"
                  className="p-2"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>

                {historyItems.length > 0 && (
                  <Button
                    onClick={handleClearHistory}
                    variant="outline"
                    size="sm"
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Items */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="p-12 text-center">
                <HistoryIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No History Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || filterType !== "all" || filterStatus !== "all"
                    ? "No items match your current filters. Try adjusting your search criteria."
                    : "No processing history available. Start by building a chart or generating site values."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <Card
                key={item.id}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Type Icon */}
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                        {getTypeIcon(item.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {"name" in item
                              ? item.name
                              : item.type === "chart-build"
                              ? "Helm Chart Build"
                              : "Site Values Generation"}
                          </h3>
                          {getStatusIcon(item.status)}
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                            {item.type === "chart-build"
                              ? "Chart Build"
                              : "Site Values"}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {formatDate(
                                  "timestamp" in item
                                    ? item.timestamp
                                    : item.startTime
                                )}
                              </span>
                            </div>
                            {item.status === "running" &&
                              "progress" in item && (
                                <div className="flex items-center space-x-1">
                                  <span>
                                    {Math.round(item.progress)}% complete
                                  </span>
                                </div>
                              )}
                          </div>

                          {item.status === "failed" &&
                            "error" in item &&
                            item.error && (
                              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                {item.error}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {item.status === "completed" &&
                        "downloadUrl" in item &&
                        item.downloadUrl && (
                          <Button
                            onClick={() => handleDownload(item)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </Button>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {allItems.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {allItems.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Items
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {allItems.filter((h) => h.status === "completed").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {allItems.filter((h) => h.type === "chart-build").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Chart Builds
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {allItems.filter((h) => h.type === "site-values").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Site Values
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingHistory;
