import nodemailer from 'nodemailer';

const APP_URL = process.env.APP_URL ?? 'https://paychamps.com';

function createTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${APP_URL}/verify-email?token=${token}`;
  const transport = createTransport();

  if (!transport) {
    console.log(`[email] GMAIL_USER/GMAIL_APP_PASSWORD not set — verification link for ${to}: ${link}`);
    return;
  }

  await transport.sendMail({
    from: `"CHAMP HR" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Verify your CHAMP HR email',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px;font-size:22px;color:#0d1b2a">Verify your email</h2>
        <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6">
          Click the button below to verify your email address and finish setting up your
          CHAMP HR workspace.
        </p>
        <a href="${link}"
           style="display:inline-block;background:#22c55e;color:#fff;font-weight:600;
                  font-size:15px;padding:12px 28px;border-radius:10px;text-decoration:none">
          Verify email address
        </a>
        <p style="margin:24px 0 0;color:#999;font-size:12px">
          This link expires in 24 hours. If you didn't create a CHAMP HR account, ignore this email.
        </p>
      </div>
    `,
  });
}
