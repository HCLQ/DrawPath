import M from "$U/matrix";
import V from "$U/vector";
const mathSqrt = Math.sqrt,
    mathSin = Math.sin,
    mathCos = Math.cos,
    PI = Math.PI,
    PI2 = 2 * PI,
    //向量长度
    vMag = v => Math.sqrt(v[0] * v[0] + v[1] * v[1]),
    //
    vRatio = (u, v) => (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v)),
    vAngle = (u, v) => (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));

export { arcFn, processArc }

function arcFn(p) {
    const [
        cx, cy,//中心点
        rx, ry,//半径
        theta,//起始角度
        dTheta,//总增量
        psi, //旋转角度
        fs//0顺时针   1逆时针
    ] = p,
        r = (rx > ry) ? rx : ry,
        scaleX = (rx > ry) ? 1 : rx / ry,
        scaleY = (rx > ry) ? ry / rx : 1,
        transform = M.create();
    //获取3x2变换矩阵
    M.scale(transform, transform, [scaleX, scaleY]);
    M.rotate(transform, transform, -psi);
    M.translate(transform, transform, [cx, cy]);

    const pointOnArc = makeArcFn(r, theta, theta + dTheta, 1 - fs);
    //圆形和变换矩阵 合成弧形的百分比求坐标点函数
    return function (t) {
        const point = pointOnArc(t);
        return V.applyTransform(point, point, transform);
    }
}
//将圆的参数化为百分比求点函数
function makeArcFn(radius, sAngle, eAngle, dir) {
    let add = eAngle - sAngle;
    if (dir) {//1逆时针
        if (add > 0) {
            add = add - PI2;
        }
    } else {//0顺时针 
        if (add < 0) {
            add = PI2 + add;
        }
    }
    return t => OnCircle(sAngle + t * add, radius);
}
//获取以原点为圆心,半径为r 角度angle的点的坐标
function OnCircle(angle, r) {
    let x = r * mathCos(angle),
        y = r * mathSin(angle);
    return V.create(x, y);
}

//转化svg path元素中 A命令的参数为 可通过矩阵变化部分圆曲线实现的参数
function processArc(
    x1, y1, //起点
    rx, ry,  //x半径 y半径 
    psiDeg,   //旋转角度(正顺 负逆)
    fa, fs, //角度大小 弧线方向 取 [0,1]   large-arc-flag sweep-flag
    x2, y2//终点
) {
    //角度转化为弧度
    var psi = psiDeg * (PI / 180.0);
    var xp = mathCos(psi) * (x1 - x2) / 2.0
        + mathSin(psi) * (y1 - y2) / 2.0;
    var yp = -1 * mathSin(psi) * (x1 - x2) / 2.0
        + mathCos(psi) * (y1 - y2) / 2.0;

    var lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);

    if (lambda > 1) {
        rx *= mathSqrt(lambda);
        ry *= mathSqrt(lambda);
    }

    var f = (fa === fs ? -1 : 1)
        * mathSqrt((((rx * rx) * (ry * ry))
            - ((rx * rx) * (yp * yp))
            - ((ry * ry) * (xp * xp))) / ((rx * rx) * (yp * yp)
                + (ry * ry) * (xp * xp))
        ) || 0;

    var cxp = f * rx * yp / ry;
    var cyp = f * -ry * xp / rx;

    //圆心坐标
    var cx = (x1 + x2) / 2.0
        + mathCos(psi) * cxp
        - mathSin(psi) * cyp;
    var cy = (y1 + y2) / 2.0
        + mathSin(psi) * cxp
        + mathCos(psi) * cyp;

    //起点角
    var theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
    var u = [(xp - cxp) / rx, (yp - cyp) / ry];
    var v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
    //增加的角度
    var dTheta = vAngle(u, v);

    if (vRatio(u, v) <= -1) {
        dTheta = PI;
    }
    if (vRatio(u, v) >= 1) {
        dTheta = 0;
    }
    //逆时针
    if (fs === 0 && dTheta > 0) {
        dTheta = dTheta - 2 * PI;
    }
    //顺时针
    if (fs === 1 && dTheta < 0) {
        dTheta = dTheta + 2 * PI;
    }

    return [cx, cy, rx, ry, theta, dTheta, psi, fs];
}


//=========未用到
//已知两点和半径求圆心
function getCenter(x1, y1, x2, y2, R) {
    let c1 = (x2 * x2 - x1 * x1 + y2 * y2 - y1 * y1) / (2 * (x2 - x1)),
        c2 = (y2 - y1) / (x2 - x1),
        A = (c2 * c2 + 1),
        B = (2 * x1 * c2 - 2 * c1 * c2 - 2 * y1),
        C = x1 * x1 - 2 * x1 * c1 + c1 * c1 + y1 * y1 - R * R;
    let temp = Math.sqrt(B * B - 4 * A * C);
    y1 = (-B + temp) / (2 * A),
        y2 = (-B - temp) / (2 * A);
    return [
        [
            c1 - c2 * y1,
            y1
        ],
        [
            c1 - c2 * y2,
            y2
        ]
    ]
}