const express = require('express');
const app = express();
const http = require('http');
const port = parseInt(process.env.PORT) || 8080;
const httpServer = http.createServer(app);

const ical = require('ical-generator');
const {Client} = require('@notionhq/client');
let icalName = process.argv.slice(3).join(' ');
icalName = icalName !== '' ? icalName : 'ical4notion';

const notion = new Client({
    auth: process.argv[2]
});

function isIncludeTime(str){
	return str.match(/^\d{4}-\d{2}-\d{2}$/) ? false : true;
}

function toTimezoneFixedDate(date){
	return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
}

function toLastTimeOfDay(date) {
    date = new Date(date.getTime());
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    return date;
}

async function getCalendar(database_id, names, emails) {
    const pages = (await notion.databases.query({
        database_id
    })).results.filter(page => {
        let properties = Object.values(page.properties);
        let isHaveDate = properties.some(prop => prop.type === 'date' && prop?.date?.start);
        let isNameMatchedPage = names?.length > 0 ? properties.some(prop => prop.type === 'people' && prop.people.find(person => names.includes(person?.name))) : false;
        let isEmailMatchedPage = emails?.length > 0 ? properties.some(prop => prop.type === 'people' && prop.people.find(person => emails.includes(person?.person?.email))) : false;
        return isHaveDate && ((names || emails) ? (isNameMatchedPage || isEmailMatchedPage) : true);
    });

    let cal = ical({name: icalName});
    for (let page of pages) {
        let prop = Object.values(page.properties);
        let title = prop.find(prop => prop.type === 'title').title.find(iProp => iProp?.plain_text)?.plain_text
        let participants = Array.from(new Set(prop.filter(prop => prop.type === 'people').map(prop => prop.people.map(person => person.name)).flat())).join(', ');
        let {start, end} = prop.find(prop => prop.type === 'date')?.date;
		let allDay = false;

		let isTimeFormat = isIncludeTime(start);

		if(start && !end) {
			if(isTimeFormat) {
				start = new Date(start);
				end = toLastTimeOfDay(start);
			} else {
				start = toLastTimeOfDay(toTimezoneFixedDate(new Date(start)));
				allDay = true;
			}
		} else if (start && end) {
			if(isTimeFormat) {
				start = new Date(start);
				end = new Date(end);
			} else {
				start = toTimezoneFixedDate(new Date(start));
				end = toLastTimeOfDay(toTimezoneFixedDate(new Date(end)));
			}
		}

        cal.createEvent({
            allDay,
            start,
            end,
            timestamp: start,
            summary: title,
            description: participants
        });
    }

    return cal;
}

app.get('/', async function (req, res, next) {
    let database_id = req?.query?.database_id;
    let names = req?.query?.names?.split(',');
    let emails = req?.query?.emails?.split(',');

    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`REQUEST: ip=${ip}, database_id=${database_id}, names=${names}, emails=${emails}`);
    if (database_id) {
        try {
            (await getCalendar(database_id, names, emails)).serve(res);
        } catch (e) {
            console.error(e);
            res.header('Content-Type', 'text/plain');
            res.send(JSON.stringify({status: 'failed', reason: 'Failed to create calendar.'}));
        }
    } else {
        res.header('Content-Type', 'text/plain');
        res.send(JSON.stringify({status: 'failed', reason: 'database_id is empty.'}));
    }
});

httpServer.listen(port, function () {
    console.log('Listening on port *:' + port);
});
