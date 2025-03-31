import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { getUpcoming, getExact, getStats, daysUntil, getLargestUpcoming } from "./dates";

describe("daysUntil", () => {
  test("1 Day Away", () => {
    const date = new Date("2024-04-08T00:00:00Z");
    const now = new Date("2024-04-07T00:00:00Z");

    expect(daysUntil(date, now)).toEqual(1);
  });
  test("1 Week Away", () => {
    const date = new Date("2024-04-14T00:00:00Z");
    const now = new Date("2024-04-07T00:00:00Z");

    expect(daysUntil(date, now)).toEqual(7);
  });
  test("1 Month Away", () => {
    const date = new Date("2024-05-08T00:00:00Z");
    const now = new Date("2024-04-08T00:00:00Z");

    expect(daysUntil(date, now)).toEqual(30);
  });
});

describe("getUpcoming", () => {
  test("Exactly 1 week away", () => {
    const date = new Date("2024-03-31T00:00:00Z");
    const now = new Date("2024-04-07T00:00:00Z");
    expect(getUpcoming(date, now)).toEqual({
      weeks: { value: 2, in: 7 },
      months: { value: 1, in: 24 },
      years: { value: 1, in: 358 },
    });
  });

  test("Mid-month event (45 days later)", () => {
    const date = new Date("2024-03-31T00:00:00Z");
    const now = new Date("2024-05-15T00:00:00Z");
    expect(getUpcoming(date, now)).toEqual({
      weeks: { value: 7, in: 4 },
      months: { value: 2, in: 16 },
      years: { value: 1, in: 320 },
    });
  });

  test("Crossing year boundary", () => {
    const date = new Date("2024-12-31T00:00:00Z");
    const now = new Date("2025-01-15T00:00:00Z");
    expect(getUpcoming(date, now)).toEqual({
      weeks: { value: 3, in: 6 },
      months: { value: 1, in: 16 },
      years: { value: 1, in: 350 },
    });
  });

  test("Same day event", () => {
    const date = new Date("2024-03-31T00:00:00Z");
    const now = new Date("2024-03-31T00:00:00Z");
    expect(getUpcoming(date, now)).toEqual({
      weeks: { value: 1, in: 7 },
      months: { value: 1, in: 31 },
      years: { value: 1, in: 365 },
    });
  });

  test("Far future event (~520 days)", () => {
    const date = new Date("2024-03-31T00:00:00Z");
    const now = new Date("2025-09-01T00:00:00Z");
    expect(getUpcoming(date, now)).toEqual({
      weeks: { value: 75, in: 6 },
      months: { value: 18, in: 30 },
      years: { value: 2, in: 211 },
    });
  });
});

describe("largestUpcoming", () => {
  test("Less than a week", () => {
    const date = new Date("2024-01-02T00:00:00Z");
    const now = new Date("2024-01-03T00:00:00Z");

    expect(getLargestUpcoming(date, now)).toEqual({
      type: "Weeks",
      value: 1,
      in: 6,
    });
  });
  test("Less than a month", () => {
    const date = new Date("2024-01-02T00:00:00Z");
    const now = new Date("2024-01-22T00:00:00Z");

    expect(getLargestUpcoming(date, now)).toEqual({
      type: "Months",
      value: 1,
      in: 11,
    });
  });
  test("More than a month", () => {
    const date = new Date("2024-01-02T00:00:00Z");
    const now = new Date("2024-03-22T00:00:00Z");

    expect(getLargestUpcoming(date, now)).toEqual({
      type: "Years",
      value: 1,
      in: 286,
    });
  });
});

describe("getExact", () => {
  test("Exactly 1 month difference (Jan 2 -> Feb 2)", () => {
    const date = new Date("2024-01-02T00:00:00Z");
    const now = new Date("2024-02-02T00:00:00Z");
    expect(getExact(date, now)).toEqual({
      years: 0,
      months: 1,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  test("Exactly 1 year difference", () => {
    const date = new Date("2023-03-31T12:00:00Z");
    const now = new Date("2024-03-31T12:00:00Z");
    expect(getExact(date, now)).toEqual({
      years: 1,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  test("30 days is not always 1 month (March 1 -> March 31)", () => {
    const date = new Date("2024-03-01T00:00:00Z");
    const now = new Date("2024-03-31T00:00:00Z");
    expect(getExact(date, now)).toEqual({
      years: 0,
      months: 0,
      days: 30,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  test("Crossing year boundary (Dec 31 -> Jan 1)", () => {
    const date = new Date("2023-12-31T23:00:00Z");
    const now = new Date("2024-01-01T01:00:00Z");
    expect(getExact(date, now)).toEqual({
      years: 0,
      months: 0,
      days: 0,
      hours: 2,
      minutes: 0,
      seconds: 0,
    });
  });

  test("Now equals date", () => {
    const date = new Date("2024-03-31T00:00:00Z");
    const now = new Date("2024-03-31T00:00:00Z");
    expect(getExact(date, now)).toEqual({
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});

describe("getStats", () => {
  test("Exactly 1 month difference (Jan 2 -> Feb 2)", () => {
    const date = new Date("2024-01-02T00:00:00Z");
    const now = new Date("2024-02-02T00:00:00Z");
    expect(getStats(date, now)).toEqual({
      years: 0,
      months: 1,
      days: 31,
      hours: 744, // 31 * 24
      minutes: 44640, // 744 * 60
      seconds: 2678400, // 44640 * 60
    });
  });

  test("Exactly 1 year difference", () => {
    const date = new Date("2023-03-31T00:00:00Z");
    const now = new Date("2024-03-31T00:00:00Z");
    expect(getStats(date, now)).toEqual({
      years: 1,
      months: 12,
      days: 366, // Leap year (2024 is a leap year)
      hours: 8784,
      minutes: 527040,
      seconds: 31622400,
    });
  });

  test("30 days is not always 1 month (March 1 -> March 31)", () => {
    const date = new Date("2024-03-01T00:00:00Z");
    const now = new Date("2024-03-31T00:00:00Z");
    expect(getStats(date, now)).toEqual({
      years: 0,
      months: 0,
      days: 30,
      hours: 720,
      minutes: 43200,
      seconds: 2592000,
    });
  });

  test("Crossing year boundary (Dec 31 -> Jan 1)", () => {
    const date = new Date("2023-12-31T00:00:00Z");
    const now = new Date("2024-01-01T00:00:00Z");
    expect(getStats(date, now)).toEqual({
      years: 0,
      months: 0,
      days: 1,
      hours: 24,
      minutes: 1440,
      seconds: 86400,
    });
  });

  test("Now equals date", () => {
    const date = new Date("2024-03-31T00:00:00Z");
    const now = new Date("2024-03-31T00:00:00Z");
    expect(getStats(date, now)).toEqual({
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});
