// Public API for Security Module

// Hooks
export {
  usePrivacySettings,
  useUpdatePrivacySettings,
  useConsents,
  useRecordConsent,
  useDataRequests,
  useRequestDataExport,
  useRequestDataDeletion,
  useSecurityLogs,
  useAuditLogs,
  useRateLimit,
  useLGPDCompliance,
  useSecurityDashboard,
} from './hooks/useSecurity';

// Services
export { SupabaseSecurityService } from './services/SecurityService';
export type { ISecurityService } from './services/SecurityService';

// Types
export type {
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
} from './types';

// Utils
export {
  formatSecurityEventType,
  getRiskLevelColor,
  formatConsentType,
  isConsentValid,
  getPrivacyRecommendations,
  calculateSecurityScore,
  formatRateLimitStatus,
  validatePasswordStrength,
  getLGPDChecklist,
  formatAuditAction,
  getDataRetentionPeriods,
  maskSensitiveData,
} from './utils';