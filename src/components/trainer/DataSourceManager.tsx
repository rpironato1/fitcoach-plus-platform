/**
 * Data Source Manager Component
 *
 * Provides controls to toggle between localStorage and Supabase data sources,
 * manage localStorage data variations, and export data for migration.
 */

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Database,
  Download,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { localStorageService } from "@/services/localStorageService";
import { toast } from "sonner";

interface DataSourceManagerProps {
  useLocalStorage: boolean;
  onToggleDataSource: (useLocal: boolean) => void;
}

export function DataSourceManager({
  useLocalStorage,
  onToggleDataSource,
}: DataSourceManagerProps) {
  const [dataVariation, setDataVariation] = useState<
    "empty" | "full" | "minimal"
  >("full");
  const [isExporting, setIsExporting] = useState(false);

  const handleDataVariationChange = (
    variation: "empty" | "full" | "minimal"
  ) => {
    setDataVariation(variation);
    localStorageService.addDataVariation(variation);
    toast.success(
      `Dados ${variation === "full" ? "completos" : variation === "minimal" ? "mínimos" : "vazios"} carregados!`
    );

    // Trigger a re-render by clearing React Query cache
    window.location.reload();
  };

  const handleClearData = () => {
    localStorageService.clearData();
    toast.success("Dados localStorage limpos!");
    window.location.reload();
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const exportData = localStorageService.exportForSupabase();

      // Create and download file
      const blob = new Blob([exportData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fitcoach_data_export_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Dados exportados com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar dados");
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getDataInfo = () => {
    const data = localStorageService.getData();
    if (!data) return null;

    return {
      students: data.students.length,
      sessions: data.sessions.length,
      payments: data.payments.length,
      dietPlans: data.diet_plans.length,
      workoutPlans: data.workout_plans.length,
      lastUpdated: new Date(data.lastUpdated).toLocaleString("pt-BR"),
    };
  };

  const dataInfo = getDataInfo();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Gerenciador de Fonte de Dados
            </CardTitle>
            <CardDescription>
              Alterne entre localStorage e Supabase para teste e desenvolvimento
            </CardDescription>
          </div>
          <Badge variant={useLocalStorage ? "default" : "secondary"}>
            {useLocalStorage ? "LocalStorage" : "Supabase"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Source Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label
              htmlFor="data-source-toggle"
              className="text-base font-medium"
            >
              Usar LocalStorage
            </Label>
            <div className="text-sm text-muted-foreground">
              Ative para usar dados locais em vez do Supabase
            </div>
          </div>
          <Switch
            id="data-source-toggle"
            checked={useLocalStorage}
            onCheckedChange={onToggleDataSource}
          />
        </div>

        {useLocalStorage && (
          <>
            {/* Data Variation Controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <Label className="text-sm font-medium">
                  Variações de Dados para Teste
                </Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  variant={dataVariation === "full" ? "default" : "outline"}
                  onClick={() => handleDataVariationChange("full")}
                  size="sm"
                  className="justify-start"
                >
                  Dados Completos
                </Button>
                <Button
                  variant={dataVariation === "minimal" ? "default" : "outline"}
                  onClick={() => handleDataVariationChange("minimal")}
                  size="sm"
                  className="justify-start"
                >
                  Dados Mínimos
                </Button>
                <Button
                  variant={dataVariation === "empty" ? "default" : "outline"}
                  onClick={() => handleDataVariationChange("empty")}
                  size="sm"
                  className="justify-start"
                >
                  Dados Vazios
                </Button>
              </div>
            </div>

            {/* Data Info */}
            {dataInfo && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Dados Atuais</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alunos:</span>
                    <span className="font-medium">{dataInfo.students}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sessões:</span>
                    <span className="font-medium">{dataInfo.sessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pagamentos:</span>
                    <span className="font-medium">{dataInfo.payments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dietas:</span>
                    <span className="font-medium">{dataInfo.dietPlans}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Treinos:</span>
                    <span className="font-medium">{dataInfo.workoutPlans}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Atualizado:</span>
                    <span className="font-medium text-xs">
                      {dataInfo.lastUpdated}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Data Management Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button
                onClick={handleExportData}
                disabled={isExporting}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Exportar para Supabase
              </Button>

              <Button
                onClick={() => {
                  localStorageService.initializeData();
                  toast.success("Dados reinicializados!");
                  window.location.reload();
                }}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reinicializar
              </Button>

              <Button
                onClick={handleClearData}
                size="sm"
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Limpar Dados
              </Button>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
              <strong>💡 Dica:</strong> Os dados localStorage são estruturados
              em JSON compatível com Supabase. Use "Exportar para Supabase" para
              gerar um arquivo JSON que pode ser importado diretamente no banco.
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
