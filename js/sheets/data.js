function parseNetWorth(value, rowNumber) {
  const cleanedValue = String(value ?? "").replace(/[$,\s]/g, "");

  const netWorth = Number(cleanedValue);

  if (!cleanedValue || !Number.isFinite(netWorth)) {
    throw new Error(
      `Invalid Net Worth value at spreadsheet row ${rowNumber}: ${value}`,
    );
  }

  return netWorth;
}

function parseAge(value, rowNumber) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const age = Number(value);

  if (!Number.isInteger(age) || age < 0) {
    throw new Error(
      `Invalid Age value at spreadsheet row ${rowNumber}: ${value}`,
    );
  }

  return age;
}

export function parseSheetData(values) {
  if (!Array.isArray(values) || values.length < 2) {
    throw new Error("Google Sheet does not contain any data records.");
  }

  // Normalize headers to avoid issues with extra spaces.
  const headers = values[0].map((header) =>
    String(header).trim().toLowerCase(),
  );

  const requiredHeaders = [
    "name",
    "photo",
    "age",
    "country",
    "interest",
    "net worth",
  ];

  const columnIndexes = {};

  for (const header of requiredHeaders) {
    const index = headers.indexOf(header);

    if (index === -1) {
      throw new Error(`Missing required spreadsheet column: ${header}`);
    }

    columnIndexes[header] = index;
  }

  const records = values.slice(1).map((row, index) => {
    const rowNumber = index + 2;

    const name = String(row[columnIndexes.name] ?? "").trim();

    if (!name) {
      throw new Error(`Missing Name value at spreadsheet row ${rowNumber}.`);
    }

    return {
      name,
      photo: String(row[columnIndexes.photo] ?? "").trim(),
      age: parseAge(row[columnIndexes.age], rowNumber),
      country: String(row[columnIndexes.country] ?? "").trim(),
      interest: String(row[columnIndexes.interest] ?? "").trim(),
      netWorth: parseNetWorth(row[columnIndexes["net worth"]], rowNumber),
    };
  });

  return records;
}
