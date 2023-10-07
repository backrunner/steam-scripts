import ProgressBar from 'cli-progress';
import Table from 'cli-table3';

import { getCSGOGoodsPrice } from '../modules/api/buff/price.mjs';
import { getCSGOMarketPrice } from '../modules/api/steam/market/price.mjs';
import { PromiseExecutionQueue } from '../modules/utils/queue.mjs';

const EXECUTION_SPAN = 3 * 1000;

const goods = [
  ['反冲武器箱', '900464', 'Recoil Case'],
  ['地平线武器箱', '759175', 'Horizon Case'],
  ['棱彩武器箱', '769121', 'Prisma Case'],
  ['“头号特训”武器箱', '763236', 'Danger Zone Case'],
  ['裂空武器箱', '781534', 'Fracture Case'],
  ['“野火大行动”武器箱', '35895', 'Operation Wildfire Case'],
  ['弯曲猎手武器箱', '33825', 'Falchion Case'],
  ['光谱武器箱', '38150', 'Spectrum Case'],
  ['变革武器箱', '921379', 'Revolution Case'],
  ['梦魇武器箱', '886606', 'Dreams & Nightmares Case'],
  ['棱彩2号武器箱', '779175', 'Prisma 2 Case'],
  ['暗影武器箱', '37510', 'Shadow Case'],
  ['“狂牙大行动”武器箱', '835343', 'Operation Broken Fang Case'],
  ['“激流大行动”武器箱', '871092', 'Operation Riptide Case'],
  ['反恐精英20周年武器箱', '773524', 'CS20 Case'],
  ['弯曲猎手武器箱', '33825', 'Falchion Case'],
];

const multiBar = new ProgressBar.MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
    // eslint-disable-next-line no-useless-concat
    format: '[{queueName}] |' + ' {bar} | {percentage}% || {value}/{total}',
  },
  ProgressBar.Presets.shades_classic,
);

const buffRequestQueue = new PromiseExecutionQueue(EXECUTION_SPAN, multiBar, 'Buff Queue');
const steamMarketRequestQueue = new PromiseExecutionQueue(EXECUTION_SPAN, multiBar, 'Steam Market Queue');

async function fetchPrices() {
  // eslint-disable-next-line no-unused-vars
  for (const [name, buffGoodId, steamGoodHashName] of goods) {
    buffRequestQueue.add(() => getCSGOGoodsPrice(buffGoodId));
    steamMarketRequestQueue.add(() => getCSGOMarketPrice(steamGoodHashName));
  }

  await Promise.all([buffRequestQueue.processQueue(), steamMarketRequestQueue.processQueue()]);

  multiBar.stop();

  const buffPrices = buffRequestQueue.results;
  const steamPrices = steamMarketRequestQueue.results;

  const results = [];
  for (let i = 0; i < goods.length; i++) {
    const name = goods[i][0];
    const buffPrice = buffPrices[i] || 0;
    const steamPrice = steamPrices[i] || 0;
    const buyersRevenue = steamPrice * 0.85;
    const priceRatio = buffPrice / buyersRevenue;
    const income = buyersRevenue - buffPrice;

    results.push([name, buffPrice, steamPrice, buyersRevenue, priceRatio, income]);
  }

  return results;
}

async function processAndLog() {
  const prices = await fetchPrices();

  // Sorting by the Price Ratio
  prices.sort((a, b) => (a[4] || 0) - (b[4] || 0));

  const table = new Table({
    head: ['Name', 'Buff Price', 'Steam Price', "Buyer's Revenue", 'Price Ratio', 'Income'],
    colWidths: [30, 15, 15, 20, 15, 15], // Adjusted column widths for new column
  });

  prices.forEach((item) => {
    table.push([
      item[0],
      item[1] ? item[1].toFixed(2) : 'N/A',
      item[2] ? item[2].toFixed(2) : 'N/A',
      item[3] ? item[3].toFixed(2) : 'N/A',
      item[4] ? item[4].toFixed(2) : 'N/A',
      item[5] ? item[5].toFixed(2) : 'N/A', // Income column
    ]);
  });

  console.log(table.toString());
}

processAndLog();
