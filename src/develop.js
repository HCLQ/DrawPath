import DrawPath from "./DrawPath";
import M from "$U/matrix";
import V from "$U/vector";
const canvas = document.getElementById("test"),
    ctx = canvas.getContext('2d'),
    svgMap = require("../map.json"),
    svgArc = require("../arc.json"),
    $A = new DrawPath(canvas),
    times = document.getElementById("times"),
    pathArea = document.getElementById("paths"),
    restart = document.getElementById("restart"),
    paintMode = document.getElementById("paintMode"),
    splits = document.getElementById("splits");
let path = svgArc,
    isPathChanged = true,
    mode = "points";

path = svgMap;
canvas.addEventListener("click", e => console.info(e.offsetX, e.offsetY));
restart.addEventListener("click", e => drawCanvas());
splits.addEventListener("input", function (e) {
    $A.setSplits(Number(this.value));
});
times.addEventListener("input", function (e) {
    $A.config.times = Number(this.value);
});
pathArea.addEventListener("change", function () {
    isPathChanged = true;
    path = this.value;
});
paintMode.addEventListener("change", function () {
    mode = this.value;
})
times.value = $A.config.times;
splits.value = 5;
pathArea.value = path;

drawCanvas();
function drawCanvas() {
    $A.clear();
    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    if (isPathChanged) {
        $A.setPath(path);
        isPathChanged = false;
    }
    $A.asCenter();//自适应居中
    switch (mode) {
        case "points":
            $A.paintPoints();
            break;
        case "direct":
            $A.paintCmds();
            break;
    }
    ctx.restore();
    console.info($A);
}


function paintPoints(arr) {
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    arr.forEach(v => {
        ctx.fillText(v.toString(), v[0], v[1]);
        ctx.fillRect(v[0], v[1], 1, 1);
    });
}

//---------
