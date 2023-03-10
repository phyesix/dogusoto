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

async function checkDogus() {
  const axios = require('axios');
  axios.get('https://app.scrapingbee.com/api/v1', {
    params: {
      'api_key': process.env.SCRAPE_API[Math.floor(Math.random() * 11)],
      'url': 'https://www.dogusoto.com.tr/q3-f3b', 
      'wait_for': '.reserve.direct-link',
      'premium_proxy': 'true',
      'extract_rules': '{"list":{"selector":"a.item.direct-link","type":"list","output":"html"}}', 
      'country_code':'tr'
    } 
  }).then((response) => {
    const carArray = response.list;
    let avaibleDealers = [];
    
    for (let a = 0; a < carArray.length; a++) {
      let car = carArray[a];
      if(car.match('reserve direct-link ng-hide') == null) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(car, "text/html");
        var paragraphs = doc.querySelector('.item.direct-link')
        avaibleDealers.push(paragraphs.firstChild);
      }
    }

    if(avaibleDealers.length > 0) {
      const mailData = {
        from: process.env.MAILJET_MAIL,
        to: "phyesix@gmail.com",
        subject: `DOGUSOTO AUDI STOCK `+ avaibleDealers.length,
        text: avaibleDealers[0] || "DOGUSOTO AUDI",
        html: `
          <div>
            <h1>DOGUSOTO AUDI STOCK</h1>
            ${avaibleDealers.toString()}
          </div>`
      };
  
      transporter.sendMail(mailData, function (err, info) {
        console.log("info", info);
        console.log("err", err)
      });
    }
  })
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
