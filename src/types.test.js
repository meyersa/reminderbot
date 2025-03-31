import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { Anniversary, Notification } from "./types";

describe('Anniversary', () => {
    test('should create an Anniversary with correct values', () => {
        const date = new Date();
        const anniversary = new Anniversary(date, 'Wedding', 'Our wedding day', 12345, [1, 2], [100, 101]);

        expect(anniversary.date).toBe(date);
        expect(anniversary.name).toBe('Wedding');
        expect(anniversary.description).toBe('Our wedding day');
        expect(anniversary.exact).toBe(true);
        expect(anniversary.notification).toBe(true);
        expect(anniversary.peopleToNotify).toEqual([1, 2]);
        expect(anniversary.channelId).toBe(12345);
        expect(anniversary.notificationsOwned).toEqual([100, 101]);
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