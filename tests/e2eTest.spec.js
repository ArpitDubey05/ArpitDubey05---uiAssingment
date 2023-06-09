const { test, expect } = require("@playwright/test", "@playwright.config.js");
const { ApiUtils } = require('./utils/ApiUtils');
const fs = require('fs');
const fpath = './data.json';
const path = require('path');



test.use({ launchOptions: { args: ['--deny-permission-prompts'] } });
test('e2e', async ({ page }) => {
  const apiUtils = new ApiUtils();
  const filePath = path.resolve(__dirname, fpath);
  const jsonData = await new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
  console.log(jsonData)

  // launch the browser, open url and search keyword
  const { url, initialsearch } = jsonData;
  let result = apiUtils.goToGoogleAmazon(url, initialsearch, page)

  // dismissing location dialog
  await page.locator("div.g").first().waitFor();
  await page.on("dialog", dialog => dialog.dismiss())

  // 4 print all the search results
  const searchResults = await page.$$('div.g');
  for (const result of searchResults) {
    const titleElement = await result.$('h3');
    const title = await titleElement.textContent();
    console.log(title);
  }

  //Click on the link which takes you to the amazon login page.
  const firstResult = searchResults[0];
  const link = await firstResult.$('h3 a');
  await link.click();

  //login to https://www.amazon.in/    --  if Email is provided then we will need to provide otp as well
  const { username, password } = jsonData;
  result = await apiUtils.login(username, password, page);

  // Step 7: Click on all buttons on search & select Electronics
  await page.selectOption('select#searchDropdownBox', 'search-alias=electronics');

  // Step 8: Search for Dell computers
  const { itemToSearch } = jsonData
  result = apiUtils.search(itemToSearch, page);

  // Step 9: Apply the filter of range Rs min to max
  const { min, max } = jsonData
  result = await apiUtils.rangeFilter(min, max, page);
  console.log(result);

  // Step 10: Validate all the products on the first 2 pages are shown in the range of Rs 30000 to 50000
  result = await apiUtils.validatePriceRange(min, max, page);
  console.log(result);

  // Step 11: Print all the products on the first 2 pages whose rating is 5 out of 5
  result = await apiUtils.printProduct(page);
  console.log(result);

}
)
