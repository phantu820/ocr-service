import express from "express";
import mainFun from "./ocr.js";
import multer from "multer";
import { Expo } from "expo-server-sdk";
const upload = multer({ dest: "uploads/" });
const app = express();
const expo = new Expo();

app.use(express.json());

app.get("/ocr", (req, res) => {
  res.send("Hello, OCR Server!");
});

app.post("/ocr", upload.array("images"), async (req, res) => {
  // console.log('Uploading images', req.files);
  try {
    const images = req.files;
    const data = await Promise.all(
      images.map(async (e) => await mainFun(e.path))
    );
    console.log(data);
    res.json(data.reduce((c, a) => c + a, ""));
  } catch (error) {
    res.json("error", error);
  }
});

app.post("/send-notification", async (req, res) => {
  const { to, title, body, data } = req.body;
  console.log("token", to);

  let messages = [];
  for (let pushToken of to) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: "default",
      title,
      body,
      data,
    });
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  try {
    for (let chunk of chunks) {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }
    console.log("ok");
    res.status(200).send(tickets);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(2002, () => {
  console.log("Server is running on port 2002");
});
