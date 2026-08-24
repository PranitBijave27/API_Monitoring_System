const pool = require("../config/db");
const bcrypt = require("bcrypt");


async function createMember(
    organizationId, name,
    email, password
) {
    const passwordHash = await bcrypt.hash(
        password,
        10
    );
    const query = `
        INSERT INTO users (
            organization_id,
            name,email,
            password_hash,
            role
        ) VALUES ($1, $2, $3, $4, 'MEMBER')
        RETURNING
            id,
            organization_id,
            name,email,
            role,
            created_at`;
    const values = [
        organizationId,
        name,
        email,
        passwordHash
    ];
    const result = await pool.query(
        query,
        values
    );
    return result.rows[0];
}

module.exports={
    createMember
}