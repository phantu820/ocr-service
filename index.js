import express from "express";
import mainFun from "./ocr.js";
import multer from "multer";
import { Expo } from "expo-server-sdk";
import fs from "fs";
import path from "path";

const upload = multer({ dest: "uploads/" });
const app = express();
const expo = new Expo();

app.use(express.json());

app.get("/ocr", (req, res) => {
  res.send("Hello, OCR Server!");
});

app.post("/ocr", upload.array("images"), async (req, res) => {
  try {
    const images = req.files;
    const data = await Promise.all(
      images.map(async (file) => {
        const result = await mainFun(file.path);
        // Xoá tệp sau khi xử lý
        // fs.unlinkSync(file.path);
        return result;
      })
    );
    // Trả về kết quả dưới dạng văn bản
    res.json(data.reduce((acc, text) => acc + text, ""));
  } catch (error) {
    console.error("Error processing images:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing images." });
  }
});

app.post("/send-notification", async (req, res) => {
  const { to, title, body, data } = req.body;
  console.log("token", to);

  if (!Array.isArray(to) || !title || !body) {
    return res.status(400).json({ error: "Invalid request payload" });
  }

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
    console.log("Notifications sent successfully");
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error sending notifications:", error);
    res
      .status(500)
      .json({ error: "An error occurred while sending notifications." });
  }
});

app.listen(2002, () => {
  console.log("Server is running on port 2002");
});
