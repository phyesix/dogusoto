const express = require("express");
const cors = require("cors");
const app = express();

const axios = require('axios');
const puppeteer = require('puppeteer');
const path = require('path');

const port = 3000;

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

require("dotenv").config();

let nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    port: 465,
    host: process.env.MAILJET_SMTP_SERVER,
    auth: {
        user: process.env.MAILJET_APIKEY,
        pass: process.env.MAILJET_SECRETKEY,
    },
    secure: true,
});

function sleep(time) { return new Promise(function(resolve) { setTimeout(resolve, time)})}

async function checkDogus() {
  const browser = await puppeteer.launch({
    defaultViewport: {width: 1920, height: 1080},
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0');
  page.on('console', async (msg) => {
    const msgArgs = msg.args();
    for (let i = 0; i < msgArgs.length; ++i) {
      console.log(await msgArgs[i].jsonValue());
    }
  });

  await page.goto('https://www.dogusoto.com.tr/q3-f3b');
  // await page.waitForSelector('.reserve.direct-link');
  // await page.waitForLoadState('networkidle');
  await sleep(5000);
  await page.screenshot({
    path: "./png/openPage.png",
    fullPage: true
  });

  const storeList = await page.evaluate(async () => {
    let availableStore = [];
    const list = document.querySelectorAll('.reserve.direct-link:not(.ng-hide)');
    //const list = document.querySelectorAll('.reserve.direct-link');
    for (let a = 0; a < list.length; a++) {
      const store = list[a].parentElement.innerText;
      availableStore.push(store)
    }
    return availableStore;
  });

  if(storeList.length > 0) {
    const mailData = {
      from: process.env.MAILJET_MAIL,
      to: "phyesix@gmail.com",
      subject: `DOGUSOTO AUDI STOCK `+ storeList.length,
      text: storeList[0] || "DOGUSOTO AUDI",
      html: `
        <div>
          <h1>DOGUSOTO AUDI STOCK</h1>
          ${storeList.toString()}
        </div>`
    };

    transporter.sendMail(mailData, function (err, info) {
      console.log("info", info);
      console.log("err", err)
    });
  }

  await browser.close();
}

async function checkAudi() {
  var dataToPost = {
    modeldes: "Q3 35 Turbo FSI 150 hp Advanced S tronic",
    modelcode: "F3B"
  };

  let axiosConfiguration = {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      "Access-Control-Allow-Origin": "*",
      'Cache-Control': 'no-cache'
    }
  };

  const res = await axios.post('https://stokarac.audi.com.tr/home/GetModelList4?time=' + Date.now(), dataToPost, axiosConfiguration)
  return res.data;
}

async function sendMail(data) {
  let content;

  for (let index = 0; index < data.Data.length; index++) {
    const dataX = data.Data[index];

    let company = dataX.CompanyName;
    let phone = dataX.Telephone;
    let phone2 = dataX.Telephone2;
    let phone3 = dataX.Telephone3;
    let phone4 = dataX.Telephone4;
    let phone5 = dataX.Telephone5;

    content += `
      <div>
        <h3>${company}</h3>
        <a href="tel:${phone}">${phone}</a><br>
        <a href="tel:${phone2}">${phone2}</a><br>
        <a href="tel:${phone3}">${phone3}</a><br>
        <a href="tel:${phone4}">${phone4}</a><br>
        <a href="tel:${phone5}">${phone5}</a>
      </div>
    `;
  }

  const mailData = {
    from: process.env.MAILJET_MAIL,
    to: "phyesix@gmail.com",
    subject: `AUDI STOCK `+ data.Data.length,
    text: data.Message[0] || "AUDI",
    html: `
      <div>
        <h1>AUDI STOCK</h1>
        ${content}
      </div>`
  };
  console.log("mailData", mailData);
  transporter.sendMail(mailData, function (err, info) {
      console.log("info", info);
      console.log("err", err)
  });
}

app.get('/audi', (req, res) => {
  checkAudi()
    .then((json) => {
      console.log("json", json);
      
      if(json.ResultCode !== 500) {
        sendMail(json);
      }

      res.json({ message: JSON.stringify(json) });
    })
    .catch(err => {
      console.log(err);
      res.json({ message: "ERR :( --" + err });
    })
});

app.get('/dogus', (req, res) => {
  checkDogus()
    .then((json) => {
      // console.log("json", JSON.parse(json));
      // console.log("json stringify", JSON.stringify(json));
      res.json({ message: "200" + JSON.stringify(json) });
    })
    .catch(err => {
      console.log(err);
      res.json({ message: "ERR :( --" + err });
    })
});

app.get('/*', (req, res) => {
  res.json({ message: "Hello world"});
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
