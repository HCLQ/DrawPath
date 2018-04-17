import { bezier1, bezier2, bezier3 } from "$U/berzier";
import { arcFn } from "$U/arc";
import V from "$U/vector";

const point = V.create,
    Handler = {
        M: (start, params) => params,
        L: linear,
        Q: quadraticCurve,
        C: bezierCurve,
        A: arc,
        Z: linear
    };
export default function (cmd, preCmd, splits) {
    if (cmd && Handler[cmd.type]) {
        return Handler[cmd.type](preCmd && preCmd.end, cmd.params, splits);
    }
    return [];
}


function linear(start, end, len) {
    const [x0, y0] = start,
        [x1, y1] = end,
        points = [];

    let t = 0;
    //垂直
    if (x0 == x1) {
        const bY = bezier1(y0, y1);
        while (t <= len) {
            points.push(point(x0, bY(t / len)));
            t++;
        }
    } else {
        //斜率
        const k = (y1 - y0) / (x1 - x0),
            bX = bezier1(x0, x1);
        //y=k(x-x0)+y0
        let tempX, tempY;
        while (t <= len) {
            tempX = bX(t / len);
            tempY = k * (tempX - x0) + y0;
            points.push(point(tempX, tempY));
            t++;
        }
    }
    return points;
}
//二次贝塞尔
function quadraticCurve(start, params, len) {
    const [x0, y0] = start,
        [cx, cy, x1, y1] = params,
        points = [],
        bX = bezier2(x0, cx, x1),
        bY = bezier2(y0, cy, y1);
    let t = 0;
    while (t <= len) {
        points.push(point(bX(t / len), bY(t / len)));
        t++;
    }
    return points;
}

//三次贝塞尔
function bezierCurve(start, params, len) {
    const [x0, y0] = start,
        [cx1, cy1, cx2, cy2, x1, y1] = params,
        points = [],
        bX = bezier3(x0, cx1, cx2, x1),
        bY = bezier3(y0, cy1, cy2, y1);
    let t = 0;
    while (t <= len) {
        points.push(point(bX(t / len), bY(t / len)));
        t++;
    }
    return points;
}


//弧线
function arc(start, params, len) {
    const arcPoint = arcFn(params),
        points = [];
    let t = 0;
    while (t <= len) {
        points.push(arcPoint(t / len));
        t++;
    }
    return points;
}