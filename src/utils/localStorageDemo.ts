/**
 * LocalStorage Demo and Testing Utilities
 * 
 * This script provides utilities to test and demonstrate the localStorage functionality.
 * Run this in the browser console to test various scenarios.
 */

// Add this to window for browser console access
declare global {
  interface Window {
    fitcoachLocalStorageDemo: typeof fitcoachLocalStorageDemo;
  }
}

const fitcoachLocalStorageDemo = {
  // Test functions
  testEmptyData: () => {
    localStorage.setItem('use_localstorage', 'true');
    window.location.reload();
  },
  
  testMinimalData: () => {
    localStorage.setItem('use_localstorage', 'true');
    window.location.reload();
  },
  
  testFullData: () => {
    localStorage.setItem('use_localstorage', 'true');
    window.location.reload();
  },
  
  clearAll: () => {
    localStorage.clear();
    window.location.reload();
  },
  
  exportData: () => {
    const data = localStorage.getItem('fitcoach_data');
    if (data) {
      console.log('Current localStorage data:', JSON.parse(data));
      return JSON.parse(data);
    }
    console.log('No localStorage data found');
    return null;
  },
  
  // Utility to switch data sources
  useSupabase: () => {
    localStorage.setItem('use_localstorage', 'false');
    window.location.reload();
  },
  
  useLocalStorage: () => {
    localStorage.setItem('use_localstorage', 'true');
    window.location.reload();
  },
  
  // Help function
  help: () => {
    console.log(`
FitCoach LocalStorage Demo Commands:

1. fitcoachLocalStorageDemo.useLocalStorage() - Switch to localStorage
2. fitcoachLocalStorageDemo.useSupabase() - Switch to Supabase
3. fitcoachLocalStorageDemo.testEmptyData() - Test with empty data
4. fitcoachLocalStorageDemo.testMinimalData() - Test with minimal data  
5. fitcoachLocalStorageDemo.testFullData() - Test with full data
6. fitcoachLocalStorageDemo.exportData() - View current data
7. fitcoachLocalStorageDemo.clearAll() - Clear all data
8. fitcoachLocalStorageDemo.help() - Show this help

Example usage:
1. Open browser console
2. Run: fitcoachLocalStorageDemo.useLocalStorage()
3. Navigate to trainer dashboard to see localStorage data
4. Use the Data Source Manager component to switch variations
    `);
  }
};

// Add to window for browser console access
window.fitcoachLocalStorageDemo = fitcoachLocalStorageDemo;

// Auto-run help on load
console.log('FitCoach LocalStorage Demo loaded! Run fitcoachLocalStorageDemo.help() for commands.');

export {};