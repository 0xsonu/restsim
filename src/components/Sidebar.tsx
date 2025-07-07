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
      id: "monitoring",
      label: "Monitoring",
      icon: Activity,
      description: "System monitoring",
      disabled: true,
    },
    {
      id: "deployments",
      label: "Deployments",
      icon: Database,
      description: "Manage deployments",
      disabled: true,
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      description: "Generate reports",
      disabled: true,
    },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      description: "Manage users",
      disabled: true,
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      description: "Security settings",
      disabled: true,
    },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse">
              <Radio className="h-3 w-3 text-white m-0.5" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              RESTSim
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Network Simulation
            </p>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-green-500" : "bg-red-500"
              } animate-pulse`}
            />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {isOnline ? "System Online" : "System Offline"}
            </span>
          </div>
          <div className="text-xs text-gray-500">v2.1.0</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeSection === item.id;
          const isDisabled = item.disabled;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onSectionChange(item.id)}
              disabled={isDisabled}
              className={`
                w-full text-left p-3 rounded-lg transition-all duration-200 group
                ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-sm"
                    : isDisabled
                    ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`
                  p-2 rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400"
                      : isDisabled
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                  }
                `}
                >
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`
                    text-sm font-medium truncate
                    ${
                      isActive
                        ? "text-blue-700 dark:text-blue-300"
                        : isDisabled
                        ? "text-gray-400 dark:text-gray-600"
                        : "text-gray-900 dark:text-white"
                    }
                  `}
                  >
                    {item.label}
                  </div>
                  <div
                    className={`
                    text-xs truncate
                    ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : isDisabled
                        ? "text-gray-400 dark:text-gray-600"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  `}
                  >
                    {item.description}
                  </div>
                </div>
                {isDisabled && (
                  <div className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded">
                    Soon
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <div>RESTSim Platform</div>
          <div>© 2024 Network Solutions</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
