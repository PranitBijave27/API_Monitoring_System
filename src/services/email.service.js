const { getEmailTransporter, } = require("../config/email");
const nodemailer = require("nodemailer");

async function sendEmail({
    to,
    subject,
    text,
    html,
}) {
    const transporter =
        await getEmailTransporter();
    const info =
        await transporter.sendMail({
            from: '"API Dependency Monitor" <monitor@example.com>',
            to,
            subject,
            text,
            html,
        });
    return info;
}

async function sendDependencyDownAlert({
    to,
    monitorId,
    failureReason,
}) {
    return sendEmail({
        to,
        subject: "Dependency is DOWN",

        text: `
            Dependency is DOWN.

            Monitor ID: ${monitorId}
            Failure reason: ${failureReason}
        `,
        html: `
            <h2>Dependency is DOWN </h2>
            <p>
                <strong>Monitor ID:</strong>
                ${monitorId}
            </p>
            <p>
                <strong>Failure reason:</strong>
                ${failureReason || "Unknown"}
            </p>
        `,
    });
}

async function sendDependencyRecoveredAlert({
    to,
    monitorId,
}) {
    return sendEmail({
        to,
        subject: "Dependency is RESOLVED",

        text: `
            Dependency has recovered.

            Monitor ID: ${monitorId}
        `,

        html: `
            <h2>Dependency is BACK UP </h2>
            <p>
                <strong>Monitor ID:</strong>
                ${monitorId}
            </p>
            <p>
                The dependency is responding successfully again.
            </p>
        `,
    });
}

module.exports = {
    sendEmail,
    sendDependencyDownAlert,
    sendDependencyRecoveredAlert,
}