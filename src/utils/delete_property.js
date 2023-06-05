module.exports = (obj) => {
    for (let key in obj) {
        if (key == "books") {
            delete obj["books"];
            return obj;
        }
    }
    return -1;
}