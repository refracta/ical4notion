const express = require('express');
const app = express();
const http = require('http');
const port = parseInt(process.env.PORT) || 8080;
const httpServer = http.createServer(app);

const ical = require('ical-generator');
const {Client} = require('@notionhq/client');
let name = process.argv.slice(3).join(' ');
name = name !== '' ? name : 'ical4notion';

const notion = new Client({
    auth: process.argv[2]
});

function toDate(str, isEnd) {
    let date = new Date(str);
    if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
        date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
        if (isEnd) {
            setLastTimeOfDay(date);
        }
    }
    return date;
}

function setLastTimeOfDay(date) {
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
}

async function getCalender(database_id) {
    const pages = (await notion.databases.query({
        database_id
    })).results.filter(page => Object.values(page.properties).find(prop => prop.type === 'date' && prop?.date?.start));

    let cal = ical({name});
    for (let page of pages) {
        let prop = Object.values(page.properties);
        let title = prop.find(prop => prop.type === 'title').title.find(iProp => iProp?.plain_text)?.plain_text;
        let {start, end} = prop.find(prop => prop.type === 'date')?.date;

        end = end ? end : start;
        let allDay = start === end ? true : false;
        start = toDate(start);
        end = toDate(end, true);

        cal.createEvent({
            allDay,
            start,
            end,
            timestamp: start,
            summary: title
        });
    }

    return cal;
}

app.get('/', async function (req, res, next) {
    let database_id = req?.query?.database_id;
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`REQUEST: ip=${ip}, database_id=${database_id}`);
    if (database_id) {
        (await getCalender(database_id)).serve(res);
    } else {
        res.header('Content-Type', 'text/plain');
        res.send(JSON.stringify({status: 'failed', reason: 'database_id is empty.'}));
    }
});

httpServer.listen(port, function () {
    console.log('Listening on port *:' + port);
});
