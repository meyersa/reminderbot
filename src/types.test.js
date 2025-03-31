import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { Event, Notification } from "./types";

describe('Event', () => {
    test('should create an Event with correct values', () => {
        const date = new Date();
        const event = new Event(date, 'Wedding', 'Our wedding day', 12345, [1, 2]);

        expect(event.date).toBe(date);
        expect(event.name).toBe('Wedding');
        expect(event.description).toBe('Our wedding day');
        expect(event.exact).toBe(true);
        expect(event.notification).toBe(true);
        expect(event.peopleToNotify).toEqual([1, 2]);
        expect(event.channelId).toBe(12345);
    });
});

describe('Notification', () => {
    test('should create a Notification with correct values', () => {
        const now = Date.now();
        const notification = new Notification('Reminder', 67890, [3, 4], false, now);

        expect(notification.id).toBe(now);
        expect(notification.name).toBe('Reminder');
        expect(notification.defer).toBe(false);
        expect(notification.notificationChannelId).toBe(67890);
        expect(notification.usersToNotify).toEqual([3, 4]);
    });
});