import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

interface IMailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: IMailOptions) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  } as SMTPTransport.Options);

  const mailOptions = {
    from: 'Moyinoluwa Afolabi',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: '<b>Hello World?</b>',
  };

  await transporter.sendMail(mailOptions);
};
