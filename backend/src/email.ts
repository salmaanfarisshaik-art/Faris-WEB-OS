import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  }
})

export const sendApprovalEmail = async (to: string, name: string) => {
  await transporter.sendMail({
    from: `"Beast OS" <${process.env.GMAIL_USER}>`,
    to,
    subject: '⚡ Your Beast OS Account is Approved!',
    html: `
      <div style="font-family: monospace; background: #060810; color: #f0f4ff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #00ff88;">⚡ Beast OS</h1>
        <p>Hey ${name},</p>
        <p>Your account has been <strong style="color: #00ff88;">approved!</strong></p>
        <p>You can now login at: <a href="http://localhost:5173" style="color: #3b82f6;">Beast OS</a></p>
        <p style="color: #484f58; font-size: 12px;">Beast OS — Built for developers and security professionals</p>
      </div>
    `
  })
}

export const sendRejectionEmail = async (to: string, name: string) => {
  await transporter.sendMail({
    from: `"Beast OS" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Beast OS — Registration Update',
    html: `
      <div style="font-family: monospace; background: #060810; color: #f0f4ff; padding: 40px;">
        <h1 style="color: #00ff88;">⚡ Beast OS</h1>
        <p>Hey ${name},</p>
        <p>Unfortunately your registration request was not approved at this time.</p>
        <p style="color: #484f58; font-size: 12px;">Beast OS Team</p>
      </div>
    `
  })
}

export const sendNewRegistrationAlert = async (name: string, email: string) => {
  if (!process.env.ADMIN_EMAIL) return
  await transporter.sendMail({
    from: `"Beast OS" <${process.env.GMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: '🔔 New Beast OS Registration Request',
    html: `
      <div style="font-family: monospace; padding: 20px;">
        <h2>New Registration Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>Login to admin panel to approve or reject.</p>
      </div>
    `
  })
}