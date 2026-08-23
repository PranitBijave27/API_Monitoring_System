const pool = require("../config/db");
const bcrypt = require("bcrypt");

async function registerOrganization(
    organizationName, name,
    email, password
) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const organizationResult = await client.query(`
            INSERT INTO organizations (name)
            VALUES ($1)
            RETURNING id, name`,
            [organizationName]
        );
        const organization = organizationResult.rows[0];
        const passwordHash = await bcrypt.hash(password, 10);
        const userResult = await client.query(`
            INSERT INTO users (
                organization_id,
                name,
                email,
                password_hash,
                role
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, email, role, organization_id`,
            [
                organization.id,
                name,
                email,
                passwordHash,
                "ADMIN"
            ]
        );
        const user = userResult.rows[0];

        await client.query("COMMIT");

        return {
            organization,
            user
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
}

module.exports = {
    registerOrganization
};