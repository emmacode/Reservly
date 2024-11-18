import { IEmailVerificationOptions } from '../types';
import { sendEmail } from './email';

export const sendVerificationEmail = async ({
  email,
  subject,
  message,
  verificationToken,
  req,
}: IEmailVerificationOptions) => {
  const verifyEmailURL = `${req.protocol}://${req.get('host')}/api/v1/accounts/verify-email/${verificationToken}`;
  const messager = `${message}: ${verifyEmailURL}`;

  await sendEmail({
    email,
    subject,
    message: messager,
  });
};
