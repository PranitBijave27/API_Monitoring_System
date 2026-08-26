const nodemailer = require("nodemailer");

let transporter;


async function getEmailTransporter() {
    if (transporter) {
        return transporter;
    }

    const testAccount =
        await nodemailer.createTestAccount();

    transporter =
        nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,

            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

    return transporter;
}


module.exports = {
    getEmailTransporter,
};