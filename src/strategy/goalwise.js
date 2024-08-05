import { getCon, setCon, save } from "../util/config";
import { runRegularByGoal } from "./runRegularByGoal";
import { buyLowerPrice } from "./pricing/buyLowerPrice";
import { sellHigherPrice } from "./pricing/sellHigherPrice";
import { fixedRateBuyPrice } from "./pricing/fixedRateBuyPrice";
import { fixedRateSellPrice } from "./pricing/fixedRateSellPrice";
import { buyHigherPrice } from "./pricing/buyHigherPrice";
import { fetchOrders } from "../api/fetchOrder";
import { quantDb } from "../api/data";
export async function runByGoals(key, value) {
  const goals = value.goals;

  for (const goal of goals) {

    if (goal.tmsorders && goal.tmsorders.length > 0) {
      const order = goal.tmsorders[0];
      console.log(goal.type, "heree", goal.symbol,order.orderPlacedBy);

      if(order.activeStatus==='COMPLETED'){
        console.log("order completed",goal.symbol,order.orderPlacedBy)
        continue;
      }
      switch (goal.strategy) {
        case "HIGH":
          if (goal.type === "sell") {
            await sellHigherPrice(order.id, goal, value,key);
          }
          if (goal.type === "buy") {
            await buyHigherPrice(order.id, goal, value,key);
          }
          break;
        case "LOW":
          if (goal.type === "buy") {
            await buyLowerPrice(order.id, goal, value,key);
          }
          break;
        case "FIXED":
          if (goal.type === "buy") {
            await fixedRateBuyPrice(order.id, goal, value,key);
          }
          if (goal.type === "sell") {
            await fixedRateSellPrice(order.id, goal, value,key);
          }

          break;
      }
    } 
    // else {
    //   await runRegularByGoal(goal,value);
    // }
  }
}
