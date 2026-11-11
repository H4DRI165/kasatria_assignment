import { GOOGLE_CONFIG } from "../config.js";
import { parseSheetData } from "./data.js";

export async function fetchSheetData(accessToken) {
  if (!accessToken) {
    throw new Error("Google Sheets access token is missing.");
  }

  if (!GOOGLE_CONFIG.spreadsheetId) {
    throw new Error("Google Spreadsheet ID is missing.");
  }

  const range = `'${GOOGLE_CONFIG.sheetName}'!${GOOGLE_CONFIG.sheetRange}`;

  const encodedRange = encodeURIComponent(range).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/` +
    `${GOOGLE_CONFIG.spreadsheetId}/values/${encodedRange}`;

  console.log("Google Sheets range:", range);
  console.log("Encoded range:", encodedRange);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const message =
      result.error?.message || "Failed to retrieve Google Sheets data.";

    throw new Error(`Google Sheets API error (${response.status}): ${message}`);
  }

  if (!result.values) {
    throw new Error("Google Sheets API returned no values.");
  }

  return parseSheetData(result.values);
}
