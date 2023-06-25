const formatter = (date) => {
    let str = "";
    let ans = date.split(" ");
    let time = ans[1] || "";
    ans = ans[0].split("-");
    str += ans[1] + "-";
    str += ans[0] + "-";
    str += ans[2] + " ";
    str += time;
    return str;
}
const correctDate = (givenDate, n) => {
    const day = givenDate.getDate();
    const month = givenDate.getMonth() + 1;
    const year = givenDate.getFullYear();
    return new Date(`${month}-${day + n}-${year}`);
}

const makeIt = (str) => {
    let time = str.split(" ")[1];
    if (time.startsWith("24")) {
        time = `00:${time.split(":")[1]}`;
    }
    let date = str.split(" ")[0].split("-");
    let ans = date.map(e => {
        if (e.length == 1) {
            return "0" + e;
        } else {
            return e;
        }
    })
    let x = ans[0];
    ans[0] = ans[1];
    ans[1] = x;
    return ans.join("-") + " " + time;
}



module.exports = { formatter, correctDate, makeIt };