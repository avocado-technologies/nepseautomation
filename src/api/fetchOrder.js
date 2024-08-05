import axios from "axios";
import { getCookieFromResponse } from "../util/cookie";
export async function fetchOrders(tmsdetails) {
  const baseUrl = tmsdetails.url;
    const cookie =  getCookieFromResponse(tmsdetails);
    const userData = cookie.userdata;
    var config = {
      method: "get",
      url: `${baseUrl}tmsapi/orderTradeApi/orderbook-v2/client/${userData.clientDealerMember.client.id}?&activeStatus=OPEN&activeStatus=PARTIALLY_TRADED&activeStatus=MODIFIED&activeStatus=PENDING&activeStatus=COMPLETED`,
      headers: {
        Connection: "keep-alive",
        "sec-ch-ua":
          '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
        Accept: "application/json, text/plain, */*",
        "sec-ch-ua-mobile": "?0",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Host-Session-Id":
          "TWpRPS1mMTFlMmJmNi1hNDdkLTRiNzEtYjE5Mi1kYWE5NzczNjA2MmY=",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        Referer: `${baseUrl}tms/me/memberclientorderentry`,
        "Accept-Language": "en-US,en;q=0.9",
        "X-XSRF-TOKEN": cookie.xhrToken,
        "Request-Owner": userData.user.id,
        Cookie: cookie.cookie,  
      },
      baseUrl
    };
  
    return axios(config);
}

export async function fetchSingleOrder(orderId,cookie,baseUrl) {
  const userData = cookie.userdata;
  var config = {
    method: "get",
    url: `${baseUrl}tmsapi/orderApi/orderbook-v2/V3/${orderId}`,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.5",
      "Host-Session-Id":
        "TWpRPS0xYTA4OTExZS0zODliLTRiMjgtOWE2Ny1iOWMzODhiOTk3YTg=",
      Connection: "keep-alive",
      Referer: `${baseUrl}tms/me/memberclientorderentry?id=611223&mode=Modify`,
      "X-XSRF-TOKEN": cookie.xhrToken,
      "Request-Owner": userData.user.id,
      Cookie: cookie.cookie,
    },
  };
  return axios(config);
}
