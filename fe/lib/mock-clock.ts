/** Reference “now” thống nhất cho seed / selectors (mock). */
export const MOCK_DATA_VERSION = "beauty-crm-mock-v3";

export function mockNow(): Date {
  return new Date();
}

export function daysFromNow(deltaDays: number, hour = 10, minute = 0): string {
  const d = mockNow();
  d.setDate(d.getDate() + deltaDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function startOfDay(ms = mockNow().getTime()): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
