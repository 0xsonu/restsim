"use client";

import React, { useEffect, useRef } from "react";
import { Terminal, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogEntry {
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
}

interface LogViewerProps {
  logs: LogEntry[];
  onClear?: () => void;
}

const LogViewer: React.FC<LogViewerProps> = ({ logs, onClear }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [logs]);

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "success":
        return "text-green-400";
      default:
        return "text-gray-300";
    }
  };

  const getLevelBadge = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "[ERROR]";
      case "warning":
        return "[WARN]";
      case "success":
        return "[SUCCESS]";
      default:
        return "[INFO]";
    }
  };

  const downloadLogs = () => {
    const logText = logs
      .map(
        (log) => `${log.timestamp} ${getLevelBadge(log.level)} ${log.message}`
      )
      .join("\n");

    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `processing-logs-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span>Processing Logs</span>
          </CardTitle>
          <div className="flex space-x-2">
            {logs.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={downloadLogs}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {onClear && (
                  <Button variant="outline" size="sm" onClick={onClear}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
          <ScrollArea className="h-64" ref={scrollAreaRef}>
            {logs.length === 0 ? (
              <div className="text-gray-500 italic">
                No logs available. Processing will generate logs here.
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div
                    key={`${log.timestamp}-${index}`}
                    className="flex space-x-2"
                  >
                    <span className="text-gray-500 text-xs">
                      {log.timestamp}
                    </span>
                    <span
                      className={`text-xs font-medium ${getLevelColor(
                        log.level
                      )}`}
                    >
                      {getLevelBadge(log.level)}
                    </span>
                    <span className="text-gray-300 text-xs flex-1">
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        {logs.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {logs.length} log entries
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogViewer;
