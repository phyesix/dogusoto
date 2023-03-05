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
  const res = await fetch('https://stokarac.audi.com.tr/home/GetModelList4', {
    method: 'POST',
    body: JSON.stringify({
      modeldes: "Q3 35 Turbo FSI 150 hp Advanced S tronic",
      modelcode: "F3B"
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    }
  });
  return res
}

async function sendMail(data) {
  const mailData = {
    from: "node@ibrahimnergiz.com",
    to: "contact@ibrahimnergiz.com",
    subject: `AUDI STOK`,
    text: data.Data,
    html: `
      <div>
          <h1>AUDI STOK</h1>
          <p>${data}</div>
      </div>`,
  };

  transporter.sendMail(mailData, function (err, info) {
      console.log("info", info);
      console.log("err", err)
  });
}

main()
  .then((response) => response.json())
  .then((json) => {
    if(json.Data) {
      sendMail(json)
    }
  })
  .catch(err => {
    console.log(err)
  })