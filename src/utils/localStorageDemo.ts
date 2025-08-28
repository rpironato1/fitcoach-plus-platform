/**
 * LocalStorage Demo and Testing Utilities
 *
 * This script provides utilities to test and demonstrate the localStorage functionality.
 * Run this in the browser console to test various scenarios.
 */

import { localStorageService } from "@/services/localStorageService";

// Add this to window for browser console access
declare global {
  interface Window {
    fitcoachLocalStorageDemo: typeof fitcoachLocalStorageDemo;
    localStorageService: typeof localStorageService;
  }
}

const fitcoachLocalStorageDemo = {
  // Storage mode management
  enableLocalStorage: () => {
    localStorageService.enableLocalStorageMode();
    console.log("✅ localStorage mode enabled");
    window.location.reload();
  },

  disableLocalStorage: () => {
    localStorageService.disableLocalStorageMode();
    console.log("✅ Supabase mode enabled");
    window.location.reload();
  },

  // Quick login functions
  loginAsAdmin: async () => {
    try {
      await localStorageService.quickLoginAsAdmin();
      console.log("✅ Logged in as Admin");
      window.location.reload();
    } catch (error) {
      console.error("❌ Admin login failed:", error);
    }
  },

  loginAsTrainer: async () => {
    try {
      await localStorageService.quickLoginAsTrainer();
      console.log("✅ Logged in as Trainer");
      window.location.reload();
    } catch (error) {
      console.error("❌ Trainer login failed:", error);
    }
  },

  loginAsStudent: async () => {
    try {
      await localStorageService.quickLoginAsStudent();
      console.log("✅ Logged in as Student");
      window.location.reload();
    } catch (error) {
      console.error("❌ Student login failed:", error);
    }
  },

  // Data management
  testEmptyData: () => {
    localStorageService.addDataVariation("empty");
    console.log("✅ Empty data loaded");
    window.location.reload();
  },

  testMinimalData: () => {
    localStorageService.addDataVariation("minimal");
    console.log("✅ Minimal data loaded");
    window.location.reload();
  },

  testFullData: () => {
    localStorageService.addDataVariation("full");
    console.log("✅ Full data loaded");
    window.location.reload();
  },

  clearAll: () => {
    localStorageService.clearData();
    console.log("✅ All localStorage data cleared");
    window.location.reload();
  },

  exportData: () => {
    const data = localStorageService.exportForSupabase();
    console.log("📋 Exported data:", data);

    // Create downloadable file
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fitcoach-localStorage-export.json";
    a.click();
    URL.revokeObjectURL(url);

    return data;
  },

  // Info functions
  getStatus: () => {
    const isUsingLocalStorage = localStorageService.shouldUseLocalStorage();
    const session = localStorageService.getCurrentSession();
    const data = localStorageService.getData();

    console.log("📊 FitCoach localStorage Status:");
    console.log("  - Using localStorage:", isUsingLocalStorage);
    console.log(
      "  - Current session:",
      session ? `${session.user.email} (${session.user.id})` : "None"
    );
    console.log("  - Data version:", data?.dataVersion || "N/A");
    console.log("  - Last updated:", data?.lastUpdated || "N/A");

    if (data) {
      console.log("  - Users:", data.users?.length || 0);
      console.log("  - Profiles:", data.profiles?.length || 0);
      console.log("  - Trainers:", data.trainer_profiles?.length || 0);
      console.log("  - Students:", data.student_profiles?.length || 0);
      console.log("  - Sessions:", data.sessions?.length || 0);
      console.log("  - Payments:", data.payments?.length || 0);
    }

    return {
      usingLocalStorage: isUsingLocalStorage,
      session,
      data,
    };
  },

  getDemoCredentials: () => {
    const credentials = localStorageService.getDemoCredentials();
    console.log("🔑 Demo Credentials:");
    console.log("  Admin:", credentials.admin);
    console.log("  Trainer:", credentials.trainer);
    console.log("  Student:", credentials.student);
    return credentials;
  },

  // Navigation helpers
  goToManager: () => {
    window.location.href = "/localStorage-manager";
  },

  goToAdminDashboard: () => {
    window.location.href = "/admin";
  },

  goToTrainerDashboard: () => {
    window.location.href = "/trainer";
  },

  goToStudentDashboard: () => {
    window.location.href = "/student";
  },

  goToStudentDemo: () => {
    window.location.href = "/student-demo";
  },

  // Help function
  help: () => {
    console.log(`
🚀 FitCoach LocalStorage Demo Commands:

📊 STATUS & INFO:
  fitcoachLocalStorageDemo.getStatus() - View current status
  fitcoachLocalStorageDemo.getDemoCredentials() - Show demo login credentials

🔄 STORAGE MODE:
  fitcoachLocalStorageDemo.enableLocalStorage() - Switch to localStorage mode
  fitcoachLocalStorageDemo.disableLocalStorage() - Switch to Supabase mode

🔑 QUICK LOGIN:
  fitcoachLocalStorageDemo.loginAsAdmin() - Login as Admin
  fitcoachLocalStorageDemo.loginAsTrainer() - Login as Trainer  
  fitcoachLocalStorageDemo.loginAsStudent() - Login as Student

📊 DATA MANAGEMENT:
  fitcoachLocalStorageDemo.testEmptyData() - Load empty dataset
  fitcoachLocalStorageDemo.testMinimalData() - Load minimal dataset
  fitcoachLocalStorageDemo.testFullData() - Load full dataset
  fitcoachLocalStorageDemo.exportData() - Export data as JSON
  fitcoachLocalStorageDemo.clearAll() - Clear all data

🧭 NAVIGATION:
  fitcoachLocalStorageDemo.goToManager() - Go to localStorage Manager
  fitcoachLocalStorageDemo.goToAdminDashboard() - Go to Admin Dashboard
  fitcoachLocalStorageDemo.goToTrainerDashboard() - Go to Trainer Dashboard
  fitcoachLocalStorageDemo.goToStudentDashboard() - Go to Student Dashboard
  fitcoachLocalStorageDemo.goToStudentDemo() - Go to Student Demo

📝 EXAMPLES:
  1. Enable localStorage mode: fitcoachLocalStorageDemo.enableLocalStorage()
  2. Login as trainer: fitcoachLocalStorageDemo.loginAsTrainer()
  3. Load full test data: fitcoachLocalStorageDemo.testFullData()
  4. Export data: fitcoachLocalStorageDemo.exportData()

💡 TIP: Visit /localStorage-manager for a graphical interface to manage data!
    `);
  },
};

// Add to window for browser console access
window.fitcoachLocalStorageDemo = fitcoachLocalStorageDemo;
window.localStorageService = localStorageService;

// Auto-run help on load in development
if (process.env.NODE_ENV === "development") {
  console.log(
    "🚀 FitCoach LocalStorage Demo loaded! Run fitcoachLocalStorageDemo.help() for all commands."
  );
  console.log(
    "💡 Quick start: fitcoachLocalStorageDemo.enableLocalStorage() then fitcoachLocalStorageDemo.loginAsTrainer()"
  );
}

export {};
