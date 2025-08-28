/**
 * LocalStorage-only Security Service
 * 
 * Provides security services using only localStorage,
 * removing all Supabase dependencies.
 */

import { localStorageService } from '@/services/localStorageService';
import type {
  RateLimitConfig,
  RateLimitStatus,
  LGPDConsent,
  DataExportRequest,
  DataDeletionRequest,
  SecurityLog,
  PrivacySettings,
  AuditLog,
  SecurityAlert,
  ComplianceReport,
} from '../types';

export interface ISecurityService {
  // Rate Limiting
  checkRateLimit(identifier: string, endpoint: string): Promise<RateLimitStatus>;
  recordRequest(identifier: string, endpoint: string): Promise<void>;
  
  // LGPD Compliance
  recordConsent(userId: string, consentType: string, consented: boolean): Promise<LGPDConsent>;
  getConsents(userId: string): Promise<LGPDConsent[]>;
  updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): Promise<PrivacySettings>;
  getPrivacySettings(userId: string): Promise<PrivacySettings | null>;
  
  // Data Rights
  requestDataExport(userId: string): Promise<DataExportRequest>;
  requestDataDeletion(userId: string, reason?: string): Promise<DataDeletionRequest>;
  getDataRequests(userId: string): Promise<{
    exports: DataExportRequest[];
    deletions: DataDeletionRequest[];
  }>;
  
  // Security Logging
  logSecurityEvent(event: Omit<SecurityLog, 'id' | 'timestamp'>): Promise<void>;
  getSecurityLogs(userId?: string, eventType?: string): Promise<SecurityLog[]>;
  createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'created_at'>): Promise<SecurityAlert>;
  
  // Audit Logging
  logAuditEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void>;
  getAuditLogs(userId: string): Promise<AuditLog[]>;
  
  // Compliance
  generateComplianceReport(startDate: string, endDate: string): Promise<ComplianceReport>;
}

export class LocalStorageSecurityService implements ISecurityService {
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  async checkRateLimit(identifier: string, endpoint: string): Promise<RateLimitStatus> {
    try {
      const key = `${identifier}:${endpoint}`;
      const now = Date.now();
      const windowMs = 60000; // 1 minute window
      const maxRequests = 100; // Max 100 requests per minute
      
      const current = this.rateLimitStore.get(key);
      
      if (!current || now > current.resetTime) {
        // Reset window
        this.rateLimitStore.set(key, { count: 0, resetTime: now + windowMs });
        return {
          remaining: maxRequests,
          resetTime: now + windowMs,
          limit: maxRequests,
          isBlocked: false,
        };
      }
      
      const remaining = Math.max(0, maxRequests - current.count);
      
      return {
        remaining,
        resetTime: current.resetTime,
        limit: maxRequests,
        isBlocked: current.count >= maxRequests,
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return {
        remaining: 100,
        resetTime: Date.now() + 60000,
        limit: 100,
        isBlocked: false,
      };
    }
  }

  async recordRequest(identifier: string, endpoint: string): Promise<void> {
    try {
      const key = `${identifier}:${endpoint}`;
      const current = this.rateLimitStore.get(key);
      
      if (current) {
        current.count += 1;
        this.rateLimitStore.set(key, current);
      }
    } catch (error) {
      console.error('Error recording request:', error);
    }
  }

  async recordConsent(userId: string, consentType: string, consented: boolean): Promise<LGPDConsent> {
    try {
      const consent: LGPDConsent = {
        id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        consent_type: consentType as LGPDConsent['consent_type'],
        consented,
        consent_date: new Date().toISOString(),
        ip_address: '127.0.0.1', // Mock IP for localStorage
        user_agent: navigator.userAgent,
        version: '1.0.0',
      };
      
      const data = localStorageService.getData();
      if (data) {
        if (!data.lgpd_consents) data.lgpd_consents = [];
        data.lgpd_consents.push(consent);
        localStorageService.setData(data);
      }
      
      return consent;
    } catch (error) {
      console.error('Error recording consent:', error);
      throw error;
    }
  }

  async getConsents(userId: string): Promise<LGPDConsent[]> {
    try {
      const data = localStorageService.getData();
      return data?.lgpd_consents?.filter(c => c.user_id === userId) || [];
    } catch (error) {
      console.error('Error getting consents:', error);
      return [];
    }
  }

  async updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    try {
      const data = localStorageService.getData();
      if (!data) throw new Error('No data available');
      
      if (!data.privacy_settings) data.privacy_settings = [];
      
      const existingIndex = data.privacy_settings.findIndex(s => s.user_id === userId);
      
      const privacySettings: PrivacySettings = {
        id: existingIndex >= 0 ? data.privacy_settings[existingIndex].id : `privacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        data_processing_consent: settings.data_processing_consent ?? true,
        marketing_consent: settings.marketing_consent ?? false,
        analytics_consent: settings.analytics_consent ?? false,
        profile_visibility: settings.profile_visibility ?? 'private',
        data_retention_days: settings.data_retention_days ?? 365,
        newsletter_consent: settings.newsletter_consent ?? false,
        updated_at: new Date().toISOString(),
      };
      
      if (existingIndex >= 0) {
        data.privacy_settings[existingIndex] = privacySettings;
      } else {
        data.privacy_settings.push(privacySettings);
      }
      
      localStorageService.setData(data);
      return privacySettings;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  async getPrivacySettings(userId: string): Promise<PrivacySettings | null> {
    try {
      const data = localStorageService.getData();
      return data?.privacy_settings?.find(s => s.user_id === userId) || null;
    } catch (error) {
      console.error('Error getting privacy settings:', error);
      return null;
    }
  }

  async requestDataExport(userId: string): Promise<DataExportRequest> {
    try {
      const exportRequest: DataExportRequest = {
        id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        status: 'completed', // Always complete immediately in localStorage mode
        requested_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        download_url: '/api/data-export/' + userId, // Mock URL
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        file_size: 1024, // Mock file size
      };
      
      const data = localStorageService.getData();
      if (data) {
        if (!data.data_export_requests) data.data_export_requests = [];
        data.data_export_requests.push(exportRequest);
        localStorageService.setData(data);
      }
      
      return exportRequest;
    } catch (error) {
      console.error('Error requesting data export:', error);
      throw error;
    }
  }

  async requestDataDeletion(userId: string, reason?: string): Promise<DataDeletionRequest> {
    try {
      const deletionRequest: DataDeletionRequest = {
        id: `deletion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        status: 'pending',
        requested_at: new Date().toISOString(),
        reason,
        retention_period_days: 30,
      };
      
      const data = localStorageService.getData();
      if (data) {
        if (!data.data_deletion_requests) data.data_deletion_requests = [];
        data.data_deletion_requests.push(deletionRequest);
        localStorageService.setData(data);
      }
      
      return deletionRequest;
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      throw error;
    }
  }

