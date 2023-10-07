import { USER_AGENT } from '../../../constants/common/request.mjs';

const ENDPOINT =
  'https://buff.163.com/api/market/goods/sell_order?game=csgo&goods_id={goods_id}&page_num=1&sort_by=default&mode=&allow_tradable_cooldown=1&_={timestamp}';

export const composePriceEndpoint = (goodsId) =>
  ENDPOINT.replace('{goods_id}', goodsId).replace('{timestamp}', Date.now());

export const getCSGOGoodsPrice = async (goodsId) => {
  const res = await fetch(composePriceEndpoint(goodsId), {
    headers: {
      'User-Agent': USER_AGENT,
    },
  });
  const data = (await res.json()).data;
  if (!data) {
    return null;
  }
  const price = data.items[0]?.price;
  return price ? parseFloat(price, 10) || null : null;
};
