const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

//prevents an idle client error crash
pool.on("error", (err, client) => {
    console.error("Unexpected error on idle database client:", err);
});
module.exports = pool;