import { fetchSingleOrder } from "../../api/fetchOrder";
import { editOrder } from "../../api/editOrder";
import { getStockQuote } from "../../api/getStockQuote";
import { lowHigh } from "../../util/price";

import { securities } from "../../data/security";
import { quantDb } from "../../api/data";
import { getCookieFromResponse } from "../../util/cookie";

export async function sellHigherPrice(orderId, goal, res,tmsId) {
  try {
    let sid = null;
    if (goal.sid === null || goal.sid === "") {
      const securityBySymbol = securities.find((s) => s.symbol === goal.symbol);
      if (securityBySymbol && securityBySymbol.sid) {
        sid = securityBySymbol.sid;
      }
    } else {
      sid = goal.sid;
    }
    const baseUrl = res.url;
    const cookie = getCookieFromResponse(res);

    const stockQuote = await getStockQuote(sid, cookie, baseUrl, goal.symbol);

    if (stockQuote==null) {
      return null;
    }
   

    // if (goal.sid === null || goal.sid === "") {
    //   res.goals.map(g => {
    //     if (g.symbol === goal.symbol) {
    //       g.sid = stockQuote.data.payload.data[0].security.id;
    //     }
    //     return g;
    //   });
    //   await quantDb.push(`/${tmsId}`, res);
    //   // await quantDb.reload();
    // }

    let ltp = stockQuote.data.payload.data[0].ltp;
    let lh = lowHigh(ltp);
    const singleO = await fetchSingleOrder(orderId, cookie, baseUrl);
    console.log("i am here",lh.high,singleO.data.orderBookExtensions[0].orderPrice);

    if (lh.high > singleO.data.orderBookExtensions[0].orderPrice) {


      if (
        singleO.data.buyOrSell === 2 &&
        (singleO.data.remainingOrderQuantity !== 0)
      ) {
        const order = singleO.data;

        order.orderBookExtensions[0].orderPrice = lh.high;
        order.orderBookExtensions[0].triggerPrice = 0;
        goal.tmsorders[0].orderPrice = lh.high;
        const { client, security, ...rest } = order;
        rest.client = {
          clientMemberCode: client.clientMemberCode,
          displayName: client.displayName,
          id: client.id,
          notsUniqueClientCode: client.notsUniqueClientCode,
        };
        rest.security = {
          boardLotQuantity: goal.boardLotQuantity,
          divisor: 100,
          exchangeSecurityId: security.exchangeSecurityId,
          id: security.id,
          marketProtectionPercentage: 0,
          tickSize: 1,
        };
        const edit = await editOrder(rest, cookie, baseUrl);
        if (edit && edit.data) {
          console.log(
            goal.symbol +
            " , " +
            goal.tmsorders[0].orderPrice +
            " , " +
            edit.data.message
          );
        }
        return edit;
      }
    }
  } catch (err) {
    // console.log(err.response)
  }
}
