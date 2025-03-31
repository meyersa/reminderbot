export class Event {
    /**
     * @param {Date} date
     * @param {string} name
     * @param {string} description
     * @param {number} channelId
     * @param {number[]} peopleToNotify
     * @param {boolean} [exact=true]
     * @param {boolean} [notification=true]
     */
    constructor(date, name, description, channelId = process.env.CHANNEL_ID, peopleToNotify = [], exact = false, notification = true) {
        this.date = date;
        this.name = name;
        this.description = description;
        this.exact = exact;
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
}
