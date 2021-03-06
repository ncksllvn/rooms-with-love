const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const parseMultipartForm = require('./parseMultipartForm');

const {
  MAILGUN_API_KEY: mailgunApiKey,
  MAILGUN_DOMAIN: mailgunDomain,
  EMAIL_RECIPIENTS: emailRecipients,
  EMAIL_BCC: emailBcc
} = process.env;

const transporter = nodemailer.createTransport(
  mg({
    auth: {
      api_key: mailgunApiKey,
      domain: mailgunDomain
    },
  })
);

const mailTemplate = {
  to: emailRecipients.split(','),
  bcc: emailBcc,
  from: `RoomsWithLoveNKY Website<noreply@${mailgunDomain}>`,
  subject: 'Pickup request'
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "Method Not Allowed" };
  }

  const fields = await parseMultipartForm(event);

  const messageBody = `
    Name:
    ${fields.name}

    Address:
    ${fields.address}

    Phone number:
    ${fields.phone}

    Email:
    ${fields.email}

    Message:
    ${fields.message}
  `;

  const mail = {
    ...mailTemplate,
    text: messageBody
  };

  if (fields.picture) {
    mail.attachments = [fields.picture];
  }

  const info = await transporter.sendMail(mail);

  return {
    statusCode: 200,
    body: info.message
  };
};
