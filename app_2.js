const express = require("express");
const cors = require("cors");
const app = express();

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

async function main() {
  const res = await fetch('https://stokarac.audi.com.tr/home/GetModelList4?time=' + Date.now(), {
    method: 'POST',
    body: JSON.stringify({
      modeldes: "Q3 35 Turbo FSI 150 hp Advanced S tronic",
      modelcode: "F3B"
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'Cache-Control': 'no-cache'
    }
  });
  return res
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
    subject: `AUDI STOCK`,
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


app.get('/', (req, res) => {
  main()
    .then((response) => response.json())
    .then((json) => {
      console.log("json", json);
      // res.json({ message: json });
      if(json.Data) {
        console.log("Sending mail...");
        res.json({ message: "STOCK COUNT: " + JSON.stringify(json.Data.length) });
        sendMail(json);
      } else {
        console.log(":(");
        res.json({ message: ":(" });
      }
    })
    .catch(err => {
      console.log(err);
      res.json({ message: "ERR " + err });
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})