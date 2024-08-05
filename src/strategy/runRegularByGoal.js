import { regularBuyOrder } from "../api/regularBuyOrder";
import { regularSellOrder } from "../api/regularSellOrder";
export async function runRegularByGoal(goal,data,tmsId) {
  if (goal.tmsorders.length === 0) {
    if (goal.ordertype === "CONT" && goal.type === "buy") {

      const buyResponse = await regularBuyOrder(goal,data,tmsId);

      if (buyResponse  && buyResponse.data) {
        console.log(buyResponse.data.message);
      }
    } else if (goal.ordertype === "CONT" && goal.type === "sell") {

      const sellResponse = await regularSellOrder(goal,data,tmsId);
      if (sellResponse && sellResponse.data) {
        console.log(
          
            sellResponse.data.message
        );
      }
    }
  }
  // const orderFetches = await fetchOrders();
  //     if (orderFetches && orderFetches.data && orderFetches.data.length > 0) {
  //       if (goal.type === "buy") {
  //         const orderGoalie = orderFetches.data.find(
  //           (order) =>
  //             goal.symbol === order.symbol &&
  //             order.orderQuantity === goal.quantity &&
  //             goal.type === "buy"
  //         );
  //         if (orderGoalie) {
  //           goal.tmsorders  = [orderGoalie];
  //         }
  //       } else {
  //         const orderGoalie = orderFetches.data.find(
  //           (order) =>
  //             goal.symbol === order.symbol &&
  //             order.orderQuantity === goal.quantity &&
  //             goal.type === "sell"
  //         );
  //         if (orderGoalie) {
  //           goal.tmsorders  = [orderGoalie];
  //         }
  //       }
  //     }
}
