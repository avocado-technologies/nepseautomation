// let baseUrl = process.env.BASE_URL;
import { fetchCaptcha, fetchId } from "./fetchCaptcha";
import { getDfilesText } from "../util/ocr";
import axios from "axios";
const path = require("path");
import { getCon, setCon, save } from "../util/config";
import { callTmsDetailsApi, quantDb } from "./data";
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const { Encryptor } = require("node-laravel-encryptor");

export async function saveError(errorMessage, res) {
  const dataDb = await quantDb.getData(`/${res.id}`);
  dataDb.errors.push(errorMessage);
  await quantDb.push(`/${res.id}`, dataDb);
  console.log("error push", errorMessage);
}

async function saveResponse(response, res) {
  if (response.data && response.data.data) {
    const dataDb = await quantDb.getData(`/${res.id}`);
    dataDb.cookie = response.headers["set-cookie"];
    dataDb.userdata = response.data.data;

    await quantDb.push(`/${res.id}`, dataDb);
  }
}

async function login(captcha, captchaid, response) {
  try {
    if (captcha && captchaid) {
      const baseUrl = response.tms_url;
      let encryptor = new Encryptor({
        key: process.env.ENCRYPT_KEY,
      });
      const loginData = JSON.stringify({
        userName: response.tms_username,
        password: Buffer.from(
          encryptor.decrypt(response.tms_password)
        ).toString("base64"),
        jwt: "",
        otp: "",
        userCaptcha: captcha,
        captchaIdentifier: captchaid,
      });
      var config = {
        method: "post",
        url: `${baseUrl}tmsapi/authApi/authenticate`,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0",
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/json",
          Origin: `${baseUrl}`,
          DNT: "1",
          Connection: "keep-alive",
          Referer: `${baseUrl}login`,
        },
        data: loginData,
      };

      return axios(config);
    }
  } catch (err) {
    console.log("login errr");
  }
  return null;
}
export async function loginWithCaptcha(res) {
  try {
    let captcha, captchaid;
    const baseUrl = res.tms_url;
    const idresponse = await fetchId(baseUrl);
    if (idresponse.data) {
      captchaid = idresponse.data.id;
      await fetchCaptcha(captchaid, res.id, baseUrl);

      const content = await new Promise((resolve, reject) => {
        getDfilesText(path.resolve(__dirname + "../../../", "download", `index${res.id}.png`), (content) => {
          resolve(content);
        });
      });
      if (
        content["text"] &&
        content["text"].length == 6 &&
        content["confidence"] >= 80
      ) {
        captcha = content["text"];
        const response = await login(captcha, captchaid, res);
        if (response && response.status == 200) {
          await saveResponse(response, res);
          return true;
        } else if (
          response &&
          response.response &&
          response.response.status == 401 &&
          response.response.data.message === "Credentials Not Found"
        ) {
          console.log("error while calling login",response.response.data.message,res.name);
          await saveError(response.response.data.message, res);

          return "Credentials Not Found";
        } else if (response && response.status >= 400) {
          console.log("error while calling login",response.response.data.message,res.name);
          return false;
        } else {
          console.log("error while calling login",response.response.data.message,res.name);
          return false;
        }
      } else {
        return false;
      }
    }
  } catch (err) {
    console.log(err);
    console.log("error");
  }
  return false;
}