  async getDataRequests(userId: string): Promise<{
    exports: DataExportRequest[];
    deletions: DataDeletionRequest[];
  }> {
    try {
      const data = localStorageService.getData();
      
      const exports = data?.data_export_requests?.filter(r => r.user_id === userId) || [];
      const deletions = data?.data_deletion_requests?.filter(r => r.user_id === userId) || [];
      
      return { exports, deletions };
    } catch (error) {
      console.error('Error getting data requests:', error);
      return { exports: [], deletions: [] };
    }
  }

  async logSecurityEvent(event: Omit<SecurityLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const securityLog: SecurityLog = {
        id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...event,
      };
      
      const data = localStorageService.getData();
      if (data) {
        if (!data.security_logs) data.security_logs = [];
        data.security_logs.push(securityLog);
        
        // Keep only last 1000 logs to prevent storage bloat
        if (data.security_logs.length > 1000) {
          data.security_logs = data.security_logs.slice(-1000);
        }
        
        localStorageService.setData(data);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  async getSecurityLogs(userId?: string, eventType?: string): Promise<SecurityLog[]> {
    try {
      const data = localStorageService.getData();
      let logs = data?.security_logs || [];
      
      if (userId) {
        logs = logs.filter(log => log.user_id === userId);
      }
      
      if (eventType) {
        logs = logs.filter(log => log.event_type === eventType);
      }
      
      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Error getting security logs:', error);
      return [];
    }
  }

  async createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'created_at'>): Promise<SecurityAlert> {
    try {
      const securityAlert: SecurityAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        ...alert,
      };
      
      const data = localStorageService.getData();
      if (data) {
        if (!data.security_alerts) data.security_alerts = [];
        data.security_alerts.push(securityAlert);
        localStorageService.setData(data);
      }
      
      return securityAlert;
    } catch (error) {
      console.error('Error creating security alert:', error);
      throw error;
    }
  }

  async logAuditEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const auditLog: AuditLog = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...event,
      };
      
      const data = localStorageService.getData();
      if (data) {
        if (!data.audit_logs) data.audit_logs = [];
        data.audit_logs.push(auditLog);
        
        // Keep only last 500 audit logs per user
        const userLogs = data.audit_logs.filter(log => log.user_id === event.user_id);
        if (userLogs.length > 500) {
          data.audit_logs = data.audit_logs.filter(log => 
            log.user_id !== event.user_id || 
            userLogs.slice(-500).includes(log)
          );
        }
        
        localStorageService.setData(data);
      }
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  async getAuditLogs(userId: string): Promise<AuditLog[]> {
    try {
      const data = localStorageService.getData();
      return data?.audit_logs?.filter(log => log.user_id === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) || [];
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return [];
    }
  }

  async generateComplianceReport(startDate: string, endDate: string): Promise<ComplianceReport> {
    try {
      const data = localStorageService.getData();
      
      const totalUsers = data?.profiles?.length || 0;
      const consents = data?.lgpd_consents || [];
      const dataRequests = (data?.data_export_requests?.length || 0) + (data?.data_deletion_requests?.length || 0);
      const securityIncidents = data?.security_alerts?.filter(alert => alert.severity === 'high' || alert.severity === 'critical').length || 0;
      
      const consentedUsers = new Set(consents.filter(c => c.consented).map(c => c.user_id)).size;
      const consentRate = totalUsers > 0 ? (consentedUsers / totalUsers) * 100 : 100;
      
      const complianceScore = Math.min(100, 
        (consentRate * 0.4) + 
        (Math.max(0, 100 - securityIncidents * 5) * 0.3) + 
        (Math.max(0, 100 - dataRequests * 2) * 0.3)
      );
      
      const report: ComplianceReport = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        report_type: 'lgpd_compliance',
        period_start: startDate,
        period_end: endDate,
        generated_at: new Date().toISOString(),
        summary: {
          total_users: totalUsers,
          consent_rate: Math.round(consentRate),
          data_requests: dataRequests,
          security_incidents: securityIncidents,
          compliance_score: Math.round(complianceScore),
        },
        details: {
          consents_by_type: consents.reduce((acc, consent) => {
            acc[consent.consent_type] = (acc[consent.consent_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          security_events_summary: data?.security_logs?.reduce((acc, log) => {
            acc[log.event_type] = (acc[log.event_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {},
        },
      };
      
      return report;
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }
}