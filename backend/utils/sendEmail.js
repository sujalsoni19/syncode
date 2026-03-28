import { getTransporter } from "./emailTransporter.js";

export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();

  const mailOptions = {
    from: `"example" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);

  return info;
};
