// const baseUrl = process.env.BASE_URL;
import axios from 'axios';
import { getCookieFromResponse } from '../util/cookie';

var nconf = require('nconf');
export async function refresh(baseUrl) {
  console.log(baseUrl);
    const cookie = await getCookieFromResponse(baseUrl);
    const userData = cookie.userdata;
    var config = {
      method: 'post',
      url: `${baseUrl}tmsapi/authApi/authenticate/refresh`,
      headers: {
        Connection: 'keep-alive',
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
        'Host-Session-Id': 'TWpRPS0zODE4MDA0Ny05YjFiLTQ5ZjktOWJjYy1mNDk1MjZkYzRmNDg=',
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
        'sec-ch-ua-mobile': '?0',
        Origin: `${baseUrl}`,
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        Referer: `${baseUrl}tms/me/memberclientorderentry`,
        'Accept-Language': 'en-US,en;q=0.9',
        'X-XSRF-TOKEN': cookie.xhrToken,
        'Request-Owner': userData.user.id,
        Cookie: cookie.cookie
      },
      baseUrl
    };
    return  axios(config);

}
