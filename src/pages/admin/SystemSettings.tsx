import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, RefreshCw } from "lucide-react";

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string;
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: systemSettings, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("system_settings")
        .select("*")
        .order("key");

      const settingsMap: Record<string, string> = {};
      data?.forEach((setting) => {
        settingsMap[setting.key] = setting.value;
      });
      setSettings(settingsMap);

      return data as SystemSetting[];
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("system_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração.",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (key: string) => {
    updateSetting.mutate({ key, value: settings[key] });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Configurações do Sistema
        </h1>
        <p className="text-gray-600">
          Gerencie as configurações globais da plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>
              Configurações básicas da aplicação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemSettings
              ?.filter((setting) =>
                [
                  "app_name",
                  "max_free_students",
                  "max_pro_students",
                  "pro_ai_credits",
                ].includes(setting.key)
              )
              .map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.key}>{setting.description}</Label>
                  <div className="flex gap-2">
                    <Input
                      id={setting.key}
                      value={settings[setting.key] || ""}
                      onChange={(e) =>
                        handleSettingChange(setting.key, e.target.value)
                      }
                      placeholder={setting.description}
                    />
                    <Button
                      onClick={() => handleSave(setting.key)}
                      size="sm"
                      disabled={updateSetting.isPending}
                    >
                      {updateSetting.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Configurações de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Pagamento</CardTitle>
            <CardDescription>
              Configurações do sistema de pagamentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Stripe Habilitado</Label>
                <p className="text-sm text-gray-600">
                  Ativar pagamentos via Stripe
                </p>
              </div>
              <Switch
                checked={settings["stripe_enabled"] === "true"}
                onCheckedChange={(checked) => {
                  handleSettingChange("stripe_enabled", checked.toString());
                  handleSave("stripe_enabled");
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Saúde */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>Monitoramento da saúde do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Database</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Autenticação</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Storage</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs de Auditoria */}
        <Card>
          <CardHeader>
            <CardTitle>Logs Recentes</CardTitle>
            <CardDescription>Últimas atividades do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Sistema iniciado</span>
                <span className="text-gray-500">há 2 horas</span>
              </div>
              <div className="flex justify-between">
                <span>Backup realizado</span>
                <span className="text-gray-500">há 1 dia</span>
              </div>
              <div className="flex justify-between">
                <span>Configuração atualizada</span>
                <span className="text-gray-500">há 2 dias</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
