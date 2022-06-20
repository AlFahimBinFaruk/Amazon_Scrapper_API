const startBrowser = require("../utils/browser");

//app controller
const scraptController = async (req, res) => {
  //req.body
  let { url, name, price, imgURL, productLink, stars, ratings, overview } =
    req.body;
  //Start the browser and create a browser instance
  let browserInstance = startBrowser();
  let browser;
  try {
    browser = await browserInstance;
    let page = await browser.newPage();
    console.log(`Navigation to => ${url}`);
    await page.goto(url);
    // Wait for the required DOM to be rendered
    await page.waitForSelector(".s-result-list");
    // Get the link to all the required books
    /*
    if we map inside something we have to give $$eval otherwise $eval
    */
    let urls = await page.$$eval(
      ".s-result-item .sg-col-inner > .s-widget-container",
      (links) => {
        // Extract the links from the data
        links = links.map((el) => el.querySelector("a").href);
        return links;
      }
    );

    //loop throught each link open a new page and get the data from them
    let pagePromise = (link) =>
      new Promise(async (resolve, reject) => {
        let dataObj = {};
        let newPage = await browser.newPage();
        await newPage.goto(link);
        try {
          if (productLink) {
            dataObj["productLink"] = link;
          }

          if (name) {
            dataObj["name"] = await newPage.$eval(
              "#title_feature_div .product-title-word-break",
              (name) => name.textContent.trim()
            );
          }
          if (imgURL) {
            dataObj["imgURL"] = await newPage.$eval(
              "#imgTagWrapperId img",
              (img) => img.src.trim()
            );
          }
          if (price) {
            dataObj["price"] = await newPage.$eval(
              "#apex_desktop .a-offscreen",
              (price) => price.textContent.trim()
            );
          }
          if (stars) {
            dataObj["stars"] = await newPage.$eval(
              "#averageCustomerReviews .a-icon > .a-icon-alt",
              (stars) => stars.textContent.trim()
            );
          }
          if (ratings) {
            dataObj["ratings"] = await newPage.$eval(
              "#averageCustomerReviews .a-link-normal > .a-size-base",
              (ratings) => ratings.textContent.trim()
            );
          }

          if (overview) {
            dataObj["overview"] = await newPage.$$eval(
              "#productOverview_feature_div tbody tr",
              (overview) => {
                overview = overview.map((el) => {
                  return {
                    name: el.querySelector(".a-span3").textContent.trim(),
                    value: el.querySelector(".a-span9").textContent.trim(),
                  };
                });
                return overview;
              }
            );
          }
        } catch (error) {
          //if the product is not found show this error in that place
          dataObj["error"] = "this info was not found!!";
        }
        //resolve
        resolve(dataObj);
        //close the page
        await newPage.close();
      });
    //scrapted data array
    let scraptedData = [];
    //loop throught the urls can call the page promise to get specific data.
    for (link in urls) {
      let currentPageData = await pagePromise(urls[link]);
      //push the current data into that array
      scraptedData.push(currentPageData);
    }
    //close the scrapting browser after scrapting is done
    browser.close();
    //return response
    return res.status(200).json(scraptedData);
    //catch
  } catch (error) {
    //close the scrapting browser if there are error
    browser.close();
    res.status(500).json({ msg: error.message });
  }
};

module.exports = { scraptController };
//s-main-slot  s-search-results sg-row
