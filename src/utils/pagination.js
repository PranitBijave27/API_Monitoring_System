const AppError = require("./app-error");


function getPagination(query) {
    const {
        page = "1",
        limit = "20",
    } = query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
        throw new AppError("Page must be a positive integer", 400);
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
        throw new AppError("Limit must be an integer between 1 and 100", 400);
    }

    const offset = (pageNumber - 1) * limitNumber;

    return {
        page: pageNumber,
        limit: limitNumber,
        offset,
    };
}


module.exports = {
    getPagination,
};