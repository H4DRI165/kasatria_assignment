import { initializeAuth } from "./auth/auth.js";
import { fetchSheetData } from "./sheets/sheets.js";
import { initializeVisualization } from "./visualization/visualization.js";

import "../css/style.css";
import "../css/login.css";
import "../css/visualization.css";

const loginScreen = document.querySelector("#login-screen");
const visualizationScreen = document.querySelector("#visualization-screen");
const visualizationContainer = document.querySelector("#visualization");
const connectSheetsButton = document.querySelector("#connect-sheets-button");
const sheetsStatus = document.querySelector("#sheets-status");

let visualizationInstance = null;

initializeAuth({
  onSignIn: (user) => {
    console.log("Signed in as:", user.email);

    loginScreen.classList.add("hidden");
    visualizationScreen.classList.remove("hidden");
  },

  onSheetsAuthorized: async (token) => {
    console.log("Google Sheets access granted.");

    try {
      const records = await fetchSheetData(token);

      console.log(`Successfully loaded ${records.length} records.`);

      // Clean up any existing visualization before creating a new one
      if (visualizationInstance) {
        visualizationInstance.destroy();
        visualizationInstance = null;
      }

      // Initialize Three.js visualization using Google Sheets data
      visualizationInstance = initializeVisualization(
        visualizationContainer,
        records,
      );

      connectSheetsButton.hidden = true;
      sheetsStatus.classList.remove("hidden");

      console.log("Periodic Table visualization initialized.");
    } catch (error) {
      console.error("Failed to load visualization data:", error);

      connectSheetsButton.hidden = false;
      sheetsStatus.classList.add("hidden");

      alert(`Unable to load Google Sheets data: ${error.message}`);
    }
  },

  onSignOut: () => {
    console.log("User signed out.");

    // Clean up Three.js resources and animation
    if (visualizationInstance) {
      visualizationInstance.destroy();
      visualizationInstance = null;
    }

    visualizationScreen.classList.add("hidden");
    connectSheetsButton.hidden = false;
    sheetsStatus.classList.add("hidden");
    loginScreen.classList.remove("hidden");
  },

  onError: (error) => {
    console.error("Google authentication error:", error);

    alert(
      "Google authentication or Sheets authorization failed. Please try again.",
    );
  },
}).catch((error) => {
  console.error("Failed to initialize Google authentication:", error);
});

console.log("Kasatria application initialized.");
