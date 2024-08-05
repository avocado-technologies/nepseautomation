import cron from "node-cron";
import { preOpenPlaceOrder } from "../api/preOpenBuyStock";
import { preOpenSellOrder } from "../api/preOpenSellStock";
import { runRegularByGoal } from "../strategy/runRegularByGoal";
import { runByGoals } from "../strategy/goalwise";
import { fetchOrders } from "../api/fetchOrder";
import { getCon, setCon, save } from "../util/config";
import { quantDb } from "../api/data";
export async function runPreOpenCron(tmsdetails) {
  // cron.schedule("29 10 * * *", async () => {
  // setTimeout(async () => {
  await runPreOpen(tmsdetails);
  // }, 56000);
  // });
}

export async function runRegularOpenCron(tmsId,tmsdetails) {
  // cron.schedule("0 11 * * *", async () => {
  const isCompleted = await runRegularOpen(tmsId,tmsdetails);
  // });
}

export async function runEditOrder(key,value) {
  // cron.schedule("59 10 * * *", async () => {
  // setInterval(() => {
    runByGoals(key,value);
  // }, 5000);

  // });
}

async function runPreOpen(tmsdetails) {
  console.log(tmsdetails);
  const goals = tmsdetails.goals;
  for (const goal of goals) {
    if (goal.tmsorders.length === 0) {
      if (goal.preOpen && goal.type === "buy") {
        const preBuyResponse = await preOpenPlaceOrder(goal,tmsdetails);
        if (preBuyResponse && preBuyResponse.data) {
          goal.tmsorders.push(preBuyResponse.data);
        }
      } else if (goal.preOpen && goal.type === "sell") {
        const preSellResponse = await preOpenSellOrder(goal,tmsdetails);
        if (preSellResponse && preSellResponse.data) {
          goal.tmsorders.push(preSellResponse.data);
        }
      }
    }
  }
  // const countPre = goals.filter((g) => g.ordertype === "PRE");
  // const countCompleted = goals.filter(
  //   (g) => g.ordertype === "PRE" && g.tmsorders.length > 0
  // );
  // setCon("goals", goals);
  // save();
  // return countPre === countCompleted;
}

async function runRegularOpen(tmsId,tmsdetails) {
  const goals = tmsdetails.goals;

  if (goals) {
    await Promise.all(goals.map(async (goal) => runRegularByGoal(goal,tmsdetails,tmsId)));


    const countRegular = goals.filter((g) => g.ordertype === "CONT");
    const countCompleted = goals.filter(
      (g) => g.ordertype === "CONT" && g.tmsorders.length > 0
    );

    return countRegular === countCompleted;
  }
}


export async function runFetchOrder(id,data) {
  const goals = data.goals;
  const orderFetches = await fetchOrders(data);
  if (orderFetches && orderFetches.data && orderFetches.data.length > 0) {
    for (const order of orderFetches.data) {
      if (order.buyOrSell === 1) {
        const goalie = goals.find(
          (g) =>
            g.symbol === order.symbol &&
            order.orderQuantity === g.quantity &&
            g.type === "buy"
        );
        if (goalie) {
          const isFind = goalie.tmsorders.find(d=>d.id==order.id);
          
          if(!isFind){
            goalie.tmsorders.push(order);
          }
        }
      } else {
        const goalie = goals.find(
          (g) =>
            g.symbol === order.symbol &&
            order.orderQuantity === g.quantity &&
            g.type === "sell"
        );
        if (goalie) {
          const isFind = goalie.tmsorders.find(d=>d.id==order.id);

          if(!isFind){
            goalie.tmsorders.push(order);
          }
        }
      }
    }
  }
  await quantDb.push(`/${id}`, data);
}
