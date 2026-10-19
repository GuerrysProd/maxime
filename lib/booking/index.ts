import "server-only";

/**
 * Prise de rendez-vous : adaptateurs interchangeables (brief §5 BookingPicker).
 * - demo : créneaux d’exemple (aucun outil branché) ;
 * - calcom : créneaux libres de l’API Cal.com v2, si CALCOM_API_KEY et CALCOM_EVENT_TYPE_ID sont définis.
 * La réservation elle-même se fait sur la page de l’outil (NEXT_PUBLIC_BOOKING_URL), date pré-choisie.
 */
export interface BookingSlot {
  /** Début du créneau, ISO 8601. */
  start: string;
}

export interface BookingProvider {
  id: "demo" | "calcom";
  getSlots(from: Date, days: number): Promise<BookingSlot[]>;
}

export const TIME_ZONE = "Europe/Paris";
const DEMO_TIMES = ["09:30", "11:00", "14:00", "16:30"];

/** Décalage de Paris (en minutes) à une date donnée. */
function parisOffsetMinutes(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "longOffset" }).formatToParts(date);
  const offset = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT+01:00";
  const match = offset.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) return 60;
  return (match[1] === "-" ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3]));
}

export const demoProvider: BookingProvider = {
  id: "demo",
  async getSlots(from, days) {
    const slots: BookingSlot[] = [];
    for (let i = 0; i < days; i += 1) {
      const day = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + i));
      const weekday = day.getUTCDay();
      if (weekday === 0 || weekday === 6) continue;
      for (const time of DEMO_TIMES) {
        const [h, m] = time.split(":").map(Number);
        const utc = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h, m));
        utc.setUTCMinutes(utc.getUTCMinutes() - parisOffsetMinutes(utc));
        if (utc.getTime() > Date.now()) slots.push({ start: utc.toISOString() });
      }
    }
    return slots;
  },
};

export function calcomProvider(apiKey: string, eventTypeId: string): BookingProvider {
  return {
    id: "calcom",
    async getSlots(from, days) {
      const end = new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
      const url = new URL("https://api.cal.com/v2/slots");
      url.searchParams.set("eventTypeId", eventTypeId);
      url.searchParams.set("start", from.toISOString());
      url.searchParams.set("end", end.toISOString());
      url.searchParams.set("timeZone", TIME_ZONE);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}`, "cal-api-version": "2024-09-04" },
      });
      if (!response.ok) throw new Error(`Cal.com ${response.status}`);
      // Réponse : { data: { "2026-10-20": [{ start: "…" }, …], … } }
      const body = (await response.json()) as { data?: Record<string, { start: string }[]> };
      return Object.values(body.data ?? {})
        .flat()
        .map((slot) => ({ start: slot.start }));
    },
  };
}

export function getBookingProvider(): BookingProvider {
  const key = process.env.CALCOM_API_KEY;
  const eventType = process.env.CALCOM_EVENT_TYPE_ID;
  return key && eventType ? calcomProvider(key, eventType) : demoProvider;
}
