const CONTINUE = 1,
    END = 0,
    painter = { cmds, points };
export default painter;

function cmds(ctx, cmds) {
    let p;
    ctx.beginPath();
    cmds.forEach(({ type, params }) => {
        p = params;
        switch (type) {
            case 'L':
                ctx.lineTo(p[0], p[1]);
                break;
            case 'M':
                ctx.moveTo(p[0], p[1]);
                break;
            case 'C':
                ctx.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
                break;
            case 'Q':
                ctx.quadraticCurveTo(p[0], p[1], p[2], p[3]);
                break;
            case 'A':
                const [
                    cx, cy,
                    rx, ry,
                    theta, dTheta,
                    psi, fs
                ] = p,
                    r = (rx > ry) ? rx : ry,
                    scaleX = (rx > ry) ? 1 : rx / ry,
                    scaleY = (rx > ry) ? ry / rx : 1;
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(psi);
                ctx.scale(scaleX, scaleY);
                ctx.arc(0, 0, r, theta, theta + dTheta, 1 - fs);
                ctx.restore();
                break;
            case 'Z':
                ctx.closePath();
                break;
        }
    });
    ctx.stroke();
}
function points(path) {
    let index = 0,
        length = path.length,
        lastEnd = [0, 0];

    let point;
    return function (ctx, times, restart) {
        if (restart) {
            index = 0;
            lastEnd = [0, 0];
        }
        for (let i = 0; i < times; i++) {
            if (index < length) {
                point = path[index];
                if (point.isMove) {
                    lastEnd = point;
                } else {
                    ctx.beginPath();
                    ctx.moveTo(lastEnd[0], lastEnd[1]);
                    ctx.lineTo(point[0], point[1]);
                    ctx.stroke();
                }
                lastEnd = point;
                index++;
            } else {
                index = 0;
                lastEnd = [0, 0];
                return END;
            }
        }
        return CONTINUE;
    }
}