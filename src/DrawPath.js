import Parser from "./parse";
import Painter from "./paint";
import M from "$U/matrix";
import V from "$U/vector";
import { isArray, isString, notNull } from "$U";
const FRAME = window.requestAnimationFrame,
    CANCEL = window.cancelAnimationFrame;

class DrawPath {
    constructor(canvas, path) {
        this.datas = [];
        this.config = { times: 5 };
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        if (path) {
            this.setPath(path);
        }
        //变换
        this.transform = M.create();
    }

    getBoundary() {
        const datas = this.datas;
        let l = Infinity,
            r = -Infinity,
            t = Infinity,
            b = -Infinity,
            w = 0,
            h = 0,
            pd;
        datas.forEach(v => {
            pd = v.boundary;
            if (pd.r > r) {
                r = pd.r;
            }
            if (pd.l < l) {
                l = pd.l;
            }
            if (pd.b > b) {
                b = pd.b;
            }
            if (pd.t < t) {
                t = pd.t;
            };
        });
        w = r - l;
        h = b - t;
        return {
            l, r, t, b, w, h,
            cx: l + w / 2, cy: t + h / 2
        }
    }

    asCenter() {
        const canvas = this.canvas,
            sw = canvas.width,
            sh = canvas.height,
            transform = M.create(),
            { l, r, t, b, w, h, cx, cy } = this.getBoundary(),
            center = [cx, cy],
            scale = [sw / w, sh / h];
        M.scale(transform, transform, scale);
        V.applyTransform(center, center, transform);
        M.translate(transform, transform, [sw / 2 - center[0], sh / 2 - center[1]]);
        this.transform = transform;
    }

    clear() {
        const canvas = this.canvas,
            ctx = this.ctx;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return this;
    }

    stop() {
        CANCEL(this.frameId);
        return this;
    }

    setSplits(splits) {
        this.stop();
        const datas = this.datas;
        datas.forEach(path => {
            path.points = Parser.points(path.cmds, splits);
            path.runner = Painter.points(path.points);
        });
        return this;
    }

    setPath(pathInfo) {
        if (isString(pathInfo)) {
            pathInfo = [pathInfo];
        }
        if (isArray(pathInfo)) {
            this.stop();
            let datas = this.datas = [],
                data;
            pathInfo.forEach(path => {
                data = Parser.both(path);
                data.runner = Painter.points(data.points);
                datas.push(data);
            });
        }
        return this;
    }

    paintCmds() {
        this.stop();
        const ctx = this.ctx,
            datas = this.datas;
        ctx.save();
        ctx.transform(... this.transform);
        datas.forEach(v => Painter.cmds(ctx, v.cmds));
        ctx.restore();
        return this;
    }

    paintPoints() {
        this.stop();
        const ctx = this.ctx,
            datas = this.datas,
            times = this.config.times,
            running = new Set();
        datas.forEach(v => {
            running.add(v.runner);
        });

        let restart = true;
        const progresive = e => {
            ctx.save();
            ctx.transform(...this.transform);
            running.forEach(painter => {
                if (!painter(ctx, times, restart)) {
                    running.delete(painter);
                }
            });
            ctx.restore();
            if (running.size > 0) {
                this.frameId = FRAME(progresive.bind(this));
            }
            restart = false;
        }
        progresive();
    }
}
window.DrawPath = DrawPath;


