require("dotenv").config();

const { App } = require("@slack/bolt");
const axios = require("axios");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

const WHITELIST = (process.env.GST_WHITELIST || "").split(",").map(s => s.trim()).filter(Boolean);

app.command("/gst-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text:
`Available Commands:
/gst-help - This command of course
/gst-ping - Checks bot status and latency
/gst-fact - Useless unfunny facts
/gst-echo - Echoes your message (whitelisted)`
  });
});

app.command("/gst-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Ping successful!\nLatency: ${latency}ms` });
});

app.command("/gst-fact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://uselessfacts.jsph.pl/api/v2/facts/random");
    await respond({ text: `Since you asked...\n${response.data.text}\nThank ${response.data.source} for this unfunny fact.`, response_type: "in_channel" });
  } catch (err) {
    await respond({ text: "Larp failed. Try again later." });
  }
});

app.command("/gst-echo", async ({ command, ack, respond }) => {
  await ack();
  console.log("caller:", command.user_id);

  if (!WHITELIST.includes(command.user_id)) {
    await respond({ text: "You're not whitelisted for this command." });
    return;
  }

  const text = command.text?.trim();
  if (!text) {
    await respond({ text: "Usage: /gst-echo <message>" });
    return;
  }

  await respond({ text, response_type: "in_channel" });
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();
