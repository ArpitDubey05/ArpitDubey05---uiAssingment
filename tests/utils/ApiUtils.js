const fs = require('fs');
class ApiUtils {


  async login(contact, password, page) {
    await page.locator('#nav-link-accountList').click();
    await page.fill('#ap_email', contact);
    await page.click('#continue');
    await page.waitForSelector('input[type="password"]');
    await page.fill('#ap_password', password);
    await page.click('#signInSubmit');
    return true;
  };

  async search(element, page) {
    await page.fill('#twotabsearchtextbox', element);
    await page.press('#twotabsearchtextbox', 'Enter');
    await page.waitForNavigation();
  };

  async readJsonFile(fpath, path, fs) {
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
  };

  async goToGoogleAmazon(url, searchKeyword, page) {
    await page.goto(url);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.fill('#APjFqb', searchKeyword);
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
  };

  async rangeFilter(min, max, page) {
    await page.waitForSelector('input[name="low-price"]');
    await page.click('input[name="low-price"]');
    await page.fill('input[name="low-price"]', min);
    await page.click('input[name="high-price"]');
    await page.fill('input[name="high-price"]', max);
    await page.locator('.a-button-input').click();
    console.log(" rangeFilter executed with range " + min + " and " + max);
    return true;
  };

  async validatePriceRange(min, max, page) {
    const productPrices = await page.$$eval('.sg-col-inner span.a-price-whole', (elements) => elements.map((element) => element.innerText));
    const validRange = productPrices.every((price) => {
      const numericPrice = parseInt(price.replace(',', ''));
      return numericPrice >= min && numericPrice <= max;
    });
    return validRange;
  };

  async printProduct(page) {
    const productRatings = await page.$$eval('.sg-col-inner .a-icon-alt', (elements) =>
      elements.map((element) => element.innerText.trim())
    );
    const productTitles = await page.$$eval('.sg-col-inner .a-size-medium.a-color-base.a-text-normal', (elements) =>
      elements.map((element) => element.innerText.trim())
    );
    for (let i = 0; i < productRatings.length; i++) {
      if (productRatings[i] === '5.0 out of 5 stars') {
        console.log(`Product: ${productTitles[i]}`);
      }
    }
  };

  async createOrder(orderPayLoad) {
    let response = {};
    response.token = await this.getToken();
    const orderResponse = await apiContext.post("https://rahulshettyacademy.com/api/ecom/order/create-order",
      {
        data: this.orderPayLoad,
        headers: {
          'Authorization': response.token,
          'Content-Type': "application/json",
        }
      });
    const orderResponseJson = await orderResponse.json();
    const orderId = orderResponseJson.orders[0];
    response.orderId = orderId;
    return response;

  }

}
module.exports = { ApiUtils };