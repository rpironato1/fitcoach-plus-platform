import type { SecurityLog, LGPDConsent, PrivacySettings, RateLimitStatus } from '../types';

/**
 * Format security event type for display
 */
export function formatSecurityEventType(eventType: string): string {
  const eventTypes = {
    login: 'Login realizado',
    logout: 'Logout realizado',
    failed_login: 'Tentativa de login falhada',
    password_change: 'Senha alterada',
    data_access: 'Dados acessados',
    rate_limit_exceeded: 'Limite de taxa excedido',
  };
  
  return eventTypes[eventType as keyof typeof eventTypes] || eventType;
}

/**
 * Get risk level color for UI
 */
export function getRiskLevelColor(riskLevel: string): string {
  const colors = {
    low: 'green',
    medium: 'yellow',
    high: 'red',
  };
  
  return colors[riskLevel as keyof typeof colors] || 'gray';
}

/**
 * Format consent type for display
 */
export function formatConsentType(consentType: string): string {
  const types = {
    data_processing: 'Processamento de Dados',
    marketing: 'Marketing e Comunicação',
    analytics: 'Análise e Métricas',
    cookies: 'Cookies e Tecnologias Similares',
  };
  
  return types[consentType as keyof typeof types] || consentType;
}

/**
 * Check if consent is still valid (not expired)
 */
export function isConsentValid(consent: LGPDConsent, validityDays: number = 365): boolean {
  const consentDate = new Date(consent.consent_date);
  const expiryDate = new Date(consentDate.getTime() + (validityDays * 24 * 60 * 60 * 1000));
  return new Date() < expiryDate;
}

/**
 * Get privacy settings recommendations
 */
export function getPrivacyRecommendations(settings: PrivacySettings | null): string[] {
  const recommendations: string[] = [];
  
  if (!settings) {
    return ['Configure suas preferências de privacidade para melhor proteção'];
  }
  
  if (!settings.data_processing_consent) {
    recommendations.push('Revise o consentimento para processamento de dados');
  }
  
  if (settings.profile_visibility === 'public') {
    recommendations.push('Considere tornar seu perfil privado para maior segurança');
  }
  
  if (settings.data_retention_days > 1095) { // 3 years
    recommendations.push('Considere reduzir o período de retenção de dados');
  }
  
  if (!settings.analytics_consent) {
    recommendations.push('Habilite analytics para ajudar a melhorar nossos serviços');
  }
  
  return recommendations.length > 0 
    ? recommendations 
    : ['Suas configurações de privacidade estão adequadas'];
}

/**
 * Calculate security score based on various factors
 */
export function calculateSecurityScore(factors: {
  failedLogins: number;
  suspiciousActivity: number;
  hasStrongPassword: boolean;
  has2FA: boolean;
  recentActivityNormal: boolean;
}): number {
  let score = 100;
  
  // Deduct points for security issues
  score -= factors.failedLogins * 5;
  score -= factors.suspiciousActivity * 10;
  
  // Add points for security measures
  if (factors.hasStrongPassword) score += 10;
  if (factors.has2FA) score += 15;
  if (factors.recentActivityNormal) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Format rate limit status for display
 */
export function formatRateLimitStatus(status: RateLimitStatus): {
  message: string;
  severity: 'info' | 'warning' | 'error';
} {
  if (status.isBlocked) {
    const resetTime = new Date(status.resetTime);
    return {
      message: `Limite excedido. Tente novamente às ${resetTime.toLocaleTimeString()}`,
      severity: 'error',
    };
  }
  
  if (status.remaining < 3) {
    return {
      message: `Cuidado: apenas ${status.remaining} tentativas restantes`,
      severity: 'warning',
    };
  }
  
  return {
    message: `${status.remaining} de ${status.limit} tentativas disponíveis`,
    severity: 'info',
  };
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 20;
  else feedback.push('Deve ter pelo menos 8 caracteres');
  
  if (password.length >= 12) score += 10;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 10;
  else feedback.push('Deve conter letras minúsculas');
  
  if (/[A-Z]/.test(password)) score += 10;
  else feedback.push('Deve conter letras maiúsculas');
  
  if (/\d/.test(password)) score += 10;
  else feedback.push('Deve conter números');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
  else feedback.push('Deve conter símbolos especiais');
  
  // Common patterns check
  if (!/(.)\1{2,}/.test(password)) score += 10;
  else feedback.push('Evite repetir caracteres consecutivos');
  
  if (!/123|abc|qwe|password/i.test(password)) score += 10;
  else feedback.push('Evite sequências ou palavras comuns');
  
  const isStrong = score >= 70;
  
  return { score, feedback, isStrong };
}

/**
 * Get LGPD compliance checklist
 */
export function getLGPDChecklist(): Array<{
  id: string;
  title: string;
  description: string;
  required: boolean;
}> {
  return [
    {
      id: 'data_processing_consent',
      title: 'Consentimento para Processamento de Dados',
      description: 'Autorização para processar seus dados pessoais conforme nossa política',
      required: true,
    },
    {
      id: 'analytics_consent',
      title: 'Consentimento para Analytics',
      description: 'Permissão para coletar dados analíticos para melhorar nossos serviços',
      required: true,
    },
    {
      id: 'marketing_consent',
      title: 'Consentimento para Marketing',
      description: 'Autorização para enviar comunicações promocionais',
      required: false,
    },
    {
      id: 'cookies_consent',
      title: 'Consentimento para Cookies',
      description: 'Aceitação do uso de cookies e tecnologias similares',
      required: false,
    },
    {
      id: 'privacy_settings',
      title: 'Configurações de Privacidade',
      description: 'Definir preferências de visibilidade e retenção de dados',
      required: true,
    },
  ];
}

/**
 * Format audit log action for display
 */
export function formatAuditAction(action: string): string {
  const actions = {
    profile_updated: 'Perfil atualizado',
    privacy_settings_updated: 'Configurações de privacidade atualizadas',
    consent_given: 'Consentimento concedido',
    consent_withdrawn: 'Consentimento retirado',
    data_export_requested: 'Exportação de dados solicitada',
    data_deletion_requested: 'Exclusão de dados solicitada',
    password_changed: 'Senha alterada',
    two_factor_enabled: 'Autenticação de dois fatores habilitada',
    two_factor_disabled: 'Autenticação de dois fatores desabilitada',
  };
  
  return actions[action as keyof typeof actions] || action;
}

/**
 * Get data retention periods
 */
export function getDataRetentionPeriods(): Array<{ value: number; label: string; description: string }> {
  return [
    {
      value: 30,
      label: '30 dias',
      description: 'Período mínimo recomendado',
    },
    {
      value: 90,
      label: '3 meses',
      description: 'Período padrão',
    },
    {
      value: 365,
      label: '1 ano',
      description: 'Período estendido',
    },
    {
      value: 1095,
      label: '3 anos',
      description: 'Período máximo (não recomendado)',
    },
  ];
}

/**
 * Mask sensitive data for logs
 */
export function maskSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sensitiveFields = ['password', 'email', 'phone', 'cpf', 'credit_card'];
  const masked = { ...data };
  
  for (const key in masked) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      if (typeof masked[key] === 'string') {
        masked[key] = '*'.repeat(masked[key].length);
      }
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }
  
  return masked;
}