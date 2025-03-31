export async function cleanBotMessages(channel, events) {
    console.log("Cleaning bot messages...") 
    
    const messages = await channel.messages.fetch({ limit: 100 });

    // Get list of message IDs to keep
    const allowedIds = [
        ...events.map(e => e.messageId),
        // ...notifications.map(n => n.messageId)
    ];

    // Filter and delete bot messages not in allowedIds
    messages.forEach(message => {
        if (message.author.bot && !allowedIds.includes(message.id)) {
            message.delete().catch(console.error);
        }
    });
}
