const playwright = require('playwright');

(async () => {
  const browser = await playwright.firefox.launch();
  const page = await browser.newPage();
  await page.goto('https://stokarac.audi.com.tr');
  await page.selectOption('select#modelcode', 'F3B');
  await page.waitForTimeout(5000);
  await page.selectOption('select#modeldes', 'model_q3_35 turbo fsı 150 hp advanced s tronic');
  await page.waitForTimeout(5000);

  // const books = await page.$$eval('.product_pod', all_items => {
  //   const data = [];
  //   all_items.forEach(book => {
  //     const name = book.querySelector('h3').innerText;
  //     const price = book.querySelector('.price_color').innerText;
  //     const stock = book.querySelector('.availability').innerText;
  //     data.push({ name, price, stock });
  //   });
  //   return data;
  // });
  // console.log(books);
  // console.log(books.length);
  await page.screenshot({ path: 'page.png' })
  await browser.close()
})();