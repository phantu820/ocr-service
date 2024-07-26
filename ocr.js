import { createWorker } from "tesseract.js";
import sharp from "sharp";

// Hàm xử lý ảnh
const preprocessImage = async (img) => {
  try {
    const processedImageBuffer = await sharp(img)
      .resize(1000, 1000, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .greyscale()
      .normalize()
      .toBuffer();

    return processedImageBuffer;
  } catch (error) {
    console.error("Image Processing Error: ", error);
    throw new Error("Không thể xử lý ảnh.");
  }
};

const scanText = async (img) => {
  const worker = await createWorker("vie");

  try {
    const preprocessedImage = await preprocessImage(img);
    const ret = await worker.recognize(preprocessedImage);
    await worker.terminate();
    return ret.data.text;
  } catch (error) {
    console.error("OCR Error: ", error);
    await worker.terminate();
    return "Không thể nhận dạng văn bản từ hình ảnh này.";
  }
};

const mainFun = async (img) => {
  return await scanText(img);
};

export default mainFun;
