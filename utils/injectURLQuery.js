exports.injectURLQuery = (url, queryObj) => {
    const keys = Object.keys(queryObj);

    let query = "";
    keys.forEach(key => {
        query += `${key}=${queryObj[key].trim()}&`;
    });

    return `${url}?${query}`;
};
