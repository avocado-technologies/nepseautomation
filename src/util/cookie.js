import { quantDb } from '../api/data';
import { getCon } from './config';
export  function getCookieFromResponse(tmsdetails) {
  
  // const cookies = getCon('cookie');
  // const userdata = getCon('userdata');
  let cookie = '';
  let xhrToken = '';
  for (const c of tmsdetails.cookie) {
    const splitter = c.split(';');
    if (splitter[0].startsWith('XSRF-TOKEN')) {
      xhrToken = splitter[0].split('=')[1];
    }
    cookie += splitter[0] + ';';
  }
  cookie = cookie.slice(0, -1);
  return { cookie, xhrToken, userdata: tmsdetails.userdata };

}
