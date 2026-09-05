const pool = require("../config/db");
const { calculateApplicationStatus ,calculateDependencyStatus} = require("./application.service");
const { getMonitorsByDependencyId } = require("./monitor.service");

async function createDependency(applicationId, name, type, provider) {
    const query = `
    INSERT INTO dependencies (
      application_id,
      name,
      type,
      provider
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

    const values = [
        applicationId,
        name,
        type,
        provider,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
}

async function getDependenciesByApplicationId(applicationId) {
    const query = `
    SELECT *
    FROM dependencies
    WHERE application_id = $1
    ORDER BY created_at DESC
  `;

    const result = await pool.query(query, [applicationId]);

    const dependencies = await Promise.all(
        result.rows.map(async (dependency) => {
            const monitors =
                await getMonitorsByDependencyId(
                    dependency.id
                );

            const status = calculateDependencyStatus(monitors);

            return {
                ...dependency,
                status,
            };
        })
    );

    return dependencies;
}

async function getDependencyById(
    dependencyId,
    organizationId
) {
    const query = `
      SELECT d.*
        FROM dependencies d
        JOIN applications a
            ON d.application_id = a.id
        WHERE d.id = $1
        AND a.organization_id = $2 `;

    const result = await pool.query(query, [dependencyId, organizationId]);

    return result.rows[0];
}
module.exports = {
    createDependency,
    getDependenciesByApplicationId,
    getDependencyById,
}; 
