import { processArc } from "$U/arc";
const Handlers = {
    M: moveTo,
    L: lineTo,
    H: (params, cache) => lineTo([params[0], cache.end[1]], cache),//水平
    V: (params, cache) => lineTo([cache.end[0], params[0]], cache),//垂直
    Q: quadraticCurveTo, //二次贝塞尔
    T: smoothQuadraticCurveTo, //二次平滑贝塞尔
    C: bezierCurveTo,//三次贝塞尔
    S: smoothBezierCurveTo, //三次平滑贝塞尔
    A: arcTo,//弧线
    Z: closePath, //闭合曲线
    z: closePath,
    m: (params, cache) => offset(params, cache, "M"),
    l: (params, cache) => offset(params, cache, "L"),
    h: (params, cache) => offset([params[0], 0], cache, "L"),
    v: (params, cache) => offset([0, params[0]], cache, "L"),
    q: (params, cache) => offset(params, cache, "Q"),
    t: (params, cache) => offset(params, cache, "T"),
    c: (params, cache) => offset(params, cache, "C"),
    s: (params, cache) => offset(params, cache, "S"),
    a: (params, cache) => arcTo(
        params.slice(0, 6).concat(offsetPoints(params.slice(6), cache.end)),
        cache)
};
export default Handlers;

function moveTo(params, cache) {
    const start = params,
        end = params;
    cache.start =cache.end = end;
    return {
        type: "M",
        start, end,
        params
    }
}
function lineTo(params, cache) {
    const start = cache.end,
        end = params;
    cache.end = params;
    return {
        type: "L",
        start, end,
        params
    }
}
function quadraticCurveTo(params, cache) {
    const start = cache.end,
        end = params.slice(2, 4);
    cache.end = end;
    return {
        type: "Q",
        start, end,
        params
    }
}
function smoothQuadraticCurveTo(params, cache) {
    let preCmd = cache.preCmd,
        preParams,
        end = cache.end,
        [cX, cY] = end;
    //求控制点 C1=2P1-C0 
    if (preCmd && preCmd.type == "Q") {
        preParams = preCmd.params;
        cX = 2 * cX - preParams[0];
        cY = 2 * cY - preParams[1];
    }

    return quadraticCurveTo(
        [cX, cY, ...params],
        cache
    );
}

function bezierCurveTo(params, cache) {
    const start = cache.end,
        end = params.slice(4, 6);
    cache.end = end;
    return {
        type: "C",
        start, end,
        params
    }
}

function smoothBezierCurveTo(params, cache) {
    let preCmd = cache.preCmd,
        preParams,
        end = cache.end,
        [cX, cY] = end;
    //求控制点 c2=2p1-c1;
    if (preCmd && preCmd.type == "C") {
        preParams = preCmd.params;
        cX = 2 * cX - preParams[2];
        cY = 2 * cY - preParams[3];
    }

    return bezierCurveTo(
        [cX, cY, ...params],
        cache
    );
}

function closePath(params, cache) {
    const start = cache.end,
        end = cache.start;
    cache.end = end;
    return {
        type: "Z",
        start, end,
        params:end
    }
}
//A rx ry x-axis-rotation large-arc-flag sweep-flag x y
function arcTo(params, cache) {
    const start = cache.end,
        end = params.slice(5);
    params = processArc(...start.concat(params));
    cache.end = end;
    return {
        type: "A",
        start, end,
        params
    }
}
//----
/**
 * 转化小写cmd
 * @param {Array} params [x1,y1,x2,y2,.... ]
 * @param {Object} cache {end:[x1,y1],....}
 * @param {string} handler 对应cmd类型
 */
function offset(params, cache, handler) {
    const offseted = offsetPoints(params, cache.end);
    return Handlers[handler](offseted, cache);
}
/**
 * 将Points所有点相对offset位移
 * @param {Array} points [x1,y1,x2,y2,.... ]
 * @param {Array} offset [ox,oy]
 */
function offsetPoints(points, offset) {
    return points.map((v, i) => v + offset[i % 2]);
}