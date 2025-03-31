import { afterAll, beforeAll, expect, test } from "vitest";
import { isValidDate, isValidTitle } from "./helpers";

test("isValidDate", () => {
    // Valid Entries
    expect(isValidDate("10/14/2002")).toBe(true)
    expect(isValidDate("1/1/2010")).toBe(true)
    expect(isValidDate(new Date())).toBe(true)

    // False Entries
    expect(isValidDate("14")).toBe(false)
    expect(isValidDate("Today")).toBe(false)
    expect(isValidDate("October 14th")).toBe(false)
    expect(isValidDate("")).toBe(false)


})

test("isValidTitle", () => {
    // Valid entries
    expect(isValidTitle("Anniversary")).toBe(true)
    expect(isValidTitle("AA")).toBe(true) // 2
    expect(isValidTitle("A".repeat(49))).toBe(true) // 49

    // False Entries
    expect(isValidTitle("Example")).toBe(false)
    expect(isValidTitle("")).toBe(false)
    expect(isValidTitle("A")).toBe(false)
    expect(isValidTitle("A".repeat(50))).toBe(false)

})