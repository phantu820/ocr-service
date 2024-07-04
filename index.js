import express from 'express';
import Tesseract from 'tesseract.js';
import { Readable } from 'stream';
import mainFun from './ocr.js';
import  multer from 'multer'
const upload = multer({ dest: 'uploads/' })
const app = express();

app.use(express.json());


app.get('/ocr', (req, res) => {
  res.send('Hello, OCR Server!');
})

app.post('/ocr',upload.array('images'),  async (req, res) => {
  // console.log('Uploading images', req.files);
  try {
    const images = req.files
  const data = await Promise.all(images.map(async (e) =>await mainFun(e.path)))
    console.log(data);
    res.json(data.reduce((c,a) => c + a,""));
  } catch (error) {
    res.json("error", error);
  }
});

app.listen(2002, () => {
  console.log('Server is running on port 2002');
});
