import { supabase } from '@/integrations/supabase/client';
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

export class SupabaseSecurityService implements ISecurityService {
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  async checkRateLimit(identifier: string, endpoint: string): Promise<RateLimitStatus> {
    const config = this.getRateLimitConfig(endpoint);
    const key = `${identifier}:${endpoint}`;
    const now = Date.now();
    
    const current = this.rateLimitStore.get(key);
    
    if (!current || now > current.resetTime) {
      // Reset window
      this.rateLimitStore.set(key, {
        count: 0,
        resetTime: now + config.windowMs,
      });
      
      return {
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        limit: config.maxRequests,
        isBlocked: false,
      };
    }
    
    const remaining = Math.max(0, config.maxRequests - current.count);
    const isBlocked = current.count >= config.maxRequests;
    
    return {
      remaining,
      resetTime: current.resetTime,
      limit: config.maxRequests,
      isBlocked,
    };
  }

  async recordRequest(identifier: string, endpoint: string): Promise<void> {
    const key = `${identifier}:${endpoint}`;
    const current = this.rateLimitStore.get(key);
    
    if (current) {
      current.count += 1;
      this.rateLimitStore.set(key, current);
      
      // Log if rate limit exceeded
      if (current.count > this.getRateLimitConfig(endpoint).maxRequests) {
        await this.logSecurityEvent({
          user_id: identifier,
          event_type: 'rate_limit_exceeded',
          details: { endpoint, count: current.count },
          ip_address: 'unknown',
          user_agent: 'unknown',
          risk_level: 'medium',
        });
      }
    }
  }

  async recordConsent(userId: string, consentType: string, consented: boolean): Promise<LGPDConsent> {
    const { data, error } = await supabase
      .from('lgpd_consents')
      .insert([{
        user_id: userId,
        consent_type: consentType,
        consented,
        consent_date: new Date().toISOString(),
        version: '1.0', // Current privacy policy version
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getConsents(userId: string): Promise<LGPDConsent[]> {
    const { data, error } = await supabase
      .from('lgpd_consents')
      .select('*')
      .eq('user_id', userId)
      .order('consent_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    const { data, error } = await supabase
      .from('privacy_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Log the privacy settings change
    await this.logAuditEvent({
      user_id: userId,
      action: 'privacy_settings_updated',
      resource: 'privacy_settings',
      resource_id: data.id,
      new_values: settings,
      ip_address: 'unknown',
      user_agent: 'unknown',
    });

    return data;
  }

  async getPrivacySettings(userId: string): Promise<PrivacySettings | null> {
    const { data, error } = await supabase
      .from('privacy_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  async requestDataExport(userId: string): Promise<DataExportRequest> {
    const { data, error } = await supabase
      .from('data_export_requests')
      .insert([{
        user_id: userId,
        status: 'pending',
        requested_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    // Log the data export request
    await this.logAuditEvent({
      user_id: userId,
      action: 'data_export_requested',
      resource: 'data_export_requests',
      resource_id: data.id,
      new_values: { status: 'pending' },
      ip_address: 'unknown',
      user_agent: 'unknown',
    });

    return data;
  }

  async requestDataDeletion(userId: string, reason?: string): Promise<DataDeletionRequest> {
    const { data, error } = await supabase
      .from('data_deletion_requests')
      .insert([{
        user_id: userId,
        status: 'pending',
        requested_at: new Date().toISOString(),
        reason,
        retention_period_days: 30, // Standard retention period
      }])
      .select()
      .single();

    if (error) throw error;

    // Log the data deletion request
    await this.logAuditEvent({
      user_id: userId,
      action: 'data_deletion_requested',
      resource: 'data_deletion_requests',
      resource_id: data.id,
      new_values: { status: 'pending', reason },
      ip_address: 'unknown',
      user_agent: 'unknown',
    });

    return data;
  }

  async getDataRequests(userId: string): Promise<{
    exports: DataExportRequest[];
    deletions: DataDeletionRequest[];
  }> {
    const [exportsResult, deletionsResult] = await Promise.all([
      supabase
        .from('data_export_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false }),
      supabase
        .from('data_deletion_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false }),
    ]);

    if (exportsResult.error) throw exportsResult.error;
    if (deletionsResult.error) throw deletionsResult.error;

    return {
      exports: exportsResult.data || [],
      deletions: deletionsResult.data || [],
    };
  }

  async logSecurityEvent(event: Omit<SecurityLog, 'id' | 'timestamp'>): Promise<void> {
    const { error } = await supabase
      .from('security_logs')
      .insert([{
        ...event,
        timestamp: new Date().toISOString(),
      }]);

    if (error) console.error('Error logging security event:', error);
  }

  async getSecurityLogs(userId?: string, eventType?: string): Promise<SecurityLog[]> {
    let query = supabase
      .from('security_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'created_at'>): Promise<SecurityAlert> {
    const { data, error } = await supabase
      .from('security_alerts')
      .insert([{
        ...alert,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async logAuditEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        ...event,
        timestamp: new Date().toISOString(),
      }]);

    if (error) console.error('Error logging audit event:', error);
  }

  async getAuditLogs(userId: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async generateComplianceReport(startDate: string, endDate: string): Promise<ComplianceReport> {
    // This would typically aggregate data from multiple tables
    // For now, return a mock compliance report
    return {
      id: 'cr_' + Date.now(),
      report_type: 'lgpd_compliance',
      period_start: startDate,
      period_end: endDate,
      generated_at: new Date().toISOString(),
      summary: {
        total_users: 0,
        consent_rate: 0,
        data_requests: 0,
        security_incidents: 0,
        compliance_score: 95,
      },
      details: {},
    };
  }

  private getRateLimitConfig(endpoint: string): RateLimitConfig {
    // Default rate limits by endpoint type
    const configs: Record<string, RateLimitConfig> = {
      '/api/auth': {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5,
        endpoint,
        identifier: 'ip',
      },
      '/api/ai': {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10,
        endpoint,
        identifier: 'userId',
      },
      '/api/payments': {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 20,
        endpoint,
        identifier: 'userId',
      },
      default: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        endpoint,
        identifier: 'userId',
      },
    };

    return configs[endpoint] || configs.default;
  }
}