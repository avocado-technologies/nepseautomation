import { fetchSingleOrder } from '../../api/fetchOrder';
import { editOrder } from '../../api/editOrder';
import { getStockQuote } from '../../api/getStockQuote';
import { lowHigh, getPriceFromStrategy } from '../../util/price';
import { securities } from '../../data/security';
import { getCookieFromResponse } from '../../util/cookie';

export async function fixedRateSellPrice(ordeerId, goal, res, tmsId) {
  try {
    let sid = null;
    if (goal.sid === null || goal.sid === "") {
      const securityBySymbol = securities.find((s) => s.symbol === goal.symbol);
      if (securityBySymbol && securityBySymbol.sid) {
        sid = securityBySymbol.sid;
      }
    } else {
      sid = goal.sid;
    } const baseUrl = res.url;
    const cookie = getCookieFromResponse(res);
    const stockQuote = await getStockQuote(sid, cookie, baseUrl, goal.symbol);
    if (!stockQuote) {
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
    // }

    let ltp = stockQuote.data.payload.data[0].ltp;
    let lh = lowHigh(ltp);
    const price = getPriceFromStrategy(lh, goal);

    if (goal.tmsorders[0].orderPrice != goal.price) {
      // if (goal.tmsorders[0].orderPrice == price) {
      // 	return;
      // }
      // if (price < goal.tmsorders[0].orderPrice) {
      // 	return;
      // }
      const singleO = await fetchSingleOrder(ordeerId, cookie, baseUrl);
      console.log("i am here",lh.high,singleO.data.orderBookExtensions[0].orderPrice);

      if (
        singleO.data.buyOrSell === 2 &&
        (singleO.data.remainingOrderQuantity !== 0)
      ) {
        const order = singleO.data;
        goal.tmsorders[0].orderPrice = price;
        order.orderBookExtensions[0].orderPrice = price;
        order.orderBookExtensions[0].triggerPrice = 0;
        const { client, security, ...rest } = order;
        rest.client = {
          clientMemberCode: client.clientMemberCode,
          displayName: client.displayName,
          id: client.id,
          notsUniqueClientCode: client.notsUniqueClientCode
        };
        rest.security = {
          boardLotQuantity: security.boardLotQuantity,
          divisor: 100,
          exchangeSecurityId: security.exchangeSecurityId,
          id: security.id,
          marketProtectionPercentage: 0,
          tickSize: 1
        };
        const edit = await editOrder(rest, cookie, baseUrl);
        if (edit && edit.data) {
          console.log(goal.symbol + ' , ' + goal.tmsorders[0].orderPrice + ' , ' + edit.data.message);
        }
        return edit;
      }
    }else{
        console.log("not within price range from fixed rate sell ", goal.symbol, price, lh.high, lh.low)
      
    }
  } catch (err) {
    console.log('error on ' + goal.symbol)

  }
}
