import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const emailUser = process.env.EMAIL_USER!;
const emailPsword = process.env.EMAIL_PASSWORD!;
const emailHost = process.env.EMAIL_HOST!;
const emailPort = parseInt(process.env.EMAIL_PORT!);

const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  auth: {
    user: emailUser,
    pass: emailPsword,
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
