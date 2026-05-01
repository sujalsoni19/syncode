import nodemailer from "nodemailer";

let transporter;

export const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS upgrade
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Gmail App Password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return transporter;
};