const Mail = require('nodemailer');
// create reusable transporter object using the default SMTP transport
// let transporter = Mail.createTransport({
//   host: 'smtp.office365.com',
//   port: 587,
//   secure: false, // true for 465, false for other ports
//   auth: {
//       user: 'gaorock520@hotmail.com', // generated ethereal user
//       pass: 'highonde8521' // generated ethereal password
//   }
// });
let transporter = Mail.createTransport({
  host: 'smtp.exmail.qq.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
      user: 'noreply@mofaqua.com', // generated ethereal user
      pass: 'Punkhead8521' // generated ethereal password
  }
});
module.exports = async function (email, code) {
  // setup email data with unicode symbols
  let mailOptions = {
    from: '"魔法水族"noreply@mofaqua.com', // sender address
    // to: 'gaorock530@gmail.com, gaorock530@hotmail.com', // list of receivers
    to: email,
    subject: '提醒：<验证码>会在10分钟后过期', // Subject line
    // text: 'Hello world?', // plain text body
    html: `
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <style>
          body {
            position: relative;
            font-size: 16px;
            width: 100%;
            height: 100%;
          }
          div {
            position: fixed;
            margin: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 100%;
            text-align: left;
          }
          .code {
            padding: 5px 3px 3px 8px;
            border: 1px solid #000;
            font-weight: bold;
            border-radius: 5px; 
            margin-left: 3px;
            letter-spacing: 5px;
          }
        </style>
        <title>Document</title>
      </head>
      <body>
        <div>CODE:<span class="code">${code}</span></div>
      </body>
    </html>
    ` // html body
  };
  // send mail with defined transport object
  try {
    const res = await transporter.sendMail(mailOptions);
    // console.log(res);
    return res.messageId;
  }catch(e) {
    console.log(e);
    return false;
  }
}
