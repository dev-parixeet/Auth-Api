const nodemailer = require("nodemailer");
var transporter;

const connectMailTransport = () => {
    transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "parixeet9902@gmail.com",
          pass: "idif bwua xmcw pndf",
        },
    });
}


const sendMail = async (email, subject, text) => {
    const mailOptions = {
        to: email,
        from: "parixeet9902@gmail.com",
        subject: subject,
        html: text
    };
  
    await transporter.sendMail(mailOptions);
}

module.exports = {
    connectMailTransport,
    sendMail
}