const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your Uno Nova account',
        html: `
      <h1>Welcome to Uno Nova!</h1>
      <p>Please click the link below to verify your email and start playing ranked matches:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

module.exports = {
    sendVerificationEmail
};
