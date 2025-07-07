import { useAppStore } from "@/stores/useAppStore";

interface BackgroundProcessor {
  start: () => void;
  stop: () => void;
  isRunning: boolean;
}

class BackgroundProcessorService implements BackgroundProcessor {
  private intervalId: NodeJS.Timeout | null = null;
  private processingIntervalId: NodeJS.Timeout | null = null;
  public isRunning = false;

  start() {
    if (this.isRunning) return;

    this.isRunning = true;

    // Check for pending jobs every 5 seconds
    this.intervalId = setInterval(() => {
      this.checkPendingJobs();
    }, 5000);

    console.log("Background processor started");
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.processingIntervalId) {
      clearInterval(this.processingIntervalId);
      this.processingIntervalId = null;
    }

    this.isRunning = false;
    console.log("Background processor stopped");
  }

  private checkPendingJobs() {
    const store = useAppStore.getState();
    const pendingJobs = store.processingJobs.filter(
      (job) => job.status === "pending"
    );

    if (pendingJobs.length > 0 && !this.processingIntervalId) {
      const job = pendingJobs[0];
      this.processJob(job.id);
    }
  }

  private processJob(jobId: string) {
    const store = useAppStore.getState();

    // Mark job as running
    store.updateJob(jobId, { status: "running", progress: 0 });

    let progress = 0;
    this.processingIntervalId = setInterval(() => {
      progress += Math.random() * 15; // Random progress increment

      if (progress >= 100) {
        progress = 100;

        // Complete the job
        store.completeJob(jobId, {
          downloadUrl: `/api/download/${jobId}`,
        });

        if (this.processingIntervalId) {
          clearInterval(this.processingIntervalId);
          this.processingIntervalId = null;
        }

        // Check for next pending job
        setTimeout(() => this.checkPendingJobs(), 1000);
      } else {
        store.updateJob(jobId, { progress: Math.min(progress, 100) });
      }
    }, 1000);
  }
}

export const backgroundProcessor = new BackgroundProcessorService();
