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
    getDueMonitors,
};