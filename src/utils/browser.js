const puppeteer = require("puppeteer");

const startBrowser = async () => {
  let browser;
  try {
    console.log("opening the browser");
    browser = await puppeteer.launch({
      headless: false,
      args: ["--disable-setuid-sandbox"],
      ignoreDefaultArgs: true,
    });
  } catch (error) {
    console.log("Failed the operation with error =>", error);
  }
  return browser;
};

module.exports = startBrowser;
