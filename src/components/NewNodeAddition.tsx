"use client";

import React, { useState, useEffect } from "react";
import FileUpload from "@/components/FileUpload";
import ProcessingSteps from "@/components/ProcessingSteps";
import LogViewer from "@/components/LogViewer";
import {
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Radio,
  Wifi,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/stores/useAppStore";

interface LogEntry {
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
}

interface Step {
  id: string;
  title: string;
  description: string;
  status: "pending" | "running" | "completed" | "error";
}

interface QuestionnaireAnswers {
  nodeName: string;
  dataType: string;
}

const NewNodeAddition: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<
    "questionnaire" | "upload" | "processing"
  >("questionnaire");
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    nodeName: "",
    dataType: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [localJobId, setLocalJobId] = useState<string | null>(null);

  const { processingJobs, startJob } = useAppStore();

  // Find the current job
  const currentJob = localJobId
    ? processingJobs.find((j) => j.id === localJobId)
    : null;
  const isProcessing =
    currentJob?.status === "running" || currentJob?.status === "pending";
  const processingComplete = currentJob?.status === "completed";
  const helmChartUrl = currentJob?.downloadUrl;

  const [steps, setSteps] = useState<Step[]>([
    {
      id: "1",
      title: "Configuration Validation",
      description: "Validating node configuration and questionnaire data",
      status: "pending",
    },
    {
      id: "2",
      title: "File Processing",
      description: "Processing uploaded recording.zip file structure",
      status: "pending",
    },
    {
      id: "3",
      title: "Network Topology Analysis",
      description: "Analyzing 4G/5G network topology and requirements",
      status: "pending",
    },
    {
      id: "4",
      title: "Data Type Integration",
      description: `Configuring data collection parameters`,
      status: "pending",
    },
    {
      id: "5",
      title: "Node Integration",
      description: `Integrating node into existing network topology`,
      status: "pending",
    },
    {
      id: "6",
      title: "Helm Chart Generation",
      description: "Building custom helm chart with new node configuration",
      status: "pending",
    },
    {
      id: "7",
      title: "Validation & Testing",
      description: "Running validation tests on generated helm chart",
      status: "pending",
    },
    {
      id: "8",
      title: "Package & Finalize",
      description: "Packaging final helm chart for deployment",
      status: "pending",
    },
  ]);

  // Data type options
  // const dataTypeOptions = [
  //   { name: "PM_STATISTICAL", value: "PM_STATISTICAL" },
  //   { name: "PM_STATISTICAL_1MIN", value: "PM_STATISTICAL_1MIN" },
  //   { name: "PM_STATISTICAL_5MIN", value: "PM_STATISTICAL_5MIN" },
  // ];

  const addLog = (level: LogEntry["level"], message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, level, message }]);
  };

  // Function to update step status
  // const updateStepStatus = (stepId: string, status: Step["status"]) => {
  //   setSteps((prev) =>
  //     prev.map((step) => (step.id === stepId ? { ...step, status } : step))
  //   );
  // };

  const isQuestionnaireValid = () => {
    return answers.nodeName.trim() !== "" && answers.dataType !== "";
  };

  const handleNext = () => {
    if (currentPhase === "questionnaire" && isQuestionnaireValid()) {
      setCurrentPhase("upload");
    } else if (currentPhase === "upload" && uploadedFile) {
      setCurrentPhase("processing");
      startProcessing();
    }
  };

  // Navigation helper function
  // const handleBack = () => {
  //   if (currentPhase === "upload") {
  //     setCurrentPhase("questionnaire");
  //   } else if (currentPhase === "processing" && !isProcessing) {
  //     setCurrentPhase("upload");
  //   }
  // };

  const startProcessing = () => {
    setError(null);
    setLogs([]);
    setCurrentStep(0);

    // Reset all steps
    setSteps((prev) => prev.map((step) => ({ ...step, status: "pending" })));

    // Start a new job
    const jobId = startJob({
      type: "chart-build",
      data: {
        nodeName: answers.nodeName,
        dataType: answers.dataType,
        fileName: uploadedFile?.name,
      },
    });

    setLocalJobId(jobId);

    addLog(
      "info",
      `Starting new node addition process for ${answers.nodeName}...`
    );
    addLog("info", `Data type: ${answers.dataType}`);
    addLog("info", `Processing file: ${uploadedFile?.name}`);
  };

  const reset = () => {
    setCurrentPhase("questionnaire");
    setAnswers({ nodeName: "", dataType: "" });
    setUploadedFile(null);
    setLogs([]);
    setCurrentStep(0);
    setError(null);
    setLocalJobId(null);
    setSteps((prev) => prev.map((step) => ({ ...step, status: "pending" })));
  };

  // Monitor job progress and update UI accordingly
  useEffect(() => {
    if (!currentJob) return;

    // Update current step based on progress
    const progressToStep = Math.floor(
      (currentJob.progress / 100) * 8 // Use fixed length instead of steps.length
    );
    setCurrentStep(progressToStep);

    // Update step statuses based on progress
    setSteps((prevSteps) => {
      return prevSteps.map((step) => {
        const stepNumber = parseInt(step.id);
        if (stepNumber <= progressToStep) {
          return { ...step, status: "completed" as const };
        } else if (
          stepNumber === progressToStep + 1 &&
          currentJob.status === "running"
        ) {
          return { ...step, status: "running" as const };
        } else {
          return { ...step, status: "pending" as const };
        }
      });
    });

    // Add logs based on progress
    if (currentJob.status === "running" && currentJob.progress > 0) {
      const stepMessages = [
        "Starting configuration validation...",
        "Processing uploaded file...",
        "Analyzing network topology...",
        "Configuring data collection...",
        "Integrating node into topology...",
        "Generating helm chart...",
        "Running validation tests...",
        "Finalizing package...",
      ];

      const currentStepIndex = Math.floor(
        (currentJob.progress / 100) * stepMessages.length
      );
      if (currentStepIndex < stepMessages.length) {
        const message = stepMessages[currentStepIndex];
        setLogs((prevLogs) => {
          // Only add if not already present
          if (!prevLogs.some((log) => log.message === message)) {
            const timestamp = new Date().toLocaleTimeString();
            return [
              ...prevLogs,
              { timestamp, level: "info" as const, message },
            ];
          }
          return prevLogs;
        });
      }
    }

    // Handle completion
    if (currentJob.status === "completed") {
      setLogs((prevLogs) => {
        const timestamp = new Date().toLocaleTimeString();
        const successMessage = `${answers.nodeName} helm chart ready for download`;
        const urlMessage = currentJob.downloadUrl
          ? `Chart URL: ${currentJob.downloadUrl}`
          : null;

        const newLogs = [...prevLogs];

        if (!prevLogs.some((log) => log.message === successMessage)) {
          newLogs.push({
            timestamp,
            level: "success" as const,
            message: successMessage,
          });
        }

        if (urlMessage && !prevLogs.some((log) => log.message === urlMessage)) {
          newLogs.push({
            timestamp,
            level: "success" as const,
            message: urlMessage,
          });
        }

        return newLogs;
      });
    }

    // Handle errors
    if (currentJob.status === "failed") {
      setError(currentJob.error || "Unknown error occurred");
      setLogs((prevLogs) => {
        const timestamp = new Date().toLocaleTimeString();
        const errorMessage = `Chart generation failed: ${currentJob.error}`;

        if (!prevLogs.some((log) => log.message === errorMessage)) {
          return [
            ...prevLogs,
            { timestamp, level: "error" as const, message: errorMessage },
          ];
        }
        return prevLogs;
      });
    }
  }, [currentJob, answers.nodeName]);

  const renderQuestionnaire = () => (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Radio className="h-5 w-5 text-blue-600" />
            <span>Network Node Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure your new 4G/5G network node by providing the required
            information below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="nodeName"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Node Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nodeName"
              placeholder="e.g., eNodeB_Site_001"
              value={answers.nodeName}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, nodeName: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Unique identifier for the new network node
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="dataType"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Data Collection Type <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <select
                id="dataType"
                value={answers.dataType}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, dataType: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors appearance-none pr-10"
              >
                <option value="">Select data collection type</option>
                <option value="PM_STATISTICAL">PM_STATISTICAL</option>
                <option value="PM_STATISTICAL_1MIN">PM_STATISTICAL_1MIN</option>
                <option value="PM_STATISTICAL_5MIN">PM_STATISTICAL_5MIN</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Performance monitoring data collection interval
            </p>
          </div>

          {/* Configuration Summary */}
          {isQuestionnaireValid() && (
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                Configuration Summary
              </h4>
              <div className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                <p>
                  <strong>Node Name:</strong> {answers.nodeName}
                </p>
                <p>
                  <strong>Data Type:</strong> {answers.dataType}
                </p>
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleNext}
              disabled={!isQuestionnaireValid()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
            >
              <span>Continue to Upload</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUpload = () => (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Summary */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Node Name
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {answers.nodeName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Data Type
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {answers.dataType}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPhase("questionnaire")}
              className="mt-4 flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Edit Configuration</span>
            </Button>
          </CardContent>
        </Card>

        {/* File Upload */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wifi className="h-5 w-5 text-green-600" />
                <span>Upload Network Configuration</span>
              </CardTitle>
              <CardDescription>
                Upload your recording.zip file containing the network
                configuration data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={setUploadedFile}
                acceptedTypes=".zip"
                maxSize={50 * 1024 * 1024} // 50MB
              />
              {uploadedFile && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      onClick={handleNext}
                      disabled={!uploadedFile || isProcessing}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
                    >
                      <Radio className="h-4 w-4" />
                      <span>
                        {isProcessing ? "Processing..." : "Start Processing"}
                      </span>
                    </Button>
                  </div>
                </div>
              )}

              {uploadedFile && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      File uploaded successfully
                    </span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {uploadedFile.name} (
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="max-w-6xl mx-auto">
      {/* Main Content Grid - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Steps and Controls */}
        <div className="space-y-6">
          {/* Processing Steps */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cpu className="h-5 w-5 text-purple-600" />
                <span>Helm Chart Generation</span>
                {isProcessing && (
                  <Badge variant="secondary" className="ml-auto">
                    Processing...
                  </Badge>
                )}
                {processingComplete && (
                  <Badge variant="default" className="ml-auto bg-green-600">
                    Complete
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Building custom helm chart for {answers.nodeName} with{" "}
                {answers.dataType} data collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProcessingSteps steps={steps} currentStep={currentStep} />

              {currentJob && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{currentJob.progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={currentJob.progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Download Section */}
          {processingComplete && helmChartUrl && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border border-green-200 dark:border-green-700 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                  {answers.nodeName} Integration Complete
                </h3>
              </div>
              <p className="text-green-700 dark:text-green-400 mb-4">
                Your new network node has been successfully integrated with{" "}
                {answers.dataType} data collection and the helm chart is ready
                for deployment.
              </p>
              {currentJob?.id && (
                <p className="text-sm text-green-600 dark:text-green-500 mb-4">
                  Job ID: {currentJob.id}
                </p>
              )}
              <div className="flex space-x-3">
                <Button
                  onClick={() => window.open(helmChartUrl, "_blank")}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Helm Chart</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={reset}
                  className="flex items-center space-x-2 px-6 py-3 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Add Another Node</span>
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  Processing Error
                </span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Logs and Status */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle>Processing Logs</CardTitle>
              <CardDescription>
                Real-time processing information and status updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogViewer logs={logs} />
            </CardContent>
          </Card>

          {/* Network Status */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wifi className="h-5 w-5 text-blue-500" />
                <span>Network Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    RESTSim Engine
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Online
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Active Nodes
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      24 Nodes
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Network Coverage
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      98.5%
                    </span>
                  </div>
                </div>
                {isProcessing && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Node Integration
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      <span className="text-sm text-orange-600 dark:text-orange-400">
                        Processing
                      </span>
                    </div>
                  </div>
                )}
                {answers.nodeName && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Current Node
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        {answers.nodeName}
                      </span>
                    </div>
                  </div>
                )}
                {currentJob?.id && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Job ID
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {currentJob.id}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          New Node Addition
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Add new 4G/5G network nodes to your simulation environment
        </p>
      </div>

      {currentPhase === "questionnaire" && renderQuestionnaire()}
      {currentPhase === "upload" && renderUpload()}
      {currentPhase === "processing" && renderProcessing()}
    </div>
  );
};

export default NewNodeAddition;
