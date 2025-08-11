import { chromium } from "playwright";

const TARGET_PAGE = "https://www.acmicpc.net";

const browser = await chromium.launch();
const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
  viewport: { width: 1280, height: 720 },
});
const page = await context.newPage();

type SubmitResult = {
  id: string;
  result: string | null;
  time: string | null;
};

const problemId = "10947";
const userId = "aig0016";

console.log("working...");

let flag = true;
let results: SubmitResult[] = [];
let url = `${TARGET_PAGE}/status?problem_id=${problemId}&user_id=${userId}`;
let targetuUrl = url;
while (flag) {
  flag = false;
  if (results.length > 0) {
    const lastId = results[results.length - 1].id;
    if (!lastId) {
      break;
    }
    targetuUrl = `${url}&top=${Number(lastId) - 1}`;
  }
  await page.goto(`${targetuUrl}`);

  const pageResults = await page.evaluate(() => {
    const SUBMIT_STATUS = {
      ACCEPTED: "ACCEPTED",
      WAITING: "WAITING",
      WRONG_ANSWER: "WRONG ANSWER",
      UNKNOWN: "UNKNOWN",
    };

    const submitResults = [
      {
        name: "result-wait",
        status: SUBMIT_STATUS.WAITING,
        text: "기다리는 중",
      },
      {
        name: "result-rejudge-wait",
        status: SUBMIT_STATUS.WAITING,
        text: "재채점을 기다리는 중",
      },
      {
        name: "result-no-judge",
        status: SUBMIT_STATUS.WAITING,
        text: "채점하지 않음",
      },
      {
        name: "result-compile",
        status: SUBMIT_STATUS.WAITING,
        text: "채점 준비 중",
      },
      {
        name: "result-judging",
        status: SUBMIT_STATUS.WAITING,
        text: "채점 중",
      },

      {
        name: "result-ac",
        status: SUBMIT_STATUS.ACCEPTED,
        text: "맞았습니다!!",
      },

      {
        name: "result-pac",
        status: SUBMIT_STATUS.WRONG_ANSWER,
        text: "맞았습니다!!",
      },
      {
        name: "result-pe",
        status: SUBMIT_STATUS.WRONG_ANSWER,
        text: "출력 형식이 잘못되었습니다",
      },
      {
        name: "result-wa",
        status: SUBMIT_STATUS.WRONG_ANSWER,
        text: "틀렸습니다",
      },
      {
        name: "result-awa",
        status: SUBMIT_STATUS.WRONG_ANSWER,
        text: "!맞았습니다",
      },
      {
        name: "result-tle",
        status: SUBMIT_STATUS.WRONG_ANSWER,
        text: "시간 초과",
      },
      {
        name: "result-mle",
        status: SUBMIT_STATUS.WRONG_ANSWER,
        text: "메모리 초과",
      },
      {
        name: "result-ole",
        status: SUBMIT_STATUS.WRONG_ANSWER,
        text: "출력 초과",
      },
      {
        name: "result-rte",
        status: SUBMIT_STATUS.WRONG_ANSWER,
        text: "런타임 에러",
      },
      {
        name: "result-ce",
        status: SUBMIT_STATUS.WRONG_ANSWER,
        text: "컴파일 에러",
      },
      {
        name: "result-co",
        status: SUBMIT_STATUS.WRONG_ANSWER,
        text: "채점 불가",
      },
      {
        name: "result-del",
        status: SUBMIT_STATUS.WRONG_ANSWER,
        text: "삭제된 제출",
      },
    ];

    const submitIds = Array.from(
      document.querySelectorAll("table > tbody > tr > td:nth-child(1)")
    ).map((item) => {
      return item.textContent && item.textContent;
    });
    const results = Array.from(
      document.querySelectorAll("table > tbody > tr > td:nth-child(4)")
    ).map((item) => {
      if (!item.firstElementChild) {
        return SUBMIT_STATUS.UNKNOWN;
      }
      const className = item.firstElementChild.className.split(" ")[1];
      const submitResult = submitResults.find(
        (result) => result.name === className
      );
      if (!submitResult) {
        return SUBMIT_STATUS.UNKNOWN;
      }
      return submitResult.status;
    });
    const submitTimes = Array.from(
      document.querySelectorAll("table > tbody > tr > td:nth-child(9) > a")
    ).map((item) => {
      const dataTimestamp = item.attributes.getNamedItem("data-timestamp");
      if (!dataTimestamp) {
        return null;
      }
      return new Date(Number(dataTimestamp.value) * 1000).toISOString();
    });

    return submitIds.map((id, index) => {
      if (!id || !results[index] || !submitTimes[index]) {
        return {
          id: "0",
          result: SUBMIT_STATUS.UNKNOWN,
          time: new Date().toISOString(),
        };
      }
      return {
        id,
        result: results[index],
        time: submitTimes[index],
      };
    });
  });

  if (pageResults.length !== 0) {
    flag = true;
  }
  results = [...results, ...pageResults];
}
console.log(results);

await browser.close();
