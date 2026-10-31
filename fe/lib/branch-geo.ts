import type { Branch } from "@/lib/types";

/** Fallback coords HCMC khi branch chưa có lat/lng */
const FALLBACK: Record<string, { lat: number; lng: number }> = {
  br_spa_1: { lat: 10.7769, lng: 106.7009 },
  br_spa_2: { lat: 10.8021, lng: 106.7351 },
  br_nail_1: { lat: 10.782, lng: 106.689 },
  br_nail_2: { lat: 10.729, lng: 106.721 },
  br_sal_1: { lat: 10.7825, lng: 106.695 },
  br_sal_2: { lat: 10.794, lng: 106.721 },
};

export function branchLatLng(branch: Branch): { lat: number; lng: number } {
  if (typeof branch.lat === "number" && typeof branch.lng === "number") {
    return { lat: branch.lat, lng: branch.lng };
  }
  return FALLBACK[branch.id] ?? { lat: 10.7769, lng: 106.7009 };
}
