import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const emailUser = process.env.EMAIL_USER!;
const pass = process.env.EMAIL_PASSWORD!;

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: emailUser,
    pass: pass,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  const info = await transporter.sendMail({
    from: emailUser,
    to,
    subject,
    html,
  });

  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
};
