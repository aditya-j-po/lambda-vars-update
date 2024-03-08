const checkHasOwn = (p1, p2) => {
    if (!p1 || typeof p2 !== "string") return false;
    return Object.prototype.hasOwnProperty.call(p1, p2);
};
const reset = "\x1b[0m";

const coloredLog = {
    green: (text) => console.log("\x1b[32m" + text + reset),
    red: (text) => console.log("\x1b[31m" + text + reset),
    blue: (text) => console.log("\x1b[34m" + text + reset),
    yellow: (text) => console.log("\x1b[33m" + text + reset),
};

export { coloredLog, checkHasOwn };
