import { securities } from "../data/security";
import axios from "axios";
import { getCookieFromResponse } from "../util/cookie";
import { fivelowHigh, getPriceFromStrategy, lowHigh } from "../util/price";
import { getStockQuote } from "../api/getStockQuote";
import { quantDb } from "./data";

export async function preOpenPlaceOrder(goal, res) {
  const baseUrl = res.url;

  
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
    const cookie = getCookieFromResponse(res);
    const userData = cookie.userdata;
    let security = await getStockQuote(sid, cookie, baseUrl, goal.symbol);
    if (!security) {
      return null;
    }

    if(goal.sid === null || goal.sid===""){
      res.goals.map(g=>{
        if(g.symbol===goal.symbol){
          g.sid = security.data.payload.data[0].security.id;
        }
        return g;
      });
      await quantDb.push(`/${tmsId}`, res);
      // await quantDb.reload();
    }

    let ltp = security.data.payload.data[0].ltp;
    let lh = lowHigh(ltp);
    let price = getPriceFromStrategy(lh, goal);
    let securityId = security.data.payload.data[0].security.id;
    var data = JSON.stringify({
      orderBook: {
        orderBookExtensions: [
          {
            orderTypes: {
              id: 1,
              orderTypeCode: "LMT",
            },
            disclosedQuantity: 0,
            orderValidity: {
              id: 1,
              orderValidityCode: "DAY",
            },
            triggerPrice: 0,
            orderPrice: price,
            orderQuantity: goal.quantity,
            remainingOrderQuantity: goal.quantity,
            marketType: {
              id: 1,
              marketType: "Pre Open",
            },
          },
        ],
        exchange: {
          id: 1,
        },
        dnaConnection: {},
        dealer: {},
        member: {},
        productType: {
          id: 1,
          productCode: "CNC",
        },
        instrumentType: {
          id: 1,
          code: "EQ",
        },
        client: userData.clientDealerMember.client,
        security: {
          id: securityId,
          exchangeSecurityId: securityId,
          marketProtectionPercentage: 0,
          divisor: 100,
          boardLotQuantity: 1,
          tickSize: 1,
        },
        accountType: 1,
        cpMemberId: 0,
        buyOrSell: 1,
      },
      orderPlacedBy: 2,
      exchangeOrderId: null,
    });

    var config = {
      method: "post",
      url: `${baseUrl}tmsapi/orderApi/order/`,
      headers: {
        Connection: "keep-alive",
        "sec-ch-ua":
          '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Host-Session-Id":
          "TWpRPS0zODE4MDA0Ny05YjFiLTQ5ZjktOWJjYy1mNDk1MjZkYzRmNDg=",
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        "sec-ch-ua-mobile": "?0",
        Origin: `${baseUrl}`,
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        Referer: `${baseUrl}tms/me/memberclientorderentry?symbol=${goal.symbol}&transaction=Buy`,
        "Accept-Language": "en-US,en;q=0.9",
        "X-XSRF-TOKEN": cookie.xhrToken,
        "Request-Owner": userData.user.id,
        Cookie: cookie.cookie,
      },
      data: data,
    };

    return axios(config);
  } else {
    console.log("NO SYMBOL FOUND WITH ID");
  }
}
