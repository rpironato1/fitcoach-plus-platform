/**
 * Comprehensive test suite for useLocalStorageAdminData hook
 * Testing critical admin data management functionality - 100% coverage target
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLocalStorageAdminData } from './useLocalStorageAdminData';
import React from 'react';

// Mock the services
const mockLocalStorageService = {
  getAdminDashboardData: vi.fn(),
  getUserMetrics: vi.fn(),
  getSystemStats: vi.fn(),
  getFinancialData: vi.fn(),
  updateSystemSettings: vi.fn(),
  exportData: vi.fn(),
  importData: vi.fn(),
  generateReport: vi.fn(),
};

vi.mock('@/services/localStorageService', () => ({
  localStorageService: mockLocalStorageService,
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('useLocalStorageAdminData', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Admin Dashboard Data', () => {
    it('should fetch admin dashboard data successfully', async () => {
      const mockDashboardData = {
        totalUsers: 150,
        totalTrainers: 25,
        totalStudents: 125,
        activeUsers: 140,
        revenueThisMonth: 15000,
        newSignupsThisWeek: 12,
      };
      
      mockLocalStorageService.getAdminDashboardData.mockResolvedValue(mockDashboardData);

      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await waitFor(() => {
        expect(result.current.dashboardData).toEqual(mockDashboardData);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle dashboard data fetching errors', async () => {
      const errorMessage = 'Failed to fetch admin data';
      mockLocalStorageService.getAdminDashboardData.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should show loading state while fetching dashboard data', () => {
      mockLocalStorageService.getAdminDashboardData.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('User Metrics', () => {
    it('should fetch user metrics successfully', async () => {
      const mockMetrics = {
        dailyActiveUsers: 85,
        weeklyActiveUsers: 120,
        monthlyActiveUsers: 145,
        userRetentionRate: 0.85,
        averageSessionDuration: 25,
        bounceRate: 0.15,
      };
      
      mockLocalStorageService.getUserMetrics.mockResolvedValue(mockMetrics);

      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await waitFor(() => {
        expect(result.current.userMetrics).toEqual(mockMetrics);
      });
    });

    it('should handle user metrics errors', async () => {
      mockLocalStorageService.getUserMetrics.mockRejectedValue(new Error('Metrics error'));

      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await waitFor(() => {
        expect(result.current.metricsError).toBeTruthy();
      });
    });

    it('should refresh user metrics on demand', async () => {
      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await act(async () => {
        await result.current.refreshMetrics();
      });

      expect(mockLocalStorageService.getUserMetrics).toHaveBeenCalled();
    });
  });

  describe('System Statistics', () => {
    it('should fetch system stats successfully', async () => {
      const mockStats = {
        systemUptime: '99.9%',
        databaseSize: '2.5GB',
        totalApiRequests: 15680,
        errorRate: 0.02,
        avgResponseTime: 120,
        storageUsage: '68%',
      };
      
      mockLocalStorageService.getSystemStats.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await waitFor(() => {
        expect(result.current.systemStats).toEqual(mockStats);
      });
    });

    it('should handle system stats errors gracefully', async () => {
      mockLocalStorageService.getSystemStats.mockRejectedValue(new Error('System error'));

      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await waitFor(() => {
        expect(result.current.systemError).toBeTruthy();
      });
    });
  });

  describe('Financial Data', () => {
    it('should fetch financial data successfully', async () => {
      const mockFinancialData = {
        monthlyRevenue: 15000,
        yearlyRevenue: 150000,
        subscriptionRevenue: 12000,
        oneTimePayments: 3000,
        refunds: 500,
        netRevenue: 14500,
        growthRate: 0.15,
      };
      
      mockLocalStorageService.getFinancialData.mockResolvedValue(mockFinancialData);

      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await waitFor(() => {
        expect(result.current.financialData).toEqual(mockFinancialData);
      });
    });

    it('should calculate financial trends correctly', async () => {
      const mockData = {
        currentMonth: 15000,
        previousMonth: 13000,
        growthRate: 0.15,
      };
      
      mockLocalStorageService.getFinancialData.mockResolvedValue(mockData);

      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await waitFor(() => {
        expect(result.current.financialTrend).toBe('positive');
        expect(result.current.growthPercentage).toBe(15);
      });
    });
  });

  describe('System Settings Management', () => {
    it('should update system settings successfully', async () => {
      const settingsUpdate = {
        maintenanceMode: false,
        allowNewRegistrations: true,
        maxUsersPerTrainer: 50,
      };
      
      mockLocalStorageService.updateSystemSettings.mockResolvedValue(settingsUpdate);

      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await act(async () => {
        await result.current.updateSystemSettings(settingsUpdate);
      });

      expect(mockLocalStorageService.updateSystemSettings).toHaveBeenCalledWith(settingsUpdate);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'System settings updated successfully',
        variant: 'default',
      });
    });

    it('should handle settings update errors', async () => {
      const settingsUpdate = { maintenanceMode: true };
      const errorMessage = 'Settings update failed';
      mockLocalStorageService.updateSystemSettings.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await act(async () => {
        await expect(result.current.updateSystemSettings(settingsUpdate)).rejects.toThrow(errorMessage);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update system settings',
        variant: 'destructive',
      });
    });
  });

  describe('Data Export/Import', () => {
    it('should export data successfully', async () => {
      const exportOptions = {
        includeUsers: true,
        includeTrainers: true,
        includeWorkouts: true,
        format: 'json',
      };
      
      const mockExportResult = {
        success: true,
        downloadUrl: 'https://example.com/export.json',
        fileSize: '2.5MB',
      };
      
      mockLocalStorageService.exportData.mockResolvedValue(mockExportResult);

      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await act(async () => {
        await result.current.exportData(exportOptions);
      });

      expect(mockLocalStorageService.exportData).toHaveBeenCalledWith(exportOptions);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Export Complete',
        description: 'Data exported successfully (2.5MB)',
        variant: 'default',
      });
    });

    it('should import data with validation', async () => {
      const importFile = new File(['{}'], 'import.json', { type: 'application/json' });
      const mockImportResult = {
        success: true,
        imported: 150,
        skipped: 5,
        errors: 2,
      };
      
      mockLocalStorageService.importData.mockResolvedValue(mockImportResult);

      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await act(async () => {
        await result.current.importData(importFile);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Import Complete',
        description: 'Imported: 150, Skipped: 5, Errors: 2',
        variant: 'default',
      });
    });

    it('should handle import errors gracefully', async () => {
      const importFile = new File(['invalid'], 'bad.json', { type: 'application/json' });
      mockLocalStorageService.importData.mockRejectedValue(new Error('Invalid file format'));

      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await act(async () => {
        await expect(result.current.importData(importFile)).rejects.toThrow('Invalid file format');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Import Failed',
        description: 'Invalid file format or corrupted data',
        variant: 'destructive',
      });
    });
  });

  describe('Report Generation', () => {
    it('should generate comprehensive reports', async () => {
      const reportConfig = {
        type: 'monthly',
        includeFinancials: true,
        includeUserStats: true,
        format: 'pdf',
      };
      
      const mockReport = {
        id: 'report-123',
        url: 'https://example.com/report.pdf',
        generatedAt: new Date().toISOString(),
        size: '1.2MB',
      };
      
      mockLocalStorageService.generateReport.mockResolvedValue(mockReport);

      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await act(async () => {
        await result.current.generateReport(reportConfig);
      });

      expect(mockLocalStorageService.generateReport).toHaveBeenCalledWith(reportConfig);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Report Generated',
        description: 'Monthly report ready for download (1.2MB)',
        variant: 'default',
      });
    });
  });

  describe('Real-time Data Updates', () => {
    it('should handle live data updates', async () => {
      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await act(async () => {
        result.current.enableRealTimeUpdates();
      });

      expect(result.current.isRealTimeEnabled).toBe(true);
    });

    it('should batch multiple updates efficiently', async () => {
      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await act(async () => {
        // Simulate multiple rapid updates
        result.current.updateMetric('activeUsers', 141);
        result.current.updateMetric('totalRevenue', 15100);
        result.current.updateMetric('newSignups', 13);
      });

      // Should batch updates to prevent excessive re-renders
      expect(result.current.batchedUpdates).toBe(true);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track query performance', async () => {
      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      await waitFor(() => {
        expect(result.current.queryPerformance).toBeDefined();
        expect(result.current.queryPerformance.averageLoadTime).toBeLessThan(1000);
      });
    });

    it('should implement data caching strategies', async () => {
      const mockData = { totalUsers: 150 };
      mockLocalStorageService.getAdminDashboardData.mockResolvedValue(mockData);

      const { result } = renderHook(() => useLocalStorageAdminData(), { wrapper });

      // First call
      await waitFor(() => {
        expect(result.current.dashboardData).toEqual(mockData);
      });

      // Second call should use cache
      await act(async () => {
        await result.current.refetch();
      });

      // Should be called only once due to caching
      expect(mockLocalStorageService.getAdminDashboardData).toHaveBeenCalledTimes(1);
    });
  });
});