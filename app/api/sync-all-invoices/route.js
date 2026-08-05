import { NextResponse } from "next/server";
import { appendInvoiceRow, ensureHeaderRow } from "@/lib/googleSheets";

export async function POST(request) {
  try {
    const { invoices } = await request.json();
    if (!Array.isArray(invoices)) {
      return NextResponse.json({ ok: false, error: "invoices massiv bo'lishi kerak." }, { status: 400 });
    }

    await ensureHeaderRow();

    let success = 0;
    let failed = 0;
    for (const inv of invoices) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await appendInvoiceRow(inv);
        success += 1;
      } catch {
        failed += 1;
      }
    }

    return NextResponse.json({ ok: true, success, failed, total: invoices.length });
  } catch (err) {
    console.error("Google Sheets bulk sync error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Noma'lum xatolik" }, { status: 500 });
  }
}
