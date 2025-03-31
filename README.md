# reminderBot

Takes in input dates and posts an embed with the the next large upcoming anniversary, such as: 

- Year
- Month
- Week
- Day

Also includes information such as the total time since then, as well as the total number of days/minutes/etc.

Depending on how far the event is, the embed will reflect the color from green/yellow/red. 

In the future, this could send a notification but that was not implemented yet 

[![Build and Push Docker Image](https://github.com/meyersa/reminderbot/actions/workflows/docker-image.yml/badge.svg)](https://github.com/meyersa/reminderbot/actions/workflows/docker-image.yml)

## Running
Image is built and pushed to ghcr.io, it can be pulled as: `ghcr.io/meyersa/reminderbot:latest`

There is an included docker-compose for reference. Below are the ENV format as well as the events.

## ENV Format 
- `EVENTS_FILE`: File to parse, default `events.json`
- `CLIENT_TOKEN`: Token of client to connect to
- `CHANNEL_ID`: Channel to post in 
- `INTERVAL`: Optional interval to refresh in seconds, default 60 
- `TZ`: Optional to set Timezone, like "America/Detroit"

## Events format 
Events should be stored in a events.json file in the root directory with the following structure 

```JSON
[
    {
        "date": "mm/dd/yyyy",
        "title": "Example"
    },
]
```