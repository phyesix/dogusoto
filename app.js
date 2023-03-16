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
  const countryList = ["af", "al", "dz", "as", "ad", "ao", "ai", "aq", "ag", "ar", "am", "aw", "au", "at", "az", "bs", "bh", "bd", "bb", "by", "be", "bz", "bj", "bm", "bt", "bo", "ba", "bw", "bv", "br", "io", "vg", "bn", "bg", "bf", "bu", "bi", "kh", "cm", "ca", "cv", "ky", "cf", "td", "cl", "cn", "cx", "cc", "co", "km", "cg", "ck", "cr", "hr", "cu", "cy", "cz", "cs", "ci", "yd", "dk", "dj", "dm", "do", "tp", "ec", "eg", "sv", "gq", "er", "ee", "et", "fk", "fo", "fj", "fi", "fr", "gf", "pf", "tf", "ga", "gm", "ge", "dd", "de", "gh", "gi", "gr", "gl", "gd", "gp", "gu", "gt", "gn", "gw", "gy", "ht", "hm", "hn", "hk", "hu", "is", "in", "id", "iq", "ie", "ir", "il", "it", "jm", "jp", "jo", "kz", "ke", "ki", "kp", "kr", "kw", "kg", "la", "lv", "lb", "ls", "lr", "ly", "li", "lt", "lu", "mo", "mg", "mw", "my", "mv", "ml", "mt", "mh", "mq", "mr", "mu", "yt", "mx", "fm", "md", "mc", "mn", "ms", "ma", "mz", "mm", "na", "nr", "np", "an", "nl", "nt", "nc", "nz", "ni", "ne", "ng", "nu", "nf", "mp", "no", "om", "pk", "pw", "pa", "pg", "py", "pe", "ph", "pn", "pl", "pt", "pr", "qa", "ro", "ru", "rw", "re", "lc", "ws", "sm", "st", "sa", "sn", "sc", "sl", "sg", "sk", "si", "sb", "so", "za", "gs", "es", "lk", "sh", "kn", "pm", "vc", "sd", "sr", "sj", "sz", "se", "ch", "sy", "tw", "tj", "tz", "th", "tg", "tk", "to", "tt", "tn", "tr", "tm", "tc", "tv", "ug", "ua", "su", "ae", "gb", "um", "vi", "us", "uy", "uz", "vu", "va", "ve", "vn", "wf", "eh", "ye", "yu", "zr", "zm", "zw"];
  const axios = require('axios');
  var c = Math.floor(Math.random() * 11);
  const res = await axios.get('https://app.scrapingbee.com/api/v1', {
    params: {
      'api_key': process.env['SCRAPE_API_' + c],
      'url': 'https://www.dogusoto.com.tr/q3-f3b', 
      'wait_for': '.reserve.direct-link',
      'premium_proxy': 'true',
      'extract_rules': '{"list":{"selector":"a.item.direct-link","type":"list","output":"html"}}', 
      'country_code': countryList[(Math.random() * countryList.length) | 0]
    } 
  });

  const carArray = res.data.list;
  
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

    return avaibleDealers.toString();
  } else {

    const mailData = {
      from: process.env.MAILJET_MAIL,
      to: "phyesix@gmail.com",
      subject: `DOGUSOTO AUDI STOCK YOK`,
      text: "DOGUSOTO AUDI",
      html: `
        <div>
          <h1>DOGUSOTO AUDI STOCK</h1>
          <p>Stok halen yok.</p>
        </div>`
    };

    transporter.sendMail(mailData, function (err, info) {
      console.log("info", info);
      console.log("err", err)
    });

    return "BULUNAMADI"
  }
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
