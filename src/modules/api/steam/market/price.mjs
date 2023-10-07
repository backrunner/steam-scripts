import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { USER_AGENT } from '../../../../constants/common/request.mjs';
import { APPID } from '../../../../constants/steam/market.mjs';

const USE_PROXY = false;
const PROXY = 'http://127.0.0.1:7890/';

const ENDPOINT =
  'https://steamcommunity.com/market/priceoverview/?appid={appid}&country=CN&currency=23&market_hash_name={hash_name}';

export const composeMarketPriceURL = (appId, hashName) =>
  ENDPOINT.replace('{appid}', appId).replace('{hash_name}', encodeURIComponent(hashName));

export const getCSGOMarketPrice = async (hashName) => {
  const agent = USE_PROXY ? new HttpsProxyAgent(PROXY) : null;
  const res = await fetch(composeMarketPriceURL(APPID.CSGO, hashName), {
    headers: {
      'User-Agent': USER_AGENT,
    },
    agent,
  });

  const data = await res.json();
  const price = data.lowest_price;

  return price ? parseFloat(price.split(' ')[1]) || null : null;
};
