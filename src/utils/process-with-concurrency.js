async function processWithConcurrency(
    items, limit,
    handler
) {
    let currentIndex = 0;

    async function worker() {
        while (true) {
            const index = currentIndex++;
            if (index >= items.length) return;

            await handler(items[index]);
        }
    }

    const workers = Array.from({
        length: Math.min(limit, items.length),
    }, () => worker()
    );
    await Promise.all(workers);
}

module.exports = {
    processWithConcurrency,
};