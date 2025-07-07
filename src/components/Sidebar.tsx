"use client";

import React from "react";
import {
  Plus,
  Settings,
  Database,
  Network,
  Activity,
  FileText,
  Users,
  Shield,
  Cpu,
  Radio,
  History as HistoryIcon,
} from "lucide-react";
import { useServerStatus } from "@/hooks/useServerStatus";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const { isOnline } = useServerStatus();

  const menuItems = [
    {
      id: "new-node",
      label: "New Node Addition",
      icon: Plus,
      description: "Add new network nodes",
    },
    {
      id: "site-values",
      label: "Site Value Generation",
      icon: Settings,
      description: "Generate site configurations",
    },
    {
      id: "history",
      label: "Build History",
      icon: HistoryIcon,
      description: "View past builds and downloads",
    },
    {
      id: "network-topology",
      label: "Network Topology",
      icon: Network,
      description: "View network structure",
      disabled: true,
    },
    {
      id: "performance",
      label: "Performance Analysis",
      icon: Activity,
      description: "Monitor system performance",
      disabled: true,
    },
    {
      id: "traffic-analysis",
      label: "Traffic Analysis",
      icon: Database,
      description: "Analyze network traffic",
      disabled: true,
    },
    {
      id: "user-management",
      label: "User Management",
      icon: Users,
      description: "Manage system users",
      disabled: true,
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      description: "Security settings and logs",
      disabled: true,
    },
    {
      id: "system-logs",
      label: "System Logs",
      icon: FileText,
      description: "View system logs",
      disabled: true,
    },
    {
      id: "hardware-monitor",
      label: "Hardware Monitor",
      icon: Cpu,
      description: "Monitor hardware resources",
      disabled: true,
    },
    {
      id: "rf-analysis",
      label: "RF Analysis",
      icon: Radio,
      description: "Radio frequency analysis",
      disabled: true,
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              SimBot
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Network Simulation
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Main Navigation
        </div>

        {menuItems.slice(0, 3).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const isDisabled =
            item.disabled || (!isOnline && item.id !== "history");

          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-left h-auto p-3",
                isActive &&
                  "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !isDisabled && onSectionChange(item.id)}
              disabled={isDisabled}
            >
              <div className="flex items-center space-x-3 w-full">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {item.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}

        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 mt-8">
          Advanced Features
        </div>

        {menuItems.slice(3).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const isDisabled = item.disabled || !isOnline;

          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-left h-auto p-3",
                isActive &&
                  "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !isDisabled && onSectionChange(item.id)}
              disabled={isDisabled}
            >
              <div className="flex items-center space-x-3 w-full">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {item.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div
          className={`flex items-center space-x-2 text-xs ${
            isOnline ? "text-green-600" : "text-red-600"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-green-500" : "bg-red-500"
            } animate-pulse`}
          />
          <span>Server {isOnline ? "Online" : "Offline"}</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {isOnline
            ? "All systems operational"
            : "Limited functionality available"}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
