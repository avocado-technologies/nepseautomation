import { loginWithCaptcha } from "./api/login";
import "./util/config";
import "./interceptor/axiosinterceptor";
import cron from "node-cron";
import NodeCache from "node-cache";
import {
  runPreOpenCron,
  runRegularOpenCron,
  runEditOrder,
  runFetchOrder,
} from "./cron/cron";
import { callTmsDetailsApi, quantDb } from "./api/data";
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  //initial login
  // await loginWithCaptcha();
  //cron for preopen
  // await runPreOpenCron();
  //cron for regular
  const response = await callTmsDetailsApi();
  for (const trader of response) {
    if (trader.tms_url) {
      while (true) {
        const isValid = await loginWithCaptcha(trader);
        if (isValid) {
          break;
        }
      }
      await delay(5000);
      await runFetchOrder(trader.id, trader.tms_url);
      // await runRegularOpenCron(trader.id);
      // setInterval(async () => {
      //   await runFetchOrder(trader.id);
      //   await runEditOrder(trader.id);
      // }, 5000);
    }
    // await Promise.all([

    //   // runEditOrder(response.id)
    // ]);
  }
  // await runRegularOpenCron();
  // edit record
  // cron.schedule("59 10 * * *", async () => {
  //   await loginWithCaptcha();
  //   // await runPreOpenCron();
  //   setTimeout(async () => {
  //     // await runRegularOpenCron();
  //     await runEditOrder();
  //   }, 57000);
  // });
})();
