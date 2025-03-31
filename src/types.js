export class Event {
    /**
     * @param {Date} date
     * @param {string} name
     * @param {string} description
     * @param {number} channelId
     * @param {number[]} peopleToNotify
     * @param {boolean} [notification=true]
     */
    constructor(date, name, description, channelId = process.env.CHANNEL_ID, peopleToNotify = [], notification = true) {
        this.date = date;
        this.name = name;
        this.description = description;
        this.notification = notification;
        this.peopleToNotify = peopleToNotify;
        this.channelId = channelId;
        this.notificationsOwned = [];
    }
}

export class Notification {
    /**
     * @param {string} name
     * @param {number} notificationChannelId
     * @param {number[]} usersToNotify
     * @param {boolean} [defer=false]
     * @param {number} [id=Date.now()]
     */
    constructor(name, notificationChannelId, usersToNotify = [], defer = false, id = Date.now()) {
        this.id = id;
        this.name = name;
        this.defer = defer;
        this.notificationChannelId = notificationChannelId;
        this.usersToNotify = usersToNotify;
    }

    snooze() {
        this.nextNotifyTime = Date.now() + 24 * 60 * 60 * 1000; // +1 day
        this.defer = true;
    }
}
