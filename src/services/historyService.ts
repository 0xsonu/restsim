export interface HistoryItem {
  id: string;
  type: "chart-build" | "site-values";
  name: string;
  timestamp: Date;
  status: "completed" | "failed";
  downloadUrl?: string;
  size?: string;
  error?: string;
}

export interface HistoryService {
  getHistory: () => Promise<HistoryItem[]>;
  addHistoryItem: (
    item: Omit<HistoryItem, "id" | "timestamp">
  ) => Promise<void>;
  removeHistoryItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

class HistoryServiceImpl implements HistoryService {
  private history: HistoryItem[] = [
    {
      id: "1",
      type: "chart-build",
      name: "Network Topology Chart",
      timestamp: new Date(Date.now() - 3600000),
      status: "completed",
      downloadUrl: "/api/download/chart-1",
      size: "2.4 MB",
    },
    {
      id: "2",
      type: "site-values",
      name: "Site Configuration Export",
      timestamp: new Date(Date.now() - 7200000),
      status: "completed",
      downloadUrl: "/api/download/site-2",
      size: "856 KB",
    },
    {
      id: "3",
      type: "chart-build",
      name: "Performance Analysis",
      timestamp: new Date(Date.now() - 10800000),
      status: "failed",
      error: "Insufficient data for analysis",
    },
  ];

  async getHistory(): Promise<HistoryItem[]> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...this.history].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async addHistoryItem(
    item: Omit<HistoryItem, "id" | "timestamp">
  ): Promise<void> {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    this.history.unshift(newItem);

    // Keep only last 100 items
    if (this.history.length > 100) {
      this.history = this.history.slice(0, 100);
    }
  }

  async removeHistoryItem(id: string): Promise<void> {
    this.history = this.history.filter((item) => item.id !== id);
  }

  async clearHistory(): Promise<void> {
    this.history = [];
  }
}

export const historyService = new HistoryServiceImpl();
