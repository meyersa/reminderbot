import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { parseEvents, toEventType } from "./parsing";

describe("parseEvents", () => {
    test("Test Parsing", () => {
        const parsedEvent = parseEvents()

        expect(parsedEvent.length).toEqual(1)
        expect(parsedEvent[0].date).toEqual("1/1/2000")
        expect(parsedEvent[0].name).toEqual("Start of the Decade")
        expect(parsedEvent[0].description).toEqual("An important date")
        expect(parsedEvent[0].channelId).toEqual(1356274332346613901)
        expect(parsedEvent[0].peopleToNotify).toEqual([276478672217571328])
    })
})

describe("toEventType", () => {
    test("Test Conversion", () => {
        const parsedEvent = toEventType(parseEvents())

        expect(parsedEvent.length).toEqual(1)
        expect((new Date(parsedEvent[0].date)).getTime()).toEqual(946702800000)
        expect(parsedEvent[0].name).toEqual("Start of the Decade")
        expect(parsedEvent[0].description).toEqual("An important date")
        expect(parsedEvent[0].channelId).toEqual(1356274332346613901)
        expect(parsedEvent[0].peopleToNotify).toEqual([276478672217571328])
    })
})