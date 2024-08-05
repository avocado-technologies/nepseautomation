// const baseUrl = process.env.BASE_URL;
import axios from 'axios';
export async function editOrder(order,cookie,baseUrl) {
	try{
    const userData = cookie.userdata;
    var data = JSON.stringify({
      orderBook: {
        ...order,
        exchange: {
          id: 1
        }
      },
      orderPlacedBy: 2,
      exchangeOrderId: null
    });
  
    var config = {
      method: 'put',
      url: `${baseUrl}tmsapi/orderApi/order/`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Host-Session-Id': 'TWpRPS0xYTA4OTExZS0zODliLTRiMjgtOWE2Ny1iOWMzODhiOTk3YTg=',
        'Content-Type': 'application/json',
        Origin: `${baseUrl}`,
        Connection: 'keep-alive',
        Referer: `${baseUrl}tms/me/memberclientorderentry?id=611223&mode=Modify`,
        'X-XSRF-TOKEN': cookie.xhrToken,
        'Request-Owner': userData.user.id,
        Cookie: cookie.cookie
      },
      data: data
    };
  
    return axios(config);
  }catch(error){
    console.log("price mismatch",error.message);
  }
  return null;
}
