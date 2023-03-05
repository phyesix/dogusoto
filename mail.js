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
    from: process.env.MAILJET_MAIL,
    to: "phyesix@gmail.com",
    subject: `AUDI STOK`,
    text: data.Message[0],
    html: `
      <div>
          <h1>AUDI STOK</h1>
          <p>${JSON.stringify(data)}</div>
      </div>`
  };
  console.log("mailData", mailData);
  transporter.sendMail(mailData, function (err, info) {
      console.log("info", info);
      console.log("err", err)
  });
}

main()
  .then((response) => response.json())
  .then((json) => {
    console.log("json", json);
    if(!json.Data) {
      sendMail(json)
    }
  })
  .catch(err => {
    console.log(err)
  })