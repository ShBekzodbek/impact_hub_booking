module.exports = function (body) {
    if (!body.name || !body.type || !body.page || !body.page_size) {
        return false;
    }
    return true;
}