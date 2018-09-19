const io = require('socket.io-client');
const fs = require('fs');

const socket = io(`wss://e1-push.aws.kambicdn.com`, {
            transports: ['websocket'],
            upgrade: false,
            autoConnect: false,
            path: "/socket.io"
})

socket.on("connect", (socket) => {
    console.log("Socket connected");
})

socket.on("disconnect", (reason) => {
    console.log("Socket disconnected: " + reason);
})

socket.on('reconnect', (attemptNumber) => {
    console.log("Socket reconnected");
});

socket.on('error', (error) => {
    console.log("Socket error: " + error);
});

socket.on('reconnect_attempt', (attemptNumber) => {
    console.log("Socket reconnect attempt " + attemptNumber);
});

const appendToFile = (msg) => {
    fs.appendFile('v2018.leo.ev.id.json.txt', `${msg}\n`, function (err) {
        if (err) throw err;
    });
}

socket.on("message", data => {
    const msgs = JSON.parse(data)
    msgs.forEach((msg) => {

        if (msg.mt === 28) {
            const { eventId, occurrenceTypeId, value } = msg.ls || {};
            const str = `LiveStatistics(${msg.mt}): eventId = ${eventId}. occurrenceTypeId = ${occurrenceTypeId}. value = ${value}`;
            console.log(str);
            appendToFile(str);
        }
        if (msg.mt === 17) {
            const { eventId, statistics } = msg.stats || {};
            const str = `EventStatsUpdated(${msg.mt}): eventId = ${eventId}. Stats = ${JSON.stringify(statistics)}`
            console.log(str);
            appendToFile(str);
        }

        if (msg.mt === 16) {
            const { eventId, score } = msg.score || {};
            const str = `EventScoreUpdated(${msg.mt}): eventId = ${eventId}. Score = ${JSON.stringify(score)}`;
            console.log(str);
            appendToFile(str);
        }
        if (msg.mt === 25) {
            const { eventId, score } = msg.score || {};
            const str = `MatchOccurence(${msg.mt}): msg = ${JSON.stringify(msg)}`;
            console.log(str);
            appendToFile(str);
        }
    });
});


socket.open()

// const LEO_EVENTS = 'v2018.leo.ev.json';
// console.log(`Subscribing to main event: ${LEO_EVENTS}`);
// socket.emit('subscribe', { topic: LEO_EVENTS });

const EVENT = process.argv[2] || '1004531567';
const LEO_EVENT = `leo.ev.${EVENT}.json`;
console.log(`Subscribing to event: ${LEO_EVENT}`);
socket.emit('subscribe', { topic: LEO_EVENT });