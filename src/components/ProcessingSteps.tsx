"use client";

import React from "react";
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
  status: "pending" | "running" | "completed" | "error";
}

interface ProcessingStepsProps {
  steps: Step[];
  currentStep: number;
}

const ProcessingSteps: React.FC<ProcessingStepsProps> = ({
  steps,
  currentStep,
}) => {
  const getStepIcon = (step: Step) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepColor = (step: Step) => {
    switch (step.status) {
      case "completed":
        return "text-green-700 dark:text-green-300";
      case "running":
        return "text-blue-700 dark:text-blue-300";
      case "error":
        return "text-red-700 dark:text-red-300";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const getConnectorColor = (index: number) => {
    if (index < currentStep) {
      return "bg-green-200 dark:bg-green-800";
    } else {
      return "bg-gray-200 dark:bg-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={`absolute left-6 top-12 w-0.5 h-8 ${getConnectorColor(
                index
              )}`}
            />
          )}

          {/* Step content */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">{getStepIcon(step)}</div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium ${getStepColor(step)}`}>
                {step.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {step.description}
              </p>
              {step.status === "running" && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    <span>Processing...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProcessingSteps;
