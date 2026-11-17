import nodemailer from "nodemailer";

const sendOTPEmail = async (email, otp) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Check credentials
  if (!user || !pass) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing in .env");
  }

  // Create transporter after environment variables are loaded
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: `"OTP Verification" <${user}>`,
    to: email,
    subject: "Your OTP Verification Code",
    html: `
      <div style="font-family:Arial;padding:25px">
        <h2>Verify Your Email</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing:10px;color:#635bff">${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      </div>
    `,
  });
};

export default sendOTPEmail;