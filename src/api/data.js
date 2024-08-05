import axios from "axios";
import NodeCache from "node-cache";
import { setCon } from "../util/config";

import { JsonDB, Config } from "node-json-db";

const fs = require("fs");
const appCache = new NodeCache();
export const quantDb = new JsonDB(new Config("quant", true, false, "/"));
const URL = process.env.URL;

export async function callTmsDetailsApi() {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${URL}/api/tms-details`,
    headers: {
      Authorization: `Basic ${Buffer.from(
        `admin:${process.env.BASIC_AUTH_SECRET}`
      ).toString("base64")}`,
    },
  };

  const response = await axios.request(config);
  if (response.data) {
    // setCon("goals",goals)
    await createUserConfig(response.data);
  }
  return response.data;
}
async function createUserConfig(tms) {
  for (let index = 0; index < tms.length; index++) {
    const element = tms[index];

    const goals = element.goals.map((g) => {
      if (g.price > 0) {
        return {
          symbol: g.symbol,
          quantity: g.qty,
          type: g.type,
          strategy: g.strategy,
          tmsorders: [],
          ordertype: g.ordertype,
          price: g.price,
          preOpen: g.pre_open,
          orderId:g.id
        };
      }
      return {
        symbol: g.symbol,
        quantity: g.qty,
        type: g.type,
        strategy: g.strategy,
        tmsorders: [],
        ordertype: g.ordertype,

        preOpen: g.pre_open,
        orderId:g.id
      };
    });

    // JSON data to append
    const data = {
      goals: goals,
      cookie: [],
      userdata: {},
      url: element.tms_url,
      errors: [],
    };

    await quantDb.push(`/${element.id}`, data);
    await quantDb.reload();
  }
}

async function createOrUpdateUserConfig(tms) {
  for (let index = 0; index < tms.length; index++) {
    const element = tms[index];
    const dbData = await quantDb.getData(`/${element.id}`);
    let data = null;

    //when we already have goals and save file
    if (dbData && dbData.goals.length) {
      const goals = element.goals.map((g, index) => {
        const dbGoal = dbData.goals[index];

        if (g.strategy==='FIXED') {
          return {
            symbol: g.symbol,
            quantity: g.qty,
            type: g.type,
            strategy: g.strategy,
            tmsorders: dbGoal && dbGoal.tmsorders ? dbGoal.tmsorders : [],
            ordertype: g.ordertype,
            price: g.price,
            preOpen: g.pre_open,
            sid:g.sid?g.sid:null,
            orderId:g.id?g.id:null

          };
        }
        return {
          symbol: g.symbol,
          quantity: g.qty,
          type: g.type,
          strategy: g.strategy,
          tmsorders: dbGoal && dbGoal.tmsorders ? dbGoal.tmsorders : [],
          ordertype: g.ordertype,
          preOpen: g.pre_open,
          sid:g.sid?g.sid:null,
          orderId:g.id?g.id:null        };
      });
      data = {
        ...dbData,
        goals: goals,

      };
    
    } else {
       //fresh run
      const goals = element.goals.map((g) => {
        if (g.strategy==='FIXED') {
          return {
            symbol: g.symbol,
            quantity: g.qty,
            type: g.type,
            strategy: g.strategy,
            tmsorders: [],
            ordertype: g.ordertype,
            price: g.price,
            preOpen: g.pre_open,
            sid:null,
            orderId:g.id?g.id:null 
          };
        }
        return {
          symbol: g.symbol,
          quantity: g.qty,
          type: g.type,
          strategy: g.strategy,
          tmsorders: [],
          ordertype: g.ordertype,

          preOpen: g.pre_open,

          sid:null,
          orderId:g.id?g.id:null 
        };
      });

      // JSON data to append
      data = {
        goals: goals,
        cookie: [],
        userdata: {},
        url: element.tms_url,
        errors: [],
      };
    }
    await quantDb.push(`/${element.id}`, data);
    await quantDb.reload();
  }
}

export async function callTmsDetailsApiPeriodically() {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${URL}/api/tms-details`,
    headers: {
      Authorization: `Basic ${Buffer.from(
        `admin:${process.env.BASIC_AUTH_SECRET}`
      ).toString("base64")}`,
    },
  };

  const response = await axios.request(config);
  if (response.data) {
    // setCon("goals",goals)
    await createOrUpdateUserConfig(response.data);
  }
  return response.data;
}
