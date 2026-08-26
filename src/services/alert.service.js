const pool = require("../config/db");

async function getAlertRecipientsByMonitorId(monitorId) {
    const query = `
        SELECT
            u.email
        FROM monitors m
        JOIN dependencies d
            ON m.dependency_id = d.id
        JOIN applications a
            ON d.application_id = a.id
        JOIN users u
            ON u.organization_id = a.organization_id
        WHERE m.id = $1
        AND u.role = 'ADMIN'
    `;

    const result = await pool.query(
        query,
        [monitorId]
    );
    return result.rows.map((user) => user.email);
}


async function getAlertDetailsByMonitorId(monitorId) {
    const query = `
        SELECT
            m.id AS monitor_id,
            m.name AS monitor_name,
            m.url AS monitor_url,
            d.name AS dependency_name,
            a.name AS application_name
        FROM monitors m
        JOIN dependencies d
            ON m.dependency_id = d.id
        JOIN applications a
            ON d.application_id = a.id
        WHERE m.id = $1
    `;

    const result = await pool.query(
        query,
        [monitorId]
    );

    return result.rows[0];
}


module.exports = {
    getAlertDetailsByMonitorId,
    getAlertRecipientsByMonitorId,
};