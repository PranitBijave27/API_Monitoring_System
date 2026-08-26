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
        const url=nodemailer.getTestMessageUrl(info);
        console.log(url);
    return info;
}

async function sendDependencyDownAlert({
    to,
    applicationName,
    dependencyName,
    monitorName,
    monitorUrl,
    failureReason,
    detectedAt,
}) {
    return sendEmail({
        to,
        subject: `🚨 Dependency DOWN: ${dependencyName}`,
        text: `
        Dependency is DOWN
        Application: ${applicationName}
        Dependency: ${dependencyName}
        Monitor: ${monitorName}
        URL: ${monitorUrl}
        Failure reason: ${failureReason || "Unknown"}
        Detected at: ${detectedAt}`,

        html: `
            <h2>🚨 Dependency is DOWN</h2>
            <p><strong>Application:</strong> ${applicationName}</p>
            <p><strong>Dependency:</strong> ${dependencyName}</p>
            <p><strong>Monitor:</strong> ${monitorName}</p>
            <p><strong>URL:</strong> ${monitorUrl}</p>
            <p>
                <strong>Failure reason:</strong>
                ${failureReason || "Unknown"}
            </p>
            <p><strong>Detected at:</strong> ${detectedAt}</p>`,
    });
}

async function sendDependencyRecoveredAlert({
    to,
    applicationName,
    dependencyName,
    monitorName,
    monitorUrl,
    startedAt,
    resolvedAt,
}) {
    const startTime = new Date(startedAt);
    const endTime = new Date(resolvedAt);

    const durationInSeconds = Math.floor(
        (endTime - startTime) / 1000
    );
    const minutes = Math.floor(
        durationInSeconds / 60
    );
    const seconds = durationInSeconds % 60;
    const duration =
        `${minutes} minutes ${seconds} seconds`;
    return sendEmail({
        to,
        subject: `✅ Dependency Recovered: ${dependencyName}`,
        text: `
            Dependency has recovered
            Application: ${applicationName}
            Dependency: ${dependencyName}
            Monitor: ${monitorName}
            URL: ${monitorUrl}
            Incident started: ${startedAt}
            Recovered at: ${resolvedAt}
            Incident duration: ${duration}`,

        html: `
            <h2>✅ Dependency has recovered</h2>
            <p><strong>Application:</strong> ${applicationName}</p>
            <p><strong>Dependency:</strong> ${dependencyName}</p>
            <p><strong>Monitor:</strong> ${monitorName}</p>
            <p><strong>URL:</strong> ${monitorUrl}</p>
            <p><strong>Incident started:</strong> ${startedAt}</p>
            <p><strong>Recovered at:</strong> ${resolvedAt}</p>
            <p>
                <strong>Incident duration:</strong>
                ${duration}
            </p>
        `,
    });
}

module.exports = {
    sendEmail,
    sendDependencyDownAlert,
    sendDependencyRecoveredAlert,
}