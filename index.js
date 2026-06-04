require("dotenv").config();

const { App } = require("@slack/bolt");
const axios = require("axios");

// does something, not sure what but claude told me to put it here
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

// import all whitelisted user ids
const WHITELIST = (process.env.GST_WHITELIST || "").split(",").map(s => s.trim()).filter(Boolean);

app.command("/gst-help", async ({ ack, respond }) => {
  await ack();
  console.log("caller:", command.user_id);
  await respond({
    text:
`Available Commands:
/gst-help - This command of course
/gst-ping - Checks bot status and latency
/gst-fact - Useless unfunny facts
/gst-echo - Echoes your message (whitelisted)
/gst-whitelist - Lists all whitelisted users and their slack IDs.`
  });
});

app.command("/gst-ping", async ({ command, ack, respond }) => {
  // subtract difference between after and before ack
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  console.log("caller:", command.user_id);
  await respond({ text: `Ping successful!\nLatency: ${latency}ms` });
});

app.command("/gst-fact", async ({ ack, respond }) => {
  await ack();
  // log caller id so its easier to check logs
  console.log("caller: ", command.user_id);
  try {
    const response = await axios.get("https://uselessfacts.jsph.pl/api/v2/facts/random");
    await respond({ text: `Since you asked...\n${response.data.text}\nThank ${response.data.source} for this unfunny fact.`, response_type: "in_channel" });
  } catch (err) {
    console.log("GET failed, probably ratelimited.");
    await respond({ text: "Larp failed. Try again later." });
  }
});

app.command("/gst-echo", async ({ command, ack, respond }) => {
  await ack();
  // log caller id so its easier to check logs
  console.log("whitelisted caller:", command.user_id);

  if (!WHITELIST.includes(command.user_id)) {
    await respond({ text: "You're not whitelisted for this command." });
    return;
  }

  const text = command.text?.trim();
  if (!text) {
    await respond({ text: "You didnt tell me what to do you fricking idiot.\nUsage: /gst-echo <message>" });
    return;
  }

  await respond({ text, response_type: "in_channel" });
});

app.command("/gst-whitelist", async ({ command, ack, respond, client }) => {
  await ack();

  if (!WHITELIST.includes(command.user_id)) {
    console.log("caller:", command.user_id);
    await respond({ text: "You're not whitelisted for this command." });
    return;
  }

  const lines = await Promise.all(WHITELIST.map(async (id) => {
    try {
      const info = await client.users.info({ user: id });
      const name = info.user?.profile?.display_name || info.user?.real_name || info.user?.name || "unknown";
      return `• ${name} (${id})`;
    } catch (err) {
      return `• unknown (${id})`;
    }
  }));

  console.log("whitelisted caller:", command.user_id);
  await respond({ text: `Whitelisted users:\n${lines.join("\n")}` });
});


// starts the actual runtime
(async () => {
  await app.start();
  console.log("bot is running! current time is: idk i havent implemented the feat yet");
})();
