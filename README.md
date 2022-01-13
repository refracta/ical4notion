ical4notion
======================
ical4notion is a tool to host http ical using your notion database.

## Install

```
git clone https://github.com/refracta/ical4notion
cd ical4notion
npm install
```

## Run

```
PORT=[PORT] node index.js [NOTION_API_KEY] [CALENDAR_NAME]

Example) 
PORT=8080 node index.js secret_... MY PLAN1
```

```
http://your-ical4notion-domain.com?database_id=YOUR_DATABASE_ID
http://your-ical4notion-domain.com?database_id=YOUR_DATABASE_ID&names=refracta,fresia
// filter by names parameter
http://your-ical4notion-domain.com?database_id=YOUR_DATABASE_ID&emails=refracta@example.com,fresia@example.com
// filter by emails parameter
http://your-ical4notion-domain.com?database_id=YOUR_DATABASE_ID&names=refracta,fresia&emails=refracta@example.com,fresia@example.com
// filter by names, emails parameter
```

You can access ical from the url above.

## Reference

- [NOTION_API_KEY](https://www.notion.so/my-integrations)
- [database_id](https://developers.notion.com/docs/getting-started#step-2-share-a-database-with-your-integration)
