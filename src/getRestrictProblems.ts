import * as fs from "fs";
import { chromium } from "playwright";

const TARGET_PAGE = "https://www.acmicpc.net";

const browser = await chromium.launch();
const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
  viewport: { width: 1280, height: 720 },
});
const page = await context.newPage();

await page.goto(`${TARGET_PAGE}/problemset`);
console.log("working...");

let banList: (string | null)[] = [];

let flag = true;
let index = 1;
while (flag) {
  console.log(`page: ${index}`);
  await page.goto(
    `${TARGET_PAGE}/problemset?sort=no_asc&style=ll&style_if=and&page=${index}`
  );
  const problemIds = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll("table > tbody > tr > td:nth-child(1)")
    ).map((item) => {
      return item.textContent && item.textContent;
    });
  });
  banList = [...banList, ...problemIds];
  if (problemIds.length === 0) {
    flag = false;
  }
  ++index;
}

let result = "[";
for (const id of banList) {
  result += `${id}, `;
}
let len = result.length;
result = result.substring(0, len - 2) + "]";
fs.writeFileSync("result.txt", result);

await browser.close();
