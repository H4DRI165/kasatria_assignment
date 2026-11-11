export const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  spreadsheetId: import.meta.env.VITE_GOOGLE_SHEET_ID,
  sheetName: "kasatria_assignment",
  sheetRange: "A:F",
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
};
