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

async function getIncidents(status, organizationId) {
    let query = `
        SELECT
            i.id,
            i.monitor_id,
            i.status,
            i.started_at,
            i.detected_at,
            i.resolved_at,
            i.failure_reason,
            i.created_at
        FROM incidents i
        JOIN monitors m
            ON i.monitor_id = m.id
        JOIN dependencies d
            ON m.dependency_id = d.id
        JOIN applications a
            ON d.application_id = a.id
        WHERE a.organization_id = $1`;

    const values = [organizationId];

    if (status) {
        query += ` AND i.status = $2`;

        values.push(status);
    }

    query += ` ORDER BY i.detected_at DESC`;

    const result = await pool.query(query, values);

    return result.rows;
}

module.exports = {
    getIncidentsByMonitorId,
    getIncidents
};