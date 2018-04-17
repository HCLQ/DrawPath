import { isString, isArray, isNumber } from "$U";
import CMD_Array from "./CMD_Array";
import CMD_Handlers from "./CMD_Handlers";
import CMD_Points from "./CMD_Points";
const DEFAULT_SPLITS = {
    L: 10,
    Q: 10,
    C: 10,
    A: 20,
    Z: 10
},
    parser = { both, points, cmds };

export default parser;

//获取路径详细信息,传入分段数则同时返回分段点集
function both(pathInfo, splits) {
    let cmds = [], points = [];
    if (isString(pathInfo)) {
        pathInfo = CMD_Array(pathInfo);
    }
    if (isArray(pathInfo)) {
        let cache = {
            start: [0, 0],
            end: [0, 0],
            preCmd: null
        },
            handler,
            parsed;
        splits = checkSplits(splits);
        pathInfo.forEach(cmd => {
            handler = CMD_Handlers[cmd.type];
            if (handler) {
                parsed = handler(cmd.params, cache);
                parsed.cmd = cmd;
                cmds.push(parsed);
                points = addPath(points, parsed, cache.preCmd, splits[parsed.type]);
                cache.preCmd = parsed;
            }
        });
        points._splits = splits;
    }
    return {
        points,
        cmds,
        boundary: getBoundRect(points)
    };
}
/**
 * 根据字符串解析出cmd参数
 * @param {String} cmds 
 */
function cmds(cmds) {
    let output = [];
    if (isString(cmds)) {
        cmds = CMD_Array(cmds);
    }
    if (isArray(cmds)) {
        let cache = {
            start: [0, 0],
            end: [0, 0],
            preCmd: null
        },
            usePoints = !(void 0 == splits),
            handler,
            parsed,
            points;
        cmds.forEach(cmd => {
            handler = CMD_Handlers[cmd.type];
            if (handler) {
                parsed = handler(cmd.params, cache);
                parsed.cmd = cmd;
                output.push(parsed);
                cache.preCmd = parsed;
            }
        });
    }
    return output;
}
/**
 * 根据解析过的命令参数获取分段点集
 * @param {Array} cmds 
 * @param {*} splits 
 */
function points(cmds, splits) {
    let lastCmd;
    splits = checkSplits(splits);
    return cmds.reduce(function (path, cmd) {
        path = addPath(path, cmd, lastCmd, splits[cmd.type]);
        lastCmd = cmd;
        return path;
    }, []);
}

function addPath(path, cmd, lastCmd, splits) {
    let points = CMD_Points(cmd, lastCmd, splits);
    if (cmd.type == "M") {
        points.isMove = 1;
        path.push(points);
    } else {
        //每条命令重复记录了头节点
        points.shift();
        path = path.concat(points);
    }
    return path;
}

function getBoundRect(points) {
    let l = Infinity,
        r = -Infinity,
        t = Infinity,
        b = -Infinity,
        w = 0,
        h = 0;
    points.forEach(v => {
        if (v[0] > r) {
            r = v[0];
        }
        if (v[0] < l) {
            l = v[0];
        }
        if (v[1] > b) {
            b = v[1];
        }
        if (v[1] < t) {
            t = v[1];
        };
    });
    w = r - l;
    h = b - t;
    return {
        l, r, t, b, w, h,
        cx: l + w / 2, cy: t + h / 2
    }
}
/**
 * 合并分段参数
 * @param {Number|Object} splits 
 */
function checkSplits(splits) {
    if (isNumber(splits)) {
        let output = {};
        for (let key of Object.keys(DEFAULT_SPLITS)) {
            output[key] = splits;
        }
        return output;
    }
    return Object.assign({}, DEFAULT_SPLITS, splits);
}