// Security Module Types
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  endpoint: string; // API endpoint pattern
  identifier: string; // Rate limit identifier (userId, IP, etc.)
}

export interface RateLimitStatus {
  remaining: number;
  resetTime: number;
  limit: number;
  isBlocked: boolean;
}

export interface LGPDConsent {
  id: string;
  user_id: string;
  consent_type: 'data_processing' | 'marketing' | 'analytics' | 'cookies';
  consented: boolean;
  consent_date: string;
  ip_address?: string;
  user_agent?: string;
  version: string; // Privacy policy version
}

export interface DataExportRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_at: string;
  completed_at?: string;
  download_url?: string;
  expires_at?: string;
  file_size?: number;
}

export interface DataDeletionRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  requested_at: string;
  processed_at?: string;
  reason?: string;
  retention_period_days: number;
}

export interface SecurityLog {
  id: string;
  user_id?: string;
  event_type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'data_access' | 'rate_limit_exceeded';
  details: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  risk_level: 'low' | 'medium' | 'high';
}

export interface PrivacySettings {
  id: string;
  user_id: string;
  data_processing_consent: boolean;
  marketing_consent: boolean;
  analytics_consent: boolean;
  profile_visibility: 'public' | 'private' | 'trainers_only';
  data_retention_days: number;
  newsletter_consent: boolean;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

export interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'rate_limit_exceeded' | 'data_breach_attempt' | 'unusual_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  description: string;
  details: Record<string, unknown>;
  resolved: boolean;
  resolved_at?: string;
  created_at: string;
}

export interface ComplianceReport {
  id: string;
  report_type: 'lgpd_compliance' | 'data_audit' | 'security_assessment';
  period_start: string;
  period_end: string;
  generated_at: string;
  summary: {
    total_users: number;
    consent_rate: number;
    data_requests: number;
    security_incidents: number;
    compliance_score: number;
  };
  details: Record<string, unknown>;
}