import { fetchSingleOrder } from "../../api/fetchOrder";
import { editOrder } from "../../api/editOrder";
import { getStockQuote } from "../../api/getStockQuote";
import { lowHigh } from "../../util/price";

import { securities } from "../../data/security";
import { quantDb } from "../../api/data";

export async function buyHigherPrice(ordeerId, goal, res,tmsId) {
  try {
    const baseUrl = res.url;
    const cookie = getCookieFromResponse(res);
    let sid = null;
    if (goal.sid === null || goal.sid === "") {
      const securityBySymbol = securities.find((s) => s.symbol === goal.symbol);
      if (securityBySymbol && securityBySymbol.sid) {
        sid = securityBySymbol.sid;
      }
    } else {
      sid = goal.sid;
    }

    if (sid) {
      const stockQuote = await getStockQuote(sid, cookie, baseUrl, goal.symbol);
      if (!stockQuote) {
        return null;
      }

      if (stockQuote && stockQuote.data && stockQuote.data.payload) {

        // if (goal.sid === null || goal.sid === "") {
        //   res.goals.map(g => {
        //     if (g.symbol === goal.symbol) {
        //       g.sid = stockQuote.data.payload.data[0].security.id;
        //     }
        //     return g;
        //   });
        //   await quantDb.push(`/${tmsId}`, res);
        //   await quantDb.reload();
        // }
        let ltp = stockQuote.data.payload.data[0].ltp;
        let lh = lowHigh(ltp);
        // if (ltp != goal.tmsorders[0].orderPrice) {
        const singleO = await fetchSingleOrder(ordeerId, cookie, baseUrl);

        // console.log("payload", stockQuote.data.payload.data[0].ltp);
        // console.log(
        //   "changePercentage",
        //   stockQuote.data.payload.data[0].changePercentage
        // );
        if (singleO.data === undefined) {
        } else if (
          singleO &&
          singleO.data &&
          singleO.data.buyOrSell === 1
          // &&
          // (singleO.data.activeStatus !== "COMPLETED" ||
          //   singleO.data.activeStatus !== "CANCELLED" ||
          //   singleO.data.activeStatus !== "REJECTED")
        ) {
          const order = singleO.data;
          // console.log("orderPrice ", goal.tmsorders[0].orderPrice);
          // console.log("high ", lh.high);
          if (goal.tmsorders[0].orderPrice != lh.high) {
            order.orderBookExtensions[0].orderPrice = lh.high;
            order.orderBookExtensions[0].triggerPrice = 0;

            const { client, security, ...rest } = order;
            rest.client = {
              clientMemberCode: client.clientMemberCode,
              displayName: client.displayName,
              id: client.id,
              notsUniqueClientCode: client.notsUniqueClientCode,
            };
            rest.security = {
              boardLotQuantity: security.boardLotQuantity,
              divisor: 100,
              exchangeSecurityId: security.exchangeSecurityId,
              id: security.id,
              marketProtectionPercentage: 0,
              tickSize: 1,
            };
            console.log(cookie, baseUrl);
            const edit = await editOrder(rest, cookie, baseUrl);
            if (edit && edit.data && edit.data.message) {
              goal.tmsorders[0].orderPrice = lh.high;
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
      }
    }
  } catch (err) {
    console.log('error on ' + goal.symbol)
  }
}
