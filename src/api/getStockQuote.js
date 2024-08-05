// const baseUrl = process.env.BASE_URL;
import axios from 'axios';
export async function getStockQuote(securityId, cookie, baseUrl, goalSymbol, retryId = null) {
  // let cookie = getCookieFromResponse(res);

  console.log(goalSymbol, securityId);
  if (baseUrl.startsWith("https://tms44") && retryId) {
    retryId = securityId + 10;
    console.log("https://tms44 stocks with +10", baseUrl, goalSymbol, securityId);

  }
  if (baseUrl.startsWith("https://tms77") && retryId) {
    retryId = securityId + 2;
    console.log("https://tms77 stocks with +2", baseUrl, goalSymbol, securityId);
  }
  if (baseUrl.startsWith("https://tms35") && retryId) {
    retryId = securityId + 1;
    console.log("https://tms35 stocks with +1", baseUrl, goalSymbol, securityId);
  }

  if (baseUrl.startsWith("https://tms25") && retryId) {
    console.log("securities not match so re trying with +3 ", baseUrl, goalSymbol, securityId);

    return await getStockQuote(securityId, cookie, baseUrl, goalSymbol, parseInt(securityId) + 3);
  }
  const userData = cookie.userdata;
  var config = {
    method: 'get',
    url: `${baseUrl}tmsapi/rtApi/ws/stockQuote/` + (retryId === null ? securityId : retryId),
    headers: {
      Connection: 'keep-alive',
      'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
      Accept: 'application/json, text/plain, */*',
      'sec-ch-ua-mobile': '?0',
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
      'Host-Session-Id': 'TWpRPS0zODE4MDA0Ny05YjFiLTQ5ZjktOWJjYy1mNDk1MjZkYzRmNDg=',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
      Referer: `${baseUrl}tms/me/memberclientorderentry`,
      'Accept-Language': 'en-US,en;q=0.9',
      'X-XSRF-TOKEN': cookie.xhrToken,
      'Request-Owner': userData.user.id,
      Cookie: cookie.cookie
    }

  };
  console.log(goalSymbol, securityId);

  const security = await axios(config);

  if (security && security.data && security.data.payload) {

    let apiSymbol = security.data.payload.data[0].security.symbol;
    if (apiSymbol === goalSymbol) {
      return security;
    }

    if (!security || !security.data || security.data.payload === undefined && retryId !== null) {
      console.error("Either security, security.data, or payload is undefined");
      return null;
    }
    if (retryId !== null) {
      console.log("securities not match with retrying ", baseUrl, goalSymbol, securityId, retryId);
    }
  }
  return null;
}
