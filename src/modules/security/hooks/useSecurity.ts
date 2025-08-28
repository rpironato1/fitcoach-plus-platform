import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth";
import { toast } from "sonner";
import { container } from "@/core/container";
import type { ISecurityService } from "../services/SecurityService";
import type { PrivacySettings, LGPDConsent } from "../types";

// Get security service from DI container
const getSecurityService = (): ISecurityService => {
  return container.resolve<ISecurityService>("SecurityService");
};

// Privacy Settings hooks
export function usePrivacySettings() {
  const { profile } = useAuth();
  const securityService = getSecurityService();

  return useQuery({
    queryKey: ["privacy-settings", profile?.id],
    queryFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return securityService.getPrivacySettings(profile.id);
    },
    enabled: !!profile?.id,
  });
}

export function useUpdatePrivacySettings() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const securityService = getSecurityService();

  return useMutation({
    mutationFn: (settings: Partial<PrivacySettings>) => {
      if (!profile?.id) throw new Error("User not authenticated");
      return securityService.updatePrivacySettings(profile.id, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy-settings"] });
      toast.success("Configurações de privacidade atualizadas com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar configurações: " + error.message);
    },
  });
}

// LGPD Consent hooks
export function useConsents() {
  const { profile } = useAuth();
  const securityService = getSecurityService();

  return useQuery({
    queryKey: ["consents", profile?.id],
    queryFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return securityService.getConsents(profile.id);
    },
    enabled: !!profile?.id,
  });
}

export function useRecordConsent() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const securityService = getSecurityService();

  return useMutation({
    mutationFn: ({
      consentType,
      consented,
    }: {
      consentType: string;
      consented: boolean;
    }) => {
      if (!profile?.id) throw new Error("User not authenticated");
      return securityService.recordConsent(profile.id, consentType, consented);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consents"] });
      toast.success("Consentimento registrado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao registrar consentimento: " + error.message);
    },
  });
}

// Data Rights hooks
export function useDataRequests() {
  const { profile } = useAuth();
  const securityService = getSecurityService();

  return useQuery({
    queryKey: ["data-requests", profile?.id],
    queryFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return securityService.getDataRequests(profile.id);
    },
    enabled: !!profile?.id,
  });
}

export function useRequestDataExport() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const securityService = getSecurityService();

  return useMutation({
    mutationFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return securityService.requestDataExport(profile.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-requests"] });
      toast.success(
        "Solicitação de exportação de dados criada com sucesso! Você receberá um email quando estiver pronta."
      );
    },
    onError: (error) => {
      toast.error("Erro ao solicitar exportação: " + error.message);
    },
  });
}

export function useRequestDataDeletion() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const securityService = getSecurityService();

  return useMutation({
    mutationFn: (reason?: string) => {
      if (!profile?.id) throw new Error("User not authenticated");
      return securityService.requestDataDeletion(profile.id, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-requests"] });
      toast.success(
        "Solicitação de exclusão de dados criada com sucesso! Sua conta será analisada conforme a LGPD."
      );
    },
    onError: (error) => {
      toast.error("Erro ao solicitar exclusão: " + error.message);
    },
  });
}

// Security Logs hooks
export function useSecurityLogs(eventType?: string) {
  const { profile } = useAuth();
  const securityService = getSecurityService();

  return useQuery({
    queryKey: ["security-logs", profile?.id, eventType],
    queryFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return securityService.getSecurityLogs(profile.id, eventType);
    },
    enabled: !!profile?.id,
  });
}

// Audit Logs hooks
export function useAuditLogs() {
  const { profile } = useAuth();
  const securityService = getSecurityService();

  return useQuery({
    queryKey: ["audit-logs", profile?.id],
    queryFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return securityService.getAuditLogs(profile.id);
    },
    enabled: !!profile?.id,
  });
}

// Rate Limiting hook
export function useRateLimit(endpoint: string) {
  const { profile } = useAuth();
  const securityService = getSecurityService();

  return useQuery({
    queryKey: ["rate-limit", profile?.id, endpoint],
    queryFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return securityService.checkRateLimit(profile.id, endpoint);
    },
    enabled: !!profile?.id,
    refetchInterval: 60000, // Check every minute
  });
}

// Custom hook for LGPD compliance status
export function useLGPDCompliance() {
  const { data: consents } = useConsents();
  const { data: privacySettings } = usePrivacySettings();

  const getComplianceStatus = () => {
    if (!consents || !privacySettings) {
      return {
        isCompliant: false,
        missingConsents: [],
        recommendations: ["Configure suas preferências de privacidade"],
      };
    }

    const requiredConsents = ["data_processing", "analytics"];
    const givenConsents = consents
      .filter((consent) => consent.consented)
      .map((consent) => consent.consent_type);

    const missingConsents = requiredConsents.filter(
      (required) => !givenConsents.includes(required)
    );

    const isCompliant = missingConsents.length === 0;

    const recommendations = [];
    if (!isCompliant) {
      recommendations.push("Complete todos os consentimentos obrigatórios");
    }
    if (!privacySettings.newsletter_consent) {
      recommendations.push(
        "Considere aceitar nossa newsletter para updates importantes"
      );
    }

    return {
      isCompliant,
      missingConsents,
      recommendations,
      totalConsents: requiredConsents.length,
      givenConsents: givenConsents.length,
    };
  };

  return {
    ...getComplianceStatus(),
    consents,
    privacySettings,
  };
}

// Hook for security dashboard
export function useSecurityDashboard() {
  const { data: securityLogs } = useSecurityLogs();
  const { data: auditLogs } = useAuditLogs();
  const { data: dataRequests } = useDataRequests();

  const getDashboardStats = () => {
    const recentSecurityEvents = securityLogs?.slice(0, 5) || [];
    const recentAuditEvents = auditLogs?.slice(0, 5) || [];

    const failedLogins =
      securityLogs?.filter((log) => log.event_type === "failed_login").length ||
      0;

    const suspiciousActivity =
      securityLogs?.filter((log) => log.risk_level === "high").length || 0;

    const pendingDataRequests = [
      ...(dataRequests?.exports.filter((req) => req.status === "pending") ||
        []),
      ...(dataRequests?.deletions.filter((req) => req.status === "pending") ||
        []),
    ].length;

    return {
      recentSecurityEvents,
      recentAuditEvents,
      failedLogins,
      suspiciousActivity,
      pendingDataRequests,
      securityScore: Math.max(
        0,
        100 - failedLogins * 5 - suspiciousActivity * 10
      ),
    };
  };

  return getDashboardStats();
}
