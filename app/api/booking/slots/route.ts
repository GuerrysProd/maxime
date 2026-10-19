import { NextResponse, type NextRequest } from "next/server";
import { demoProvider, getBookingProvider } from "@/lib/booking";

/** Créneaux libres pour la carte « Prendre rendez-vous » : ?start=AAAA-MM-JJ&days=5 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const start = /^\d{4}-\d{2}-\d{2}$/.test(params.get("start") ?? "") ? new Date(`${params.get("start")}T00:00:00Z`) : new Date();
  const days = Math.min(14, Math.max(1, Number(params.get("days")) || 5));
  const provider = getBookingProvider();
  try {
    const slots = await provider.getSlots(start, days);
    return NextResponse.json({ provider: provider.id, slots });
  } catch (error) {
    console.error("[booking] Créneaux indisponibles", error);
    return NextResponse.json({ provider: "demo", slots: await demoProvider.getSlots(start, days) });
  }
}
