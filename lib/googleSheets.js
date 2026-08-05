// SERVER-ONLY yordamchi. Bu faylni hech qachon client komponentda import qilmang —
// u xizmat hisobi (service account) maxfiy kalitini o'z ichiga oladi.
import { google } from "googleapis";

function getAuth() {
  const email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!email || !privateKey) {
    throw new Error("Google Sheets muhit o'zgaruvchilari sozlanmagan (GOOGLE_SHEETS_CLIENT_EMAIL / GOOGLE_SHEETS_PRIVATE_KEY).");
  }

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function appendInvoiceRow(invoice) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID muhit o'zgaruvchisi sozlanmagan.");
  }

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const row = [
    invoice.id,
    invoice.operatorName || "",
    invoice.clientName || "",
    invoice.phone || "",
    invoice.tariff || "",
    invoice.amount || 0,
    invoice.date || "",
    invoice.status || "",
    invoice.receipt || "",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Invoices!A:I",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

export async function ensureHeaderRow() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const header = ["ID", "Sotuvchi", "Mijoz", "Telefon", "Tarif", "Summa", "Sana", "Status", "Chek"];
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Invoices!A1:I1",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [header] },
  });
}
