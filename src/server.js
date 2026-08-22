require("dotenv").config();

const app = require("./app");
const pool = require("./config/db");
const { startMonitorScheduler, } = require("./scheduler/monitor.scheduler");

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        
        const result = await pool.query("SELECT NOW()");
        console.log("Database connected:", result.rows[0]);

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
        startMonitorScheduler();

    } catch (error) {
        console.error("Failed to connect to database a:", error.message);
        process.exit(1);
    }
}

startServer();