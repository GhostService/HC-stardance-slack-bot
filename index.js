require("dotenv").config();

const { App } = require("@slack/bolt");
const axios = require("axios");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/gst-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Ping successful!\nLatency: ${latency}ms` });
});

app.command("/gst-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text:
`Available Commands:
/gst-help - This command of course
/gst-ping - Checks bot status and latency
/gst-fact - Useless unfunny facts`
  });
});

app.command("/gst-fact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://uselessfacts.jsph.pl/api/v2/facts/random");
    await respond({ text: `Since you asked...\n${response.data.text}\nThank ${response.data.source} for this unfunny fact.` });
  } catch (err) {
    await respond({ text: "Larp failed. Try again later." });
  }
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();
