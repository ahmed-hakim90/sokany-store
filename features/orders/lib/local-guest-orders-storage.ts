import { z } from "zod";

export const GUEST_ORDERS_STORAGE_KEY = "sokany_guest_order_refs_v1";
const MAX_REFS = 50;

const entrySchema = z.object({
  id: z.number().int().positive(),
  orderKey: z.string().min(1),
  savedAt: z.number(),
});

const listSchema = z.array(entrySchema);

export type GuestOrderRef = z.infer<typeof entrySchema>;

function readRaw(): GuestOrderRef[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    const r = listSchema.safeParse(parsed);
    return r.success ? r.data : [];
  } catch {
    return [];
  }
}

function writeAll(entries: GuestOrderRef[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_ORDERS_STORAGE_KEY, JSON.stringify(entries));
}

/** Append or refresh a guest order reference (newest first, capped). */
export function addGuestOrderRef(ref: Omit<GuestOrderRef, "savedAt"> & { savedAt?: number }) {
  const savedAt = ref.savedAt ?? Date.now();
  const next: GuestOrderRef = { id: ref.id, orderKey: ref.orderKey, savedAt };
  const prev = readRaw().filter((e) => e.id !== next.id);
  const merged = [next, ...prev].slice(0, MAX_REFS);
  writeAll(merged);
}

export function listGuestOrderRefs(): GuestOrderRef[] {
  return readRaw();
}

export function removeGuestOrderRef(orderId: number) {
  writeAll(readRaw().filter((e) => e.id !== orderId));
}
