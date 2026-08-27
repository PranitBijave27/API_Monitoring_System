const { getEmailTransporter, } = require("../config/email");
const nodemailer = require("nodemailer");

function formatTimestamp(date) {
    const utcDate = new Date(date);
    const formattedTime = new Intl.DateTimeFormat(navigator.language, {
        dateStyle: 'full',
        timeStyle: 'medium'
    }).format(utcDate);
    return formattedTime;
}

function formatDuration(startedAt, resolvedAt) {
    const totalSeconds = Math.floor(
        (new Date(resolvedAt) - new Date(startedAt)) / 1000
    );
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes === 0) {
        return `${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
}

function buildAlertHtml({
    accentColor,
    label,
    title,
    rows,
}) {
    const rowsHtml = rows
        .map(
            (row, index) => `
            <tr style="${index > 0 ? "border-top: 1px solid #e5e7eb;" : ""}">
                <td style="padding: 8px 0; color: #6b7280; width: 140px;">${row.label}</td>
                <td style="padding: 8px 0; font-weight: 500;">${row.value}</td>
            </tr>`
        )
        .join("");

    return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <div style="border-left: 4px solid ${accentColor}; padding: 16px 20px; background: #f9fafb; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; font-weight: 600; color: ${accentColor}; text-transform: uppercase; letter-spacing: 0.5px;">
                ${label}
            </p>
            <p style="margin: 6px 0 0; font-size: 18px; font-weight: 600;">
                ${title}
            </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            ${rowsHtml}
        </table>

        <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
            Automated alert from your API Dependency Monitor.
        </p>
    </div>`;
}

async function sendEmail({
    to,
    subject, text, html,
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

    const url = nodemailer.getTestMessageUrl(info);
    if (url) console.log(url);
    return info;
}

async function sendDependencyDownAlert({
    to,
    applicationName, dependencyName,
    monitorName, monitorUrl,
    failureReason, detectedAt,
}) {
    const detectedAtFormatted = formatTimestamp(detectedAt);

    return sendEmail({
        to,
        subject: `[DOWN] ${dependencyName} is not responding`,
        text: `
        ${dependencyName} is currently DOWN

        Application:     ${applicationName}
        Monitor:         ${monitorName}
        URL:             ${monitorUrl}
        Failure reason:  ${failureReason || "Unknown"}
        Detected at:     ${detectedAtFormatted}
        ---
        This is an automated alert from API Dependency Monitor.`.trim(),
        html: buildAlertHtml({
            accentColor: "#dc2626",
            label: "Dependency Down",
            title: dependencyName,
            rows: [
                { label: "Application", value: applicationName },
                { label: "Monitor", value: monitorName },
                { label: "URL", value: `<a href="${monitorUrl}" style="color: #2563eb; text-decoration: none;">${monitorUrl}</a>` },
                { label: "Failure reason", value: failureReason || "Unknown" },
                { label: "Detected at", value: detectedAtFormatted },
            ],
        }),
    });
}

async function sendDependencyRecoveredAlert({
    to,
    applicationName, dependencyName,
    monitorName, monitorUrl,
    startedAt, resolvedAt,
}) {
    const startedAtFormatted = formatTimestamp(startedAt);
    const resolvedAtFormatted = formatTimestamp(resolvedAt);
    const duration = formatDuration(startedAt, resolvedAt);

    return sendEmail({
        to,
        subject: `[RESOLVED] ${dependencyName} is back up`,
        text: `
        ${dependencyName} has recovered

        Application:      ${applicationName}
        Monitor:          ${monitorName}
        URL:              ${monitorUrl}
        Incident started: ${startedAtFormatted}
        Recovered at:     ${resolvedAtFormatted}
        Downtime:         ${duration}
        ---
        This is an automated alert from API Dependency Monitor.`.trim(),
        html: buildAlertHtml({
            accentColor: "#16a34a",
            label: "Dependency Recovered",
            title: dependencyName,
            rows: [
                { label: "Application", value: applicationName },
                { label: "Monitor", value: monitorName },
                { label: "URL", value: `<a href="${monitorUrl}" style="color: #2563eb; text-decoration: none;">${monitorUrl}</a>` },
                { label: "Incident started", value: startedAtFormatted },
                { label: "Recovered at", value: resolvedAtFormatted },
                { label: "Downtime", value: duration },
            ],
        }),
    });
}

module.exports = {
    sendEmail,
    sendDependencyDownAlert,
    sendDependencyRecoveredAlert,
};