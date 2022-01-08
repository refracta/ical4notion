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
PORT=[PORT] node index.js [NOTION_KEY] [ICAL_NAME]

Example) 
PORT=8080 node index.js secret_... MY PLAN1
```

```
http://your-ical4notion-domain.com?database_id=YOUR_DATABASE_ID
```

You can access ical from the url above.

## Reference

- [NOTION_KEY](https://www.notion.so/my-integrations)
- [database_id](https://developers.notion.com/docs/getting-started#step-2-share-a-database-with-your-integration)
