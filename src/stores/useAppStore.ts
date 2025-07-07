import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

// Types
export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionType?: "chart-build" | "site-values" | "system";
  actionData?: Record<string, unknown>;
  redirectTo?: string;
}

export interface ProcessingJob {
  id: string;
  type: "chart-build" | "site-values";
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  data: Record<string, unknown>;
  executionId?: string;
  startTime: Date;
  endTime?: Date;
  error?: string;
  downloadUrl?: string;
}

export interface AppState {
  // Notifications
  notifications: Notification[];
  unreadCount: number;

  // Processing Jobs
  processingJobs: ProcessingJob[];
  activeJobId: string | null;

  // UI State
  sidebarCollapsed: boolean;
  currentSection: string;

  // User Preferences
  preferences: {
    theme: "light" | "dark" | "system";
    notifications: {
      enabled: boolean;
      sound: boolean;
      desktop: boolean;
    };
  };
}

export interface AppActions {
  // Notification Actions
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  clearOldNotifications: () => void;

  // Processing Job Actions
  startJob: (
    job: Omit<ProcessingJob, "id" | "startTime" | "status" | "progress">
  ) => string;
  updateJob: (id: string, updates: Partial<ProcessingJob>) => void;
  completeJob: (
    id: string,
    result: { downloadUrl?: string; error?: string }
  ) => void;
  removeJob: (id: string) => void;
  setActiveJob: (id: string | null) => void;

  // UI Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentSection: (section: string) => void;

  // Preference Actions
  updatePreferences: (preferences: Partial<AppState["preferences"]>) => void;

  // Utility Actions
  reset: () => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  notifications: [],
  unreadCount: 0,
  processingJobs: [],
  activeJobId: null,
  sidebarCollapsed: false,
  currentSection: "new-node",
  preferences: {
    theme: "system",
    notifications: {
      enabled: true,
      sound: true,
      desktop: false,
    },
  },
};

export const useAppStore = create<AppStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        // Notification Actions
        addNotification: (notification) => {
          const id =
            Date.now().toString() + Math.random().toString(36).substr(2, 9);
          const newNotification: Notification = {
            ...notification,
            id,
            timestamp: new Date(),
            read: false,
          };

          set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));

          // Show browser notification if enabled
          const { preferences } = get();
          if (
            preferences.notifications.enabled &&
            preferences.notifications.desktop
          ) {
            if (Notification.permission === "granted") {
              new Notification(notification.title, {
                body: notification.message,
                icon: "/favicon.ico",
              });
            }
          }

          // Auto-remove old notifications (keep last 50)
          const { notifications } = get();
          if (notifications.length > 50) {
            set((state) => ({
              notifications: state.notifications.slice(0, 50),
            }));
          }
        },

        markNotificationRead: (id) => {
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }));
        },

        markAllNotificationsRead: () => {
          set((state) => ({
            notifications: state.notifications.map((n) => ({
              ...n,
              read: true,
            })),
            unreadCount: 0,
          }));
        },

        removeNotification: (id) => {
          set((state) => {
            const notification = state.notifications.find((n) => n.id === id);
            const wasUnread = notification && !notification.read;

            return {
              notifications: state.notifications.filter((n) => n.id !== id),
              unreadCount: wasUnread
                ? Math.max(0, state.unreadCount - 1)
                : state.unreadCount,
            };
          });
        },

        clearOldNotifications: () => {
          const now = new Date();
          const threeDaysAgo = new Date(
            now.getTime() - 3 * 24 * 60 * 60 * 1000
          );

          set((state) => {
            const filteredNotifications = state.notifications.filter(
              (n) => n.timestamp > threeDaysAgo
            );
            const removedUnreadCount = state.notifications.filter(
              (n) => n.timestamp <= threeDaysAgo && !n.read
            ).length;

            return {
              notifications: filteredNotifications,
              unreadCount: Math.max(0, state.unreadCount - removedUnreadCount),
            };
          });
        },

        // Processing Job Actions
        startJob: (job) => {
          const id =
            Date.now().toString() + Math.random().toString(36).substr(2, 9);
          const newJob: ProcessingJob = {
            ...job,
            id,
            status: "pending",
            progress: 0,
            startTime: new Date(),
          };

          set((state) => ({
            processingJobs: [...state.processingJobs, newJob],
            activeJobId: id,
          }));

          return id;
        },

        updateJob: (id, updates) => {
          set((state) => ({
            processingJobs: state.processingJobs.map((job) =>
              job.id === id ? { ...job, ...updates } : job
            ),
          }));
        },

        completeJob: (id, result) => {
          set((state) => ({
            processingJobs: state.processingJobs.map((job) =>
              job.id === id
                ? {
                    ...job,
                    status: result.error ? "failed" : "completed",
                    progress: 100,
                    endTime: new Date(),
                    ...result,
                  }
                : job
            ),
            activeJobId: state.activeJobId === id ? null : state.activeJobId,
          }));

          // Add completion notification
          const job = get().processingJobs.find((j) => j.id === id);
          if (job) {
            get().addNotification({
              type: result.error ? "error" : "success",
              title: result.error ? "Job Failed" : "Job Completed",
              message:
                result.error || `${job.type} has been completed successfully`,
              actionType: job.type,
              actionData: { jobId: id, ...result },
            });
          }
        },

        removeJob: (id) => {
          set((state) => ({
            processingJobs: state.processingJobs.filter((job) => job.id !== id),
            activeJobId: state.activeJobId === id ? null : state.activeJobId,
          }));
        },

        setActiveJob: (id) => {
          set({ activeJobId: id });
        },

        // UI Actions
        setSidebarCollapsed: (collapsed) => {
          set({ sidebarCollapsed: collapsed });
        },

        setCurrentSection: (section) => {
          set({ currentSection: section });
        },

        // Preference Actions
        updatePreferences: (preferences) => {
          set((state) => ({
            preferences: { ...state.preferences, ...preferences },
          }));
        },

        // Utility Actions
        reset: () => {
          set(initialState);
        },
      }),
      {
        name: "simbot-app-storage",
        partialize: (state) => ({
          preferences: state.preferences,
          sidebarCollapsed: state.sidebarCollapsed,
          currentSection: state.currentSection,
        }),
      }
    )
  )
);

// Computed selectors
export const useNotifications = () =>
  useAppStore((state) => state.notifications);
export const useUnreadCount = () => useAppStore((state) => state.unreadCount);
export const useProcessingJobs = () =>
  useAppStore((state) => state.processingJobs);
export const useActiveJob = () =>
  useAppStore((state) =>
    state.processingJobs.find((job) => job.id === state.activeJobId)
  );
export const usePreferences = () => useAppStore((state) => state.preferences);
