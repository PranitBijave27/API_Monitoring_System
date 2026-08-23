const pool = require("../config/db");

async function createMonitor(dependencyId,
    {
        name,
        url,
        method,
        expectedStatusCode,
        checkIntervalSeconds,
        timeoutMs,
    }) {
    const query = `
    INSERT INTO monitors (
      dependency_id,
      name,
      url,
      method,
      expected_status_code,
      check_interval_seconds,
      timeout_ms
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

    const values = [
        dependencyId,
        name,
        url,
        method,
        expectedStatusCode,
        checkIntervalSeconds,
        timeoutMs,
    ];
    const result = await pool.query(query, values);

    return result.rows[0];
}

async function getMonitorsByDependencyId(dependencyId) {
    const query = `
    SELECT *
    FROM monitors
    WHERE dependency_id = $1
    ORDER BY created_at DESC
  `;

    const result = await pool.query(query, [dependencyId]);

    return result.rows;
}

async function getMonitorById(
    monitorId,
    organizationId
) {
    const query = `
        SELECT m.*
        FROM monitors m
        JOIN dependencies d
            ON m.dependency_id = d.id
        JOIN applications a
            ON d.application_id = a.id
        WHERE m.id = $1
        AND a.organization_id = $2
    `;

    const result = await pool.query(
        query,
        [monitorId, organizationId]
    );

    return result.rows[0];
}
async function getDueMonitors() {
    const query = `
    SELECT *
    FROM monitors
    WHERE is_active = TRUE
      AND (
        last_checked_at IS NULL
        OR
        last_checked_at + 
          (check_interval_seconds * INTERVAL '1 second')
          <= NOW()
      )
    ORDER BY last_checked_at ASC NULLS FIRST`;

    const result = await pool.query(query);

    return result.rows;
}

module.exports = {
    createMonitor,
    getMonitorsByDependencyId,
    getMonitorById,
    getDueMonitors,
};