import { rightCurry } from "./index";

const pow2 = rightCurry(Math.pow, 2),
    pow3 = rightCurry(Math.pow, 3);

export { bezier1, bezier2, bezier3 };
/**
### 一阶贝塞尔（直线）
一阶贝赛尔曲线上的由两个点确定  P0 和P1,当t在0--->1区间上递增时，根据
此会得到多个点的坐标，其实这些的点就是一条直线上的点。

B(t) = P0 + (P1-P0)*t
B(t) = (1-t)P0 + tP1

### 二阶贝塞尔（曲线）二阶贝赛尔曲线由`3`个点确定，
它可以理解成是这样的一阶贝赛尔曲线：确定该`一阶贝赛尔曲线`的两个点是变化的。
这两个点（设分别为Pm,Pn）是怎样变化的呢，
这两个点又分别是(P0,P1)确定的`一阶贝赛尔曲线`和(P1,P2)确定的`一阶贝赛尔`曲线上的点。
于是有了2阶贝赛尔曲线的公式

Pm(t) = (1-t)P0 + tP1
Pn(t) = (1-t)P1 + tP2

B(t) = (1-t)Pm(t) + tPn(t) 
= (1-t)^2 P0 + 2(1-t)tP1+ t^2P2


### 三阶贝塞尔曲线
三阶贝塞尔曲线由`4`个点确定，它可以理解成这样的二阶贝塞尔曲线：确定该二阶贝赛尔曲线的三个点事变化的，
这三个点（Px,Py,Pz）是怎样变化的呢，这三个点分别是P0+P1/P1+P2/P2+P3的确定的一阶贝塞尔曲线上的点。
 */



/**
 * 一次贝塞尔,线段
 * p(t)=(1-t)p0 + t*p1
 */
function bezier1(p0, p1) {
    return t => (1 - t) * p0 + t * p1;
}
/**二次贝塞尔
 * p(t)=p0(1-t)^2 + 2t(1-t)p1 + p2(t^2) 
 */
function bezier2(p0, p1, p2) {
    return t => p0 * pow2(1 - t) + 2 * t * (1 - t) * p1 + p2 * pow2(t);
}
/**
 * 三次贝塞尔
 * p(t)=p0(1-t)^3 + 3tp1(1-t)^2 + 3p2(t^2)(1-t)+p3(t^3)
 */
function bezier3(p0, p1, p2, p3) {
    return t => p0 * pow3(1 - t) + 3 * t * p1 * pow2(1 - t) + 3 * p2 * pow2(t) * (1 - t) + p3 * pow3(t);
}

//二次贝塞尔曲线,定 曲线两端端点之间的中点为m  控制点为c  c与m的连线被曲线相交分割为长度相等的两条线段
function drawBerzier2ThrowPoint(ctx, startX, startY, endX, endY, pointX, pointY) {
    var middleX = startX + (endX - startX) / 2,
        middleY = startY + (endY - startY) / 2,
        ctrlX = pointX + pointX - middleX,
        ctrlY = pointY + pointY - middleY;
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
}

/**
 * 光滑贝塞尔
 * 如svg中T对应Q(二次) S对应C(三次)
 * 前一次的终点为起点,要绘制则需要求的控制点
 * 设C为控制点 P为端点
 * 二次:
 * 曲线连续光滑,则其连接处的点的值相等且导数相等,
 * 对应Q指令:B0(t) = (1-t)2P0 + 2(1-t)tC0 + t2P1
 * 对应T指令:B1(t) = (1-t)2P1 + 2(1-t)tC1 + t2P2 
 * 
 * 两个函数值和求导相等, B0(1)=B1(0)=P1且导数 B0'(1)=B0'(0)
 * T指令对应的控制点公式求得: C1=2P1-C0 
 * 
 * 三次同理:
 * B0(t) = (1-t)3P0 + 3(1-t)2tC0 + 3(1-t)t2C1 + t3P1
 * B1(t) = (1-t)3P1 + 3(1-t)2tC2 + 3(1-t)t2C3 + t3P2
 * 
 * B0'(t) = -3(1-t)2P0 + (-6(1-t)tC0) + 3(1-t)2C0 + (-3t2C1) + 3(1-t)tC1 + 3t2P1
        = 3(1-t)2(C0-P0) + 6(1-t)t(C1-C0) + 3t2(P1-C1)
 * B1'(t) = 3(1-t)2(C2-P1) + 6(1-t)t(C3-C2) + 3t2(P2-C3)
 * S指令对应的控制点公式求得: C2=2P1-C1 
 * 前一条曲线的最后一个控制点和终点决定下一段曲线的起点以及第一个控制点
 */


/**
 * 绘制一条部分贝塞尔二次曲线
 * @param  {Object} ctx canvas渲染上下文
 * @param  {Array<number>} p0 起点
 * @param  {Array<number>} p2 终点
 * @param  {number} curveness 曲度(0-1)
 * @param  {number} percent 绘制百分比(0-100)
 */
function drawCurvePath(ctx, p0, p2, curveness, percent) {
    var p1 = [
        (p0[0] + p2[0]) / 2 - (p0[1] - p2[1]) * curveness,
        (p0[1] + p2[1]) / 2 - (p2[0] - p0[0]) * curveness
    ],
        t = percent / 100,
        v01 = [
            p1[0] - p0[0],
            p1[1] - p0[1]
        ],     // 向量<p0, p1>
        v12 = [
            p2[0] - p1[0],
            p2[1] - p1[1]
        ],     // 向量<p1, p2>
        q0 = [
            p0[0] + v01[0] * t,
            p0[1] + v01[1] * t
        ],
        q1 = [
            p1[0] + v12[0] * t,
            p1[1] + v12[1] * t
        ],
        v = [
            q1[0] - q0[0],
            q1[1] - q0[1]
        ],       // 向量<q0, q1>
        b = [
            q0[0] + v[0] * t,
            q0[1] + v[1] * t
        ];

    ctx.moveTo(p0[0], p0[1]);
    ctx.quadraticCurveTo(
        q0[0], q0[1],
        b[0], b[1]
    );
}

//二次贝塞尔曲线,定 曲线两端端点之间的中点为m  控制点为c  c与m的连线被曲线相交分割为长度相等的两条线段
function drawBerzier2ThrowPoint(startX, startY, endX, endY, pointX, pointY) {
    var middleX = startX + (endX - startX) / 2,
        middleY = startY + (endY - startY) / 2,
        ctrlX = pointX + pointX - middleX,
        ctrlY = pointY + pointY - middleY;
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
}