"use client";

import React, { useState } from "react";
import {
  Settings,
  Download,
  RefreshCw,
  CheckCircle,
  Database,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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

  const networkTypeOptions = [
    { value: "4g-lte", label: "4G LTE", description: "Long Term Evolution" },
    { value: "5g-nsa", label: "5G NSA", description: "Non-Standalone" },
    { value: "5g-sa", label: "5G SA", description: "Standalone" },
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
      window.open(valuesYamlUrl, "_blank");
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

  const isFormValid = selectedSite !== "";

  const getSelectedSiteInfo = () => {
    return siteOptions.find((site) => site.value === selectedSite);
  };

  const getSelectedFrequencyInfo = () => {
    return frequencyOptions.find((freq) => freq.value === frequency);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Site Value Generation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate optimized site configuration values for your network
            deployment
          </p>
        </div>

        {generationComplete && (
          <Button onClick={handleReset} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <span>Site Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure the network site parameters for value generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Site Type */}
              <div className="space-y-2">
                <Label htmlFor="site-type">Site Type</Label>
                <Select onValueChange={setSelectedSite} value={selectedSite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select site type" />
                  </SelectTrigger>
                  <SelectContent>
                    {siteOptions.map((site) => (
                      <SelectItem key={site.value} value={site.value}>
                        <div>
                          <div className="font-medium">{site.label}</div>
                          <div className="text-sm text-gray-500">
                            {site.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Network Type */}
              <div className="space-y-2">
                <Label htmlFor="network-type">Network Type</Label>
                <Select onValueChange={setNetworkType} value={networkType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {networkTypeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">
                            {type.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="frequency">Operating Frequency</Label>
                <Select onValueChange={setFrequency} value={frequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        <div>
                          <div className="font-medium">{freq.label}</div>
                          <div className="text-sm text-gray-500">
                            {freq.band}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bandwidth */}
              <div className="space-y-2">
                <Label htmlFor="bandwidth">Channel Bandwidth (MHz)</Label>
                <Select onValueChange={setBandwidth} value={bandwidth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 MHz</SelectItem>
                    <SelectItem value="20">20 MHz</SelectItem>
                    <SelectItem value="50">50 MHz</SelectItem>
                    <SelectItem value="100">100 MHz</SelectItem>
                    <SelectItem value="200">200 MHz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-orange-600" />
                <span>Advanced Options</span>
              </CardTitle>
              <CardDescription>
                Configure advanced network features and optimizations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="carrier-aggregation">
                    Carrier Aggregation
                  </Label>
                  <p className="text-sm text-gray-500">
                    Enable carrier aggregation for increased throughput
                  </p>
                </div>
                <Switch
                  id="carrier-aggregation"
                  checked={carrierAggregation}
                  onCheckedChange={setCarrierAggregation}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="mimo-config">MIMO Configuration</Label>
                  <p className="text-sm text-gray-500">
                    Enable advanced MIMO antenna configuration
                  </p>
                </div>
                <Switch
                  id="mimo-config"
                  checked={mimoConfiguration}
                  onCheckedChange={setMimoConfiguration}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="optimize-coverage">
                    Optimize for Coverage
                  </Label>
                  <p className="text-sm text-gray-500">
                    Prioritize coverage over capacity in optimization
                  </p>
                </div>
                <Switch
                  id="optimize-coverage"
                  checked={optimizeForCoverage}
                  onCheckedChange={setOptimizeForCoverage}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary and Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-green-600" />
                <span>Configuration Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedSite ? (
                <>
                  <div>
                    <Label className="text-sm font-medium">Site Type</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getSelectedSiteInfo()?.label}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Network</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {
                        networkTypeOptions.find((n) => n.value === networkType)
                          ?.label
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Frequency</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getSelectedFrequencyInfo()?.label} (
                      {getSelectedFrequencyInfo()?.band})
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Bandwidth</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {bandwidth} MHz
                    </p>
                  </div>

                  <div className="pt-2 border-t">
                    <Label className="text-sm font-medium">Features</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {carrierAggregation && (
                        <Badge variant="secondary">CA</Badge>
                      )}
                      {mimoConfiguration && (
                        <Badge variant="secondary">MIMO</Badge>
                      )}
                      {optimizeForCoverage && (
                        <Badge variant="secondary">Coverage</Badge>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Select a site type to see configuration summary
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generation Status */}
          <Card>
            <CardHeader>
              <CardTitle>Generation Status</CardTitle>
            </CardHeader>
            <CardContent>
              {!currentJob ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Ready to generate site values
                  </p>
                  <Button
                    onClick={handleGenerate}
                    disabled={!isFormValid || isGenerating}
                    className="w-full"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Generate Values
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {isGenerating && (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Generating site values...
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {currentJob.progress.toFixed(0)}% complete
                      </p>
                    </div>
                  )}

                  {generationComplete && (
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-4">
                        Site values generated successfully
                      </p>
                      <Button onClick={handleDownload} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download YAML
                      </Button>
                    </div>
                  )}

                  {currentJob.status === "failed" && (
                    <div className="text-center">
                      <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        Generation failed
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {currentJob.error}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SiteValueGeneration;
