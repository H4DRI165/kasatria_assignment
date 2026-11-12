import { initializeAuth } from "./auth/auth.js";
import { fetchSheetData } from "./sheets/sheets.js";
import { initializeVisualization } from "./visualization/visualization.js";

import "../css/style.css";
import "../css/login.css";
import "../css/visualization.css";

const loginScreen = document.querySelector("#login-screen");
const visualizationScreen = document.querySelector("#visualization-screen");
const visualizationContainer = document.querySelector("#visualization");
const sheetsStatus = document.querySelector("#sheets-status");
const sheetsStatusText = document.querySelector("#sheets-status-text");
const layoutButtons = document.querySelectorAll(".layout-button");
const emptyState = document.querySelector("#empty-state");
const layoutControls = document.querySelector("#layout-controls");
const signOutButton = document.querySelector("#sign-out-button");
const signOutDialog = document.querySelector("#sign-out-dialog");

let visualizationInstance = null;

function setActiveLayoutButton(layoutName) {
  layoutButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.layout === layoutName);
  });
}

// Show layout controls only when data is loaded; otherwise show the empty state.
function setVisualizationReady(isReady) {
  emptyState.classList.toggle("hidden", isReady);
  layoutControls.classList.toggle("hidden", !isReady);

  sheetsStatus.classList.toggle("connected", isReady);
  sheetsStatusText.textContent = isReady
    ? "Google Sheets connected"
    : "Google Sheets not connected";

  if (isReady) {
    setActiveLayoutButton("table");
  }
}

layoutButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!visualizationInstance) return;

    const layoutName = button.dataset.layout;

    visualizationInstance.setLayout(layoutName);
    setActiveLayoutButton(layoutName);
  });
});

signOutButton.addEventListener("click", () => {
  signOutDialog.showModal();
});

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

      setVisualizationReady(true);

      console.log("Periodic Table visualization initialized.");
    } catch (error) {
      console.error("Failed to load visualization data:", error);

      setVisualizationReady(false);

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

    setVisualizationReady(false);
    visualizationScreen.classList.add("hidden");
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
