import { afterAll, beforeAll, expect, test } from "vitest";
import { isValidDate } from "./main";

test("isValidDate", () => {
    // Valid Entries
    expect(isValidDate("10/14/2002")).toBe(true)
    expect(isValidDate("1/1/2010")).toBe(true)
    expect(isValidDate(new Date())).toBe(true)

    // False entries
    expect(isValidDate("14")).toBe(false)
    expect(isValidDate("Today")).toBe(false)
    expect(isValidDate("October 14th")).toBe(false)
    expect(isValidDate("")).toBe(false)


})
