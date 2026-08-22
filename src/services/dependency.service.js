const pool = require("../config/db");

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

    return result.rows;
}

async function getDependencyById(id) {
    const query = `
    SELECT *
    FROM dependencies
    WHERE id = $1
  `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
}
module.exports = {
    createDependency,
    getDependenciesByApplicationId,
    getDependencyById,
}; 
