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

export async function sendInviteEmail(
  to: string,
  token: string,
  companyName: string,
  inviterName: string,
): Promise<void> {
  const link = `${APP_URL}/accept-invite?token=${token}`;
  const transport = createTransport();

  if (!transport) {
    console.log(`[email] GMAIL credentials not set — invite link for ${to}: ${link}`);
    return;
  }

  await transport.sendMail({
    from: `"${companyName} via PayChamps" <${process.env.GMAIL_USER}>`,
    to,
    subject: `You've been invited to join ${companyName} on PayChamps`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff">
        <div style="margin-bottom:24px">
          <span style="font-size:20px;font-weight:700;color:#0d1b2a">Pay<span style="color:#22c55e">C</span>hamps</span>
        </div>
        <h2 style="margin:0 0 8px;font-size:22px;color:#0d1b2a">You've been invited!</h2>
        <p style="margin:0 0 6px;color:#555;font-size:15px;line-height:1.6">
          <strong>${inviterName}</strong> has invited you to join
          <strong>${companyName}</strong> on PayChamps — your new HR &amp; payroll portal.
        </p>
        <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.6">
          Click the button below to set up your account and access your payslips, leave requests, and more.
        </p>
        <a href="${link}"
           style="display:inline-block;background:#22c55e;color:#fff;font-weight:600;
                  font-size:15px;padding:13px 30px;border-radius:10px;text-decoration:none">
          Set up my account
        </a>
        <p style="margin:28px 0 0;color:#999;font-size:12px">
          This invite link expires in 7 days. If you weren't expecting this, you can safely ignore it.
        </p>
      </div>
    `,
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
