import { GOOGLE_CONFIG } from "../config.js";

let tokenClient = null;
let accessToken = null;
let signedInEmail = null;

function loadGoogleIdentityServices() {
  if (window.google?.accounts) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = resolve;
    script.onerror = () => {
      reject(new Error("Failed to load Google Identity Services."));
    };

    document.head.appendChild(script);
  });
}

function decodeIdToken(token) {
  const payload = token.split(".")[1];

  if (!payload) {
    throw new Error("Invalid Google ID token.");
  }

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  const bytes = Uint8Array.from(atob(padded), (character) =>
    character.charCodeAt(0),
  );

  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function initializeAuth({
  onSignIn,
  onSheetsAuthorized,
  onSignOut,
  onError,
}) {
  const signInButton = document.querySelector("#google-sign-in");
  const connectSheetsButton = document.querySelector("#connect-sheets-button");
  const signOutButton = document.querySelector("#confirm-sign-out-button");

  if (!signInButton || !connectSheetsButton || !signOutButton) {
    throw new Error("Required authentication elements were not found.");
  }

  if (!GOOGLE_CONFIG.clientId) {
    throw new Error("Google OAuth Client ID is missing.");
  }

  await loadGoogleIdentityServices();

  // Prepare Google Sheets authorization.
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CONFIG.clientId,
    scope: GOOGLE_CONFIG.scopes.join(" "),

    callback: async (response) => {
      if (response.error) {
        onError?.(new Error(response.error));
        return;
      }

      accessToken = response.access_token;

      try {
        await onSheetsAuthorized?.(accessToken);
      } catch (error) {
        onError?.(error);
      }
    },

    error_callback: (error) => {
      if (error.type === "popup_closed") return;

      onError?.(
        new Error(error.message || "Google Sheets authorization failed."),
      );
    },
  });

  // Google Sign-In.
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CONFIG.clientId,

    callback: (response) => {
      try {
        const user = decodeIdToken(response.credential);

        signedInEmail = user.email;

        onSignIn?.({
          id: user.sub,
          name: user.name,
          email: user.email,
          picture: user.picture,
        });
      } catch (error) {
        onError?.(error);
      }
    },

    auto_select: false,
  });

  window.google.accounts.id.renderButton(signInButton, {
    theme: "outline",
    size: "large",
    text: "signin_with",
    shape: "rectangular",
    logo_alignment: "left",
    width: 260,
  });

  // Request Sheets access only after a direct user click.
  // The hint asks Google to use the same account the user signed in with.
  connectSheetsButton.addEventListener("click", () => {
    tokenClient.requestAccessToken({ hint: signedInEmail ?? undefined });
  });

  signOutButton.addEventListener("click", () => {
    // Invalidate the token on Google's side so it cannot be reused.
    if (accessToken) {
      window.google.accounts.oauth2.revoke(accessToken);
    }

    accessToken = null;
    signedInEmail = null;

    window.google.accounts.id.disableAutoSelect();

    onSignOut?.();
  });
}
