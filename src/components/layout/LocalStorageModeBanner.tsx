/**
 * LocalStorage Mode Banner
 *
 * Shows a banner when the app is running in localStorage mode
 * for testing purposes
 */

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Database, X, Settings } from "lucide-react";
import { localStorageService } from "@/services/localStorageService";

export function LocalStorageModeBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isUsingLocalStorage = localStorageService.shouldUseLocalStorage();
    const isDismissed =
      sessionStorage.getItem("localStorage_banner_dismissed") === "true";

    setShowBanner(isUsingLocalStorage && !isDismissed);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
    sessionStorage.setItem("localStorage_banner_dismissed", "true");
  };

  const goToManager = () => {
    window.location.href = "/localStorage-manager";
  };

  if (!showBanner || dismissed) {
    return null;
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-800 sticky top-0 z-50 rounded-none">
      <Database className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span>
            <strong>Modo Teste Ativo:</strong> Usando dados localStorage para
            demonstração.
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={goToManager}
            className="ml-2 h-6 text-xs border-amber-300 text-amber-800 hover:bg-amber-100"
          >
            <Settings className="h-3 w-3 mr-1" />
            Gerenciar
          </Button>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="h-6 w-6 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-200"
        >
          <X className="h-3 w-3" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
