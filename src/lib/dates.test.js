import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { getUpcoming, getExact, getStats } from "./dates";

describe("getExact", () => {
    test("Exactly 1 month difference (Jan 2 -> Feb 2)", () => {
        const date = new Date("2024-01-02T00:00:00Z");
        const now = new Date("2024-02-02T00:00:00Z");
        expect(getExact(date, now)).toEqual({ years: 0, months: 1, days: 0, hours: 0, minutes: 0, seconds: 0 });
    });

    test("Exactly 1 year difference", () => {
        const date = new Date("2023-03-31T12:00:00Z");
        const now = new Date("2024-03-31T12:00:00Z");
        expect(getExact(date, now)).toEqual({ years: 1, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
    });

    test("30 days is not always 1 month (March 1 -> March 31)", () => {
        const date = new Date("2024-03-01T00:00:00Z");
        const now = new Date("2024-03-31T00:00:00Z");
        expect(getExact(date, now)).toEqual({ years: 0, months: 0, days: 30, hours: 0, minutes: 0, seconds: 0 });
    });

    test("Crossing year boundary (Dec 31 -> Jan 1)", () => {
        const date = new Date("2023-12-31T23:00:00Z");
        const now = new Date("2024-01-01T01:00:00Z");
        expect(getExact(date, now)).toEqual({ years: 0, months: 0, days: 0, hours: 2, minutes: 0, seconds: 0 });
    });

    test("Now equals date", () => {
        const date = new Date("2024-03-31T00:00:00Z");
        const now = new Date("2024-03-31T00:00:00Z");
        expect(getExact(date, now)).toEqual({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
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
            hours: 744,         // 31 * 24
            minutes: 44640,     // 744 * 60
            seconds: 2678400    // 44640 * 60
        });
    });

    test("Exactly 1 year difference", () => {
        const date = new Date("2023-03-31T00:00:00Z");
        const now = new Date("2024-03-31T00:00:00Z");
        expect(getStats(date, now)).toEqual({
            years: 1,
            months: 0,
            days: 366,          // Leap year (2024 is a leap year)
            hours: 8784,
            minutes: 527040,
            seconds: 31622400
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
            seconds: 2592000
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
            seconds: 86400
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
            seconds: 0
        });
    });

});