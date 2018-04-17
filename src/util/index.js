export {
    rightCurry,
    isArray,
    isString,
    isNumber,
    notNull,
    deffer
}

const vendors = ['ms', 'moz', 'webkit', 'o'];
for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] +
        'CancelRequestAnimationFrame'];
}
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (callback) => window.setTimeout(function () {
        callback();
    }, 1e3 / 30);
}
if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (id) => clearTimeout(id);
}


function rightCurry(fn, ...arr) {
    return (...arr2) => fn.apply(null, arr2.concat(arr));
}
function isNumber(v) {
    return "number" === typeof v;
}
function isArray(v) {
    return v instanceof Array;
}
function isString(v) {
    return "string" === typeof v;
}
function notNull(v) {
    return !(v === undefined || v === null || v === "");
}
function deffer() {
    let deffer = {};
    deffer.promise = new Promise(function (res, rej) {
        deffer.resolve = res;
        deffer.reject = rej;
    });
    return deffer;
}
