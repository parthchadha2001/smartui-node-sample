const webdriver = require("selenium-webdriver");
const By = webdriver.By;
var async1 = require("asyncawait/async");
var await1 = require("asyncawait/await");
var moment = require("moment");

// username: Username can be found at automation dashboard
const USERNAME = process.env.LT_USERNAME || "username";

// AccessKey:  AccessKey can be generated from automation dashboard or profile section
const KEY = process.env.LT_ACCESS_KEY || "accessKey";

// gridUrl: gridUrl can be found at automation dashboard
const GRID_HOST = process.env.GRID_HOST || "@hub.sushobhit.dev.lambdatest.io/wd/hub";

async function searchTextOnGoogle() {
  var keys = process.argv;
  console.log(keys);
  let parallelCount = keys[2] || 1;
  let tunnel = keys[3] || false;
  let platform = keys[4] || "Windows 10";
  let browserName = keys[5] || "chrome";
  let version = keys[6] || "latest";

  // Setup Input capabilities
  let capabilities = {
    platform: platform,
    browserName: browserName,
    version: version,
    queueTimeout: 300,
    visual: true,
    "user": USERNAME,
    "accessKey": KEY,
    name: "test session", // name of the test
    build: platform + browserName + version, // name of the build
    "smartUI.project": "demo",
    "smartUI.build": "first-build"
  };

  if (tunnel === "true") {
    capabilities.tunnel = true;
  }

  var gridUrl = "https://" + USERNAME + ":" + KEY + GRID_HOST;
  console.log(gridUrl);
  console.log(capabilities);
  console.log("Running " + parallelCount + " parallel tests ");
  let i = 1;
  for (i = 1; i <= parallelCount; i++) {
    startTest(gridUrl, capabilities, "Test " + i);
  }
}

searchTextOnGoogle();

async function startTest(gridUrl, capabilities, name) {
  const caps = capabilities;
  var start_date = moment();

  const driver = await new webdriver.Builder()
    .usingServer(gridUrl)
    .withCapabilities(caps)
    .build();

  var end_date = moment();
  var duration = moment.duration(end_date.diff(start_date));
  console.log(caps.name, " : Setup Time :", duration.asSeconds());

  // navigate to a url
  let url = "https://www.lambdatest.com/blog/";
  console.log(url);
  await driver
    .get(url)
    .then(function () {
      const session = driver.getSession();

      // For Smartui TakeScreenshot
      console.log("smartui.takeScreenshot, calling ")
      driver.executeScript("smartui.takeScreenshot").then(out => {
        console.log("smartui.takeScreenshot, RESPONSE :", out)
        return
      });

      driver.getTitle().then(function (title) {
        setTimeout(function () {
          driver.executeScript("lambda-status=passed");
          driver.quit();
        }, 10000);
      });
    })
    .catch(function (err) {
      error = JSON.stringify(err);
      console.log(error);
      console.log("test failed with reason " + err);
      driver.executeScript("lambda-status=failed");
      driver.quit();
    });
  console.log(caps.name + " Test End");
}
