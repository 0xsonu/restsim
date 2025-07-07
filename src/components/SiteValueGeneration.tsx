"use client";

import React, { useState } from "react";
import {
  Settings,
  Download,
  RefreshCw,
  CheckCircle,
  Database,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/stores/useAppStore";

const SiteValueGeneration: React.FC = () => {
  const [selectedSite, setSelectedSite] = useState("");
  const [networkType, setNetworkType] = useState("5g-nsa");
  const [frequency, setFrequency] = useState("3.5");
  const [bandwidth, setBandwidth] = useState("100");
  const [carrierAggregation, setCarrierAggregation] = useState(false);
  const [mimoConfiguration, setMimoConfiguration] = useState(false);
  const [optimizeForCoverage, setOptimizeForCoverage] = useState(true);
  const [localJobId, setLocalJobId] = useState<string | null>(null);

  const { processingJobs, startJob, addNotification } = useAppStore();

  // Find the current job
  const currentJob = localJobId
    ? processingJobs.find((j) => j.id === localJobId)
    : null;
  const isGenerating =
    currentJob?.status === "running" || currentJob?.status === "pending";
  const generationComplete = currentJob?.status === "completed";
  const valuesYamlUrl = currentJob?.downloadUrl;

  const siteOptions = [
    {
      value: "urban-dense",
      label: "Urban Dense",
      description: "High-density urban environment",
    },
    {
      value: "urban-sparse",
      label: "Urban Sparse",
      description: "Low-density urban environment",
    },
    {
      value: "suburban",
      label: "Suburban",
      description: "Suburban residential area",
    },
    {
      value: "rural",
      label: "Rural",
      description: "Rural/countryside environment",
    },
    {
      value: "highway",
      label: "Highway",
      description: "Highway corridor coverage",
    },
    {
      value: "indoor",
      label: "Indoor",
      description: "Indoor coverage (mall, office)",
    },
  ];

  const frequencyOptions = [
    { value: "700", label: "700 MHz", band: "Band 28" },
    { value: "850", label: "850 MHz", band: "Band 5" },
    { value: "1800", label: "1800 MHz", band: "Band 3" },
    { value: "2100", label: "2100 MHz", band: "Band 1" },
    { value: "2600", label: "2600 MHz", band: "Band 7" },
    { value: "3.5", label: "3.5 GHz", band: "Band 78" },
  ];

  const handleGenerate = async () => {
    if (!selectedSite) {
      addNotification({
        type: "warning",
        title: "Site Type Required",
        message: "Please select a site type before generating values.",
      });
      return;
    }

    const configData = {
      siteType: selectedSite,
      networkType,
      frequency,
      bandwidth,
      configOptions: {
        carrierAggregation,
        mimoConfiguration,
        optimizeForCoverage,
      },
    };

    try {
      // Start the background job
      const jobId = startJob({
        type: "site-values",
        data: configData,
      });

      setLocalJobId(jobId);

      addNotification({
        type: "info",
        title: "Site Values Generation Started",
        message: `Generating values for ${selectedSite} site configuration`,
        actionType: "site-values",
        actionData: configData,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to start site values generation";
      addNotification({
        type: "error",
        title: "Site Values Generation Failed",
        message: errorMessage,
        actionType: "site-values",
        actionData: configData,
      });
    }
  };

  const handleDownload = () => {
    if (valuesYamlUrl) {
      const link = document.createElement("a");
      link.href = valuesYamlUrl;
      link.download = `site-values-${selectedSite}-${Date.now()}.yaml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setSelectedSite("");
    setNetworkType("5g-nsa");
    setFrequency("3.5");
    setBandwidth("100");
    setCarrierAggregation(false);
    setMimoConfiguration(false);
    setOptimizeForCoverage(true);
    setLocalJobId(null);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Database className="h-8 w-8 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Site Value Generation
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              RESTSim Configuration Builder
            </p>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Generate optimized values.yaml configuration files for different site
          types and network scenarios. Configure your 4G/5G network parameters
          based on deployment environment and requirements.
        </p>
      </div>

      {/* Configuration Form */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-500" />
              <span>Network Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Site Type Selection - Full Left Column */}
              <div className="space-y-4">
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Site Type
                </Label>
                <div className="space-y-2">
                  {siteOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedSite === option.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="siteType"
                        value={option.value}
                        checked={selectedSite === option.value}
                        onChange={(e) => setSelectedSite(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {option.description}
                        </div>
                      </div>
                      {selectedSite === option.value && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Network Parameters - Right Column */}
              <div className="space-y-6">
                {/* Network Type */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Network Type
                  </Label>
                  <Select onValueChange={setNetworkType} value={networkType}>
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4g-lte">4G LTE</SelectItem>
                      <SelectItem value="5g-nsa">
                        5G NSA (Non-Standalone)
                      </SelectItem>
                      <SelectItem value="5g-sa">5G SA (Standalone)</SelectItem>
                      <SelectItem value="dual-mode">
                        Dual Mode (4G/5G)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Frequency Band */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frequency Band
                  </Label>
                  <Select onValueChange={setFrequency} value={frequency}>
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} ({option.band})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bandwidth */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Channel Bandwidth (MHz)
                  </Label>
                  <Select onValueChange={setBandwidth} value={bandwidth}>
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20 MHz</SelectItem>
                      <SelectItem value="40">40 MHz</SelectItem>
                      <SelectItem value="60">60 MHz</SelectItem>
                      <SelectItem value="80">80 MHz</SelectItem>
                      <SelectItem value="100">100 MHz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Advanced Options */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Advanced Options
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={carrierAggregation}
                        onChange={(e) =>
                          setCarrierAggregation(e.target.checked)
                        }
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:focus:ring-blue-400"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Enable carrier aggregation
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={mimoConfiguration}
                        onChange={(e) => setMimoConfiguration(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:focus:ring-blue-400"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Include MIMO configuration
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={optimizeForCoverage}
                        onChange={(e) =>
                          setOptimizeForCoverage(e.target.checked)
                        }
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:focus:ring-blue-400"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Optimize for coverage
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-center space-x-4">
              {!isGenerating && !generationComplete && (
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedSite}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
                >
                  <Zap className="h-5 w-5" />
                  <span>Generate Values.yaml</span>
                </Button>
              )}

              {isGenerating && (
                <Button
                  disabled
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center space-x-2"
                >
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Generating...</span>
                </Button>
              )}

              {generationComplete && valuesYamlUrl && (
                <div className="flex space-x-4">
                  <Button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download Values.yaml</span>
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span>Generate Another</span>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generation Success */}
        {generationComplete && (
          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                Configuration Generated Successfully
              </h3>
            </div>
            <p className="text-green-700 dark:text-green-400 mb-4">
              Your site-specific values.yaml configuration has been generated
              for {siteOptions.find((s) => s.value === selectedSite)?.label}{" "}
              deployment with {networkType.toUpperCase()} network type.
            </p>
            <div className="text-sm text-green-600 dark:text-green-400 space-y-1">
              <p>
                • Frequency:{" "}
                {frequencyOptions.find((f) => f.value === frequency)?.label}
              </p>
              <p>• Bandwidth: {bandwidth} MHz</p>
              <p>• Network Type: {networkType.toUpperCase()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteValueGeneration;
