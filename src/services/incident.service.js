const pool = require("../config/db");

async function getIncidentsByMonitorId(monitorId) {
    const result = await pool.query(`
        SELECT
            id,
            monitor_id,
            status,
            started_at,
            detected_at,
            resolved_at,
            failure_reason,
            created_at
        FROM incidents
        WHERE monitor_id = $1
        ORDER BY detected_at DESC
        `, [monitorId]
    );

    return result.rows;
}

async function getIncidents(status) {
    let query = `
        SELECT
            id,
            monitor_id,
            status,
            started_at,
            detected_at,
            resolved_at,
            failure_reason,
            created_at
        FROM incidents`;

    const values = [];

    if (status) {
        query += ` WHERE status = $1`;

        values.push(status);
    }

    query += ` ORDER BY detected_at DESC`;

    const result = await pool.query(query, values);

    return result.rows;
}

module.exports = {
    getIncidentsByMonitorId,
    getIncidents
};