import { loginWithCaptcha, saveError } from "./api/login";
// import "./util/config";
import "./interceptor/axiosinterceptor";
import {
  runEditOrder,
  runFetchOrder,
  runPreOpenCron,
  runRegularOpenCron,
} from "./cron/cron";
import {
  callTmsDetailsApi,
  callTmsDetailsApiPeriodically,
  quantDb,
} from "./api/data";
import cron from "node-cron";

(async () => {
  const intervalMap = {};

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const fs = require("fs");
  const path = require("path");

  const rootDirectory = __dirname + "/../"; // Get the root directory of your project

  const filePathRelativeToRoot = "quant.json"; // Specify the path to the file you want to delete relative to the root directory
  const filePathRelativeToRootOld = `quant-${new Date()
    .toISOString()
    .replace(/:/g, "_")
    .replace(/\..+/, "")}.json`;

  const filePath = path.join(rootDirectory, filePathRelativeToRoot);
  const filePathOld = path.join(rootDirectory, filePathRelativeToRootOld);
  try {
    // Use fs.unlinkSync to delete the file synchronously
    fs.rename(filePath, filePathOld, (err) => {
      if (err) {
        console.error("Error renaming file:", err);
      } else {
        console.log("File renamed successfully");
      }
    });
  } catch (err) {
    console.error("Error deleting file:", err);
  }
  await delay(5000);
  await start();
  await delay(5000);
  setInterval(start, 1000 * 60 * 15);
  await operate();

  setInterval(operate, 10000);

  async function start() {
    const response = await callTmsDetailsApi();
    Object.keys(intervalMap).forEach((key) => {
      clearInterval(intervalMap[key]);
    });

    await Promise.all(
      response.map(async (data) => {
        let retryCount = 0;
        let captchaResponse = await loginWithCaptcha(data);
        if (captchaResponse === false) {
          while (!captchaResponse && retryCount <= 10) {
            console.log("retry login", data.name);
            captchaResponse = await loginWithCaptcha(data);
            retryCount++;
            await delay(5000);
          }

          if (retryCount >= 10) {
            await saveError("too much try. still no login", data);
          }
        }
        if (captchaResponse === true) {
          console.log("login success", data.name);
        }
      })
    );
    console.log("starting operation completed.");
  }
  async function operate() {
    await callTmsDetailsApiPeriodically();
    await quantDb.reload();
    const data = await quantDb.getData("/");
    Object.entries(data).forEach(async ([key, value]) => {
      if (value.cookie.length && value.errors.length === 0) {
        console.log("operate on tms ", value.userdata.user.displayName);
        // Check if an interval already exists for this key
        if (intervalMap[key]) {
          // If it exists, clear the previous interval
          clearInterval(intervalMap[key]);
        }
        await runFetchOrder(key, value);

        await runRegularOpenCron(key,value);

        intervalMap[key] = setInterval(async () => {
          await runFetchOrder(key, value);

          await runEditOrder(key, value);
        }, 5000);
      }
    });
  }
})();
