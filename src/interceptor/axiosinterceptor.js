import axios from "axios";
const baseUrl = process.env.BASE_URL;
import { refresh } from "../api/refresh";
import { setCon, save } from "../util/config";
import { quantDb } from "../api/data";
// Create a map to store request-response associations
const requestResponseMap = new Map();



// Add a response interceptor
export function createAxiosResponseInterceptor() {
  const interceptor = axios.interceptors.response.use(
    function (response) {
      // console.log('success url', response.config.url);

      // if (response.config.url === `${baseUrl}tmsapi/authApi/authenticate`) {
      //   //save cookie and user data
      //   saveResponse(response);
      // }
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      return response;
    },
    function (error) {
      if (error.response) {
        // Request made and server responded
        // console.log("why happen what happen. below");
        // console.log("error data ", error.response.data);
        // console.log("error status ", error.response.status);
        // console.log("error headers ", error.response.headers);
        // console.log("error url ", error.response.config.url);
        // if (
        //   error.response.data.message &&
        //   error.response.data.message.startsWith(
        //     "ORDER_PRICE_SHOULD_BE_WITHIN_DPR_RANGE"
        //   )
        // ) {
        //   console.log(error.response.config);
        //   setTimeout(() => {
        //     axios.interceptors.response.eject(interceptor);
        //     return axios(error.response.config);
        //   }, 10000);
        // }
        if (error.response.status > 500) {
          //if 400 or 401
          setTimeout(() => {
            axios.interceptors.response.eject(interceptor);
            return axios(error.response.config);
          }, 10000);
        }
        // if (
        //   error.response.data.message ===
        //   "THIS ORDER IS CURRENTLY PROCESSING. REFRESH AND TRY AGAIN"
        // ) {
        //   setTimeout(() => {
        //     axios.interceptors.response.eject(interceptor);
        //     return axios(error.response.config);
        //   }, 10000);
        // }
        if (
          error.response.status === 401 &&
          error.response.data &&
          error.response.data.message === "ACCESS_TOKEN_EXPIRED"
          &&error.config.baseUrl 
        ) {
          console.log('Base URL from error:', error.config.baseUrl );
    
    
          // console.log("here token");
          axios.interceptors.response.eject(interceptor);
          return refresh(error.config.baseUrl)
            .then((response) => {
              // setCon("cookie", response.headers["set-cookie"]);
              // save();
              console.log("saved",response);
              saveCookie(response.headers["set-cookie"],response.config.baseURL)
              // return axios(error.response.config);
            })
            .catch((error) => {
              console.log(error.response.data)
              // return Promise.reject(error);
            })
            .finally(createAxiosResponseInterceptor);
        }
      } else if (error.request) {
        // The request was made but no response was received
        // console.log("error message", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        // console.log("error message", error.message);
      }

      // console.log(error.response);
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      return error;
    }
  );
}
async function saveCookie(cookie,baseUrl){
  const data = await quantDb.getData('/');

  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      if (data[key].url === baseUrl) {
        const responseData = data[key];
        responseData.cookie = cookie;
        await quantDb.push(`/${responseData.id}`,responseData);
        break;
      }

    }
  }
  // console.log(data);
}
function saveResponse(response) {
  setCon("cookie", response.headers["set-cookie"]);
  // quantDb.push()
  if (response.data && response.data.data) {
    setCon("userdata", response.data.data);
  }
  save();
}
createAxiosResponseInterceptor();
