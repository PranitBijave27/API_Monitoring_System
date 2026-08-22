
async function performHealthCheck(monitor) {
    const startTime = Date.now();

    try {
        const response = await fetch(monitor.url, {
            method: monitor.method,
            signal: AbortSignal.timeout(monitor.timeout_ms),
        });
        const responseTime = Date.now() - startTime;

        const isHealthy = response.status === monitor.expected_status_code;
        return {
            status: isHealthy ? "UP" : "DOWN",
            statusCode: response.status,
            responseTime,
            errorType: isHealthy
                ? null
                : "UNEXPECTED_STATUS",
        };

    } catch (error) {
        const responseTime = Date.now() - startTime;

        let errorType = "REQUEST_ERROR";

        if (error.name === "TimeoutError") errorType = "TIMEOUT";


        return {
            status: "DOWN",
            statusCode: null,
            responseTime,
            errorType,
        };
    }
}

module.exports = {
    performHealthCheck,
};