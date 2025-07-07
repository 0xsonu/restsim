"use client";

import React, { useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import NewNodeAddition from "@/components/NewNodeAddition";
import SiteValueGeneration from "@/components/SiteValueGeneration";
import History from "@/components/History";
import ProcessingStatusWidget from "@/components/ProcessingStatusWidget";
import { useAppStore } from "@/stores/useAppStore";
import { backgroundProcessor } from "@/services/backgroundProcessor";

const Dashboard: React.FC = () => {
  const currentSection = useAppStore((state) => state.currentSection);
  const setCurrentSection = useAppStore((state) => state.setCurrentSection);

  // Start background processor when dashboard mounts
  useEffect(() => {
    backgroundProcessor.start();

    return () => {
      backgroundProcessor.stop();
    };
  }, []);

  const renderContent = () => {
    switch (currentSection) {
      case "new-node":
        return <NewNodeAddition />;
      case "site-values":
        return <SiteValueGeneration />;
      case "history":
        return <History />;
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="text-6xl">🚧</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This feature is under development and will be available soon.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar
        activeSection={currentSection}
        onSectionChange={setCurrentSection}
      />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>

      {/* Background Processing Status Widget */}
      <ProcessingStatusWidget />
    </div>
  );
};

export default Dashboard;
