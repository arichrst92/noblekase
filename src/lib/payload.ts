/**
 * payload.ts — cached Payload local API client untuk server components.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 */

import { getPayload, type Payload } from "payload";
import config from "@payload-config";

let cached: Promise<Payload> | null = null;

export function getPayloadClient(): Promise<Payload> {
  if (!cached) cached = getPayload({ config });
  return cached;
}
