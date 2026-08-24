const pool = require("../config/db");

async function getIncidentsByMonitorId(
    monitorId,
    status,
    limit,
    offset
) {
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
        FROM incidents
        WHERE monitor_id = $1`;
    const values = [monitorId];

    if (status) {
        query += ` AND status = $2`;
        values.push(status);
        query += ` ORDER BY detected_at DESC
            LIMIT $3
            OFFSET $4`;
        values.push(limit, offset);
    } else {
        query += ` ORDER BY detected_at DESC
            LIMIT $2
            OFFSET $3`;
        values.push(limit, offset);
    }

    const result = await pool.query(
        query,
        values
    );

    let countQuery = `
        SELECT COUNT(*)
        FROM incidents
        WHERE monitor_id = $1`;

    const countValues = [monitorId];

    if (status) {
        countQuery += ` AND status = $2`;
        countValues.push(status);
    }

    const countResult = await pool.query(
        countQuery,
        countValues
    );

    return {
        incidents: result.rows,
        total: Number(countResult.rows[0].count),
    };

}

async function getIncidents(
    status,
    organizationId,
    limit,
    offset

) {
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
        query += ` ORDER BY i.detected_at DESC
            LIMIT $3
            OFFSET $4`;
        values.push(limit, offset);
    } else {
        query += ` ORDER BY i.detected_at DESC
            LIMIT $2
            OFFSET $3`;

        values.push(limit, offset);
    }

    const result = await pool.query(
        query,
        values
    );

    let countQuery = `
        SELECT COUNT(*)
        FROM incidents i
        JOIN monitors m
            ON i.monitor_id = m.id
        JOIN dependencies d
            ON m.dependency_id = d.id
        JOIN applications a
            ON d.application_id = a.id
        WHERE a.organization_id = $1`;

    const countValues = [organizationId];

    if (status) {
        countQuery += ` AND i.status = $2`;
        countValues.push(status);
    }

    const countResult = await pool.query(
        countQuery,
        countValues
    );

    return {
        incidents: result.rows,
        total: Number(countResult.rows[0].count),
    };
}

module.exports = {
    getIncidentsByMonitorId,
    getIncidents
};