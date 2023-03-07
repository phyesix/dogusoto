const express = require("express");
const cors = require("cors");
const app = express();
const axios = require('axios');
const playwright = require('playwright');

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

async function checkCar(d) {
  let cars = [];
  for (let i = 0; i < d.length; i++) {
    const car = d[i];
    for (let a = 0; a < d[i].vehiclereservedealer.length ; a++) {
      const dealer = d[i].vehiclereservedealer[a];
      if(dealer.isoptiontocustomer) {
        cars.push(dealer.dealername);
      }
    }
  }
  return cars;
}

async function checkDogus() {
  const browser = await playwright.firefox.launch();
  const page = await browser.newPage();
  await page.goto('https://www.dogusoto.com.tr/q3-f3b');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: './png/page.png' })
  const getList = await page.evaluate(async () => {
    return await fetch('https://www.dogusoto.com.tr/api/vehicle/getvehiclelist/q3-f3b', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        'Cache-Control': 'no-cache'
      }
    })
      .then(res => res.clone().json());
  });
  await page.waitForTimeout(2000);

  const carDealers = await checkCar(getList.data);
  if(carDealers.length > 0) {
    const mailData = {
      from: process.env.MAILJET_MAIL,
      to: "phyesix@gmail.com",
      subject: `DOGUSOTO AUDI STOCK `+ carDealers.length,
      text: carDealers[0] || "DOGUSOTO AUDI",
      html: `
        <div>
          <h1>DOGUSOTO AUDI STOCK</h1>
          ${carDealers.toString()}
        </div>`
    };
    console.log("mailData", mailData);
    transporter.sendMail(mailData, function (err, info) {
        console.log("info", info);
        console.log("err", err)
    });
  }

  await browser.close();
}

async function main() {
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
    text: data.Message[0] || "AUDI",
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
  main()
    .then((json) => {
      console.log("json", json);
      // res.json({ message: json });
      if(json.ResultCode !== 500) {
        console.log("Sending mail...");
        res.json({ message: "STOCK COUNT: " + JSON.stringify(json.Data.length) });
        sendMail(json);
      } else {
        console.log(":(");
        res.json({ message: "500 :( --" + JSON.stringify(json) });
      }
    })
    .catch(err => {
      console.log(err);
      res.json({ message: "ERR :( --" + err });
    })
})

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
})

app.get('/*', (req, res) => {
  res.json({ message: "Hello world"});
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})