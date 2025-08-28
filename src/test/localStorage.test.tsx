/**
 * Test suite for localStorage dashboard implementation
 */

import React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { localStorageService } from "@/services/localStorageService";
import {
  useLocalStorageDashboardStats,
  useLocalStorageUpcomingSessions,
  useLocalStorageRecentActivity,
} from "@/hooks/useLocalStorageDashboardData";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("LocalStorage Dashboard Implementation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("LocalStorage Service", () => {
    it("should initialize data correctly", () => {
      localStorageService.initializeData();
      const data = localStorageService.getData();

      expect(data).toBeDefined();
      expect(data?.trainer_profiles).toHaveLength(1);
      expect(data?.students.length).toBeGreaterThan(0);
      expect(data?.sessions.length).toBeGreaterThan(0);
    });

    it("should handle data variations", () => {
      localStorageService.addDataVariation("empty");
      const emptyData = localStorageService.getData();
      expect(emptyData?.students).toHaveLength(0);
      expect(emptyData?.sessions).toHaveLength(0);

      localStorageService.addDataVariation("minimal");
      const minimalData = localStorageService.getData();
      expect(minimalData?.students).toHaveLength(1);
      expect(minimalData?.sessions.length).toBeLessThanOrEqual(2);

      localStorageService.addDataVariation("full");
      const fullData = localStorageService.getData();
      expect(fullData?.students.length).toBeGreaterThan(1);
      expect(fullData?.sessions.length).toBeGreaterThan(2);
    });

    it("should export data for Supabase migration", () => {
      localStorageService.initializeData();
      const exportedData = localStorageService.exportForSupabase();

      expect(exportedData).toBeDefined();
      const parsed = JSON.parse(exportedData);
      expect(parsed.trainer_profiles).toBeDefined();
      expect(parsed.student_profiles).toBeDefined();
      expect(parsed.sessions).toBeDefined();
      expect(parsed.payment_intents).toBeDefined();
    });

    it("should clear data", () => {
      localStorageService.initializeData();
      expect(localStorageService.getData()).toBeDefined();

      localStorageService.clearData();
      expect(localStorageService.getData()).toBeNull();
    });
  });

  describe("Dashboard Stats Hook", () => {
    it("should return correct dashboard statistics", async () => {
      const wrapper = createWrapper();

      const { result } = renderHook(() => useLocalStorageDashboardStats(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const stats = result.current.data;
      expect(stats).toBeDefined();
      expect(stats?.activeStudents).toBeGreaterThanOrEqual(0);
      expect(stats?.maxStudents).toBeGreaterThan(0);
      expect(stats?.sessionsToday).toBeGreaterThanOrEqual(0);
      expect(stats?.totalSessions).toBeGreaterThanOrEqual(0);
      expect(stats?.monthlyRevenue).toBeGreaterThanOrEqual(0);
      expect(stats?.aiCredits).toBeGreaterThanOrEqual(0);
    });

    it("should handle empty data scenario", async () => {
      localStorageService.addDataVariation("empty");
      const wrapper = createWrapper();

      const { result } = renderHook(() => useLocalStorageDashboardStats(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const stats = result.current.data;
      expect(stats?.activeStudents).toBe(0);
      expect(stats?.sessionsToday).toBe(0);
      expect(stats?.totalSessions).toBe(0);
      expect(stats?.monthlyRevenue).toBe(0);
    });
  });

  describe("Upcoming Sessions Hook", () => {
    it("should return upcoming sessions", async () => {
      const wrapper = createWrapper();

      const { result } = renderHook(() => useLocalStorageUpcomingSessions(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const sessions = result.current.data;
      expect(sessions).toBeDefined();
      expect(Array.isArray(sessions)).toBe(true);

      if (sessions && sessions.length > 0) {
        expect(sessions[0]).toHaveProperty("id");
        expect(sessions[0]).toHaveProperty("student_name");
        expect(sessions[0]).toHaveProperty("scheduled_at");
        expect(sessions[0]).toHaveProperty("duration_minutes");
        expect(sessions[0]).toHaveProperty("status");
      }
    });

    it("should return sessions sorted by date", async () => {
      const wrapper = createWrapper();

      const { result } = renderHook(() => useLocalStorageUpcomingSessions(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const sessions = result.current.data;
      if (sessions && sessions.length > 1) {
        for (let i = 1; i < sessions.length; i++) {
          const prevDate = new Date(sessions[i - 1].scheduled_at);
          const currentDate = new Date(sessions[i].scheduled_at);
          expect(prevDate.getTime()).toBeLessThanOrEqual(currentDate.getTime());
        }
      }
    });
  });

  describe("Recent Activity Hook", () => {
    it("should return recent activities", async () => {
      const wrapper = createWrapper();

      const { result } = renderHook(() => useLocalStorageRecentActivity(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const activities = result.current.data;
      expect(activities).toBeDefined();
      expect(Array.isArray(activities)).toBe(true);

      if (activities && activities.length > 0) {
        expect(activities[0]).toHaveProperty("id");
        expect(activities[0]).toHaveProperty("type");
        expect(activities[0]).toHaveProperty("description");
        expect(activities[0]).toHaveProperty("created_at");

        // Check valid activity types
        const validTypes = [
          "session_completed",
          "student_added",
          "workout_assigned",
          "diet_created",
        ];
        expect(validTypes).toContain(activities[0].type);
      }
    });

    it("should return activities sorted by date (newest first)", async () => {
      const wrapper = createWrapper();

      const { result } = renderHook(() => useLocalStorageRecentActivity(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const activities = result.current.data;
      if (activities && activities.length > 1) {
        for (let i = 1; i < activities.length; i++) {
          const prevDate = new Date(activities[i - 1].created_at);
          const currentDate = new Date(activities[i].created_at);
          expect(prevDate.getTime()).toBeGreaterThanOrEqual(
            currentDate.getTime()
          );
        }
      }
    });
  });

  describe("Data Compatibility", () => {
    it("should maintain JSON structure compatible with Supabase", () => {
      localStorageService.initializeData();
      const data = localStorageService.getData();

      // Check that all required fields exist and have correct types
      expect(data?.trainer_profiles[0]).toHaveProperty("id");
      expect(data?.trainer_profiles[0]).toHaveProperty("plan");
      expect(data?.trainer_profiles[0]).toHaveProperty("max_students");
      expect(data?.trainer_profiles[0]).toHaveProperty("ai_credits");
      expect(data?.trainer_profiles[0]).toHaveProperty("created_at");
      expect(data?.trainer_profiles[0]).toHaveProperty("updated_at");

      expect(typeof data?.trainer_profiles[0].max_students).toBe("number");
      expect(typeof data?.trainer_profiles[0].ai_credits).toBe("number");
      expect(["free", "pro", "elite"]).toContain(
        data?.trainer_profiles[0].plan
      );
    });

    it("should export valid JSON for Supabase import", () => {
      localStorageService.initializeData();
      const exportedData = localStorageService.exportForSupabase();

      expect(() => JSON.parse(exportedData)).not.toThrow();

      const parsed = JSON.parse(exportedData);
      expect(parsed).toHaveProperty("trainer_profiles");
      expect(parsed).toHaveProperty("student_profiles");
      expect(parsed).toHaveProperty("sessions");
      expect(parsed).toHaveProperty("payment_intents");
      expect(parsed).toHaveProperty("diet_plans");
      expect(parsed).toHaveProperty("workout_plans");
    });
  });
});
