import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { getEmbedColor, isValidDate, isValidTitle } from "./helpers";

describe("isValidDate", () => {
  test("Valid Entries", () => {
    expect(isValidDate("10/14/2002")).toBe(true);
    expect(isValidDate("1/1/2010")).toBe(true);
    expect(isValidDate(new Date())).toBe(true);
  });

  test("Invalid Entries", () => {
    expect(isValidDate("14")).toBe(false);
    expect(isValidDate("Today")).toBe(false);
    expect(isValidDate("October 14th")).toBe(false);
    expect(isValidDate("")).toBe(false);
  });
});

describe("isValidTitle", () => {
  test("Valid Entries", () => {
    // Valid entries
    expect(isValidTitle("Anniversary")).toBe(true);
    expect(isValidTitle("AA")).toBe(true); // 2
    expect(isValidTitle("A".repeat(49))).toBe(true); // 49
  });
  test("Invalid Entries", () => {
    expect(isValidTitle("Example")).toBe(false);
    expect(isValidTitle("")).toBe(false);
    expect(isValidTitle("A")).toBe(false);
    expect(isValidTitle("A".repeat(50))).toBe(false);
  });
});

describe("getEmbedColor", () => {
  test("Red for less than 5 days", () => {
    expect(getEmbedColor(0)).toEqual(0xff0000);
    expect(getEmbedColor(4)).toEqual(0xff0000);
  });

  test("Yellow for 5 - 10 days", () => {
    expect(getEmbedColor(5)).toEqual(0xffff00);
    expect(getEmbedColor(7)).toEqual(0xffff00);
    expect(getEmbedColor(10)).toEqual(0xffff00);
  });

  test("Green for more than 10 days", () => {
    expect(getEmbedColor(11)).toEqual(0x00ff00);
    expect(getEmbedColor(30)).toEqual(0x00ff00);
    expect(getEmbedColor(100)).toEqual(0x00ff00);
  });

  test("Invalid Entries", () => {
    expect(getEmbedColor("A")).toEqual(NaN);
    expect(getEmbedColor()).toEqual(NaN);
    expect(getEmbedColor(-11)).toEqual(NaN);
  });
});
