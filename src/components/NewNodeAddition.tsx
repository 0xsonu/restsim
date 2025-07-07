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

  const dataTypeOptions = [
    { name: "PM_STATISTICAL", value: "PM_STATISTICAL" },
    { name: "PM_STATISTICAL_1MIN", value: "PM_STATISTICAL_1MIN" },
    { name: "PM_STATISTICAL_5MIN", value: "PM_STATISTICAL_5MIN" },
  ];

  const addLog = (level: LogEntry["level"], message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, level, message }]);
  };

  const updateStepStatus = (stepId: string, status: Step["status"]) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, status } : step))
    );
  };

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

  const handleBack = () => {
    if (currentPhase === "upload") {
      setCurrentPhase("questionnaire");
    } else if (currentPhase === "processing" && !isProcessing) {
      setCurrentPhase("upload");
    }
  };

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
    <Card>
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
          <Label htmlFor="nodeName">Node Name</Label>
          <Input
            id="nodeName"
            placeholder="e.g., eNodeB_Site_001"
            value={answers.nodeName}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, nodeName: e.target.value }))
            }
          />
          <p className="text-sm text-gray-500">
            Unique identifier for the new network node
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataType">Data Collection Type</Label>
          <div className="relative">
            <select
              id="dataType"
              value={answers.dataType}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, dataType: e.target.value }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-10"
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
          <p className="text-sm text-gray-500">
            Performance monitoring data collection interval
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderUpload = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wifi className="h-5 w-5 text-green-600" />
          <span>Upload Network Configuration</span>
        </CardTitle>
        <CardDescription>
          Upload your recording.zip file containing the network configuration
          data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          onFileSelect={setUploadedFile}
          acceptedTypes=".zip"
          maxSize={50 * 1024 * 1024} // 50MB
        />
        {uploadedFile && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
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
  );

  const renderProcessing = () => (
    <div className="space-y-6">
      <Card>
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

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
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

          {processingComplete && helmChartUrl && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Helm Chart Ready
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => window.open(helmChartUrl, "_blank")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <LogViewer logs={logs} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            New Node Addition
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add new 4G/5G network nodes to your simulation environment
          </p>
        </div>

        <div className="flex space-x-2">
          {currentPhase !== "questionnaire" && !isProcessing && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          {currentPhase === "questionnaire" && (
            <Button onClick={handleNext} disabled={!isQuestionnaireValid()}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {currentPhase === "upload" && uploadedFile && (
            <Button onClick={handleNext}>
              Start Processing
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {processingComplete && (
            <Button onClick={reset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Start New
            </Button>
          )}
        </div>
      </div>

      {currentPhase === "questionnaire" && renderQuestionnaire()}
      {currentPhase === "upload" && renderUpload()}
      {currentPhase === "processing" && renderProcessing()}
    </div>
  );
};

export default NewNodeAddition;
