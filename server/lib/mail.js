// lib/mail.js
const Mailjet = require('node-mailjet')
  .apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET)

async function sendMail({ to, subject, html }) {
  await Mailjet
    .post("send", { version: "v3.1" })
    .request({
      Messages: [{
        From: {
          Email: process.env.DEFAULT_FROM_EMAIL,
          Name:  "TechQB"
        },
        To: [{
          Email: to
        }],
        Subject:  subject,
        HTMLPart: html 
      }]
    })
}

module.exports = { sendMail }
