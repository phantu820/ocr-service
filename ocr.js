import { createWorker } from "tesseract.js";
const scanText = async (img) => {
  const worker = await createWorker("vie");
  const ret = await worker.recognize(img);
  await worker.terminate();
  return ret.data.text;
};
const mainFun = async (img) => {
  return await scanText(img);
};
export default mainFun;
