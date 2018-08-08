const fs = require('fs');
const puppeteer = require('puppeteer');
var stream = fs.createWriteStream("out.csv", {flags:'a'});

(async () => {
  const browser = await puppeteer.launch();

  console.log("Loading saxo.");
  const saxo = await browser.newPage();
  await saxo.goto('https://www.saxotrader.com/sim/login/?lang=en');
  await saxo.focus('#field_userid');
  await saxo.keyboard.type('8902696');
  await saxo.focus('#field_password');
  await saxo.keyboard.type('9876');
  await saxo.click('#button_login');
  await saxo.waitForNavigation();
  await saxo.waitForSelector('.tradebtn');

  console.log("Loading fxstreet.");
  const fxstreet = await browser.newPage();
  await fxstreet.goto('https://www.fxstreet.com/rates-charts/rates');
  await fxstreet.waitForSelector('.fxs_ratestable_number');

  console.log("Starting!");
  setInterval(() => {
    saxo.evaluate(() => {
      return Promise.resolve($(".tradebtn").eq(0).text().trim().split(' ').slice(0,2).join('').replace(',', '.') + ',' + $(".tradebtn").eq(1).text().trim().split(' ').slice(0,2).join('').replace(',', '.'));
    }).then((v) => {
      let items = [v];

      return fxstreet.evaluate(() => {
        return Promise.resolve($(".fxs_ratestable_number").eq(2).text().trim());
      }).then((w) => {
        items.push(w);
        console.log(items.join(','));
        stream.write(new Date().toISOString() + "," + items.join(',') + '\r\n');
      });
    });  
  }, 300);
})();
