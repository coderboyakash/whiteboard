var socket = io.connect('localhost:3000')
	
var canvas = document.querySelector('#paint');
var ctx = canvas.getContext('2d');

var sketch = document.querySelector('#sketch');
// it return all the css applied to the sketch element
var sketch_style = getComputedStyle(sketch);

canvas.width = parseInt(sketch_style.getPropertyValue('width'));
canvas.height = parseInt(sketch_style.getPropertyValue('height'));


// Creating a tmp canvas
var tmp_canvas = document.createElement('canvas');
var tmp_ctx = tmp_canvas.getContext('2d');
tmp_canvas.id = 'tmp_canvas';
tmp_canvas.width = canvas.width;
tmp_canvas.height = canvas.height;
let mousedown = false;
socket.on('ondown', (data) => {
    console.log('mouse value', data);
    mousedown = data;
    if(data == false){
        tmp_canvas.removeEventListener('mousemove', onPaint, false);
    
        // Writing down to real canvas now
        ctx.drawImage(tmp_canvas, 0, 0);
        // Clearing tmp canvas
        tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
        
        // Emptying up Pencil Points
        ppts = [];
    }
})
tmp_canvas.onmousedown = (e) => {
    mousedown = true;
    socket.emit('down', (mousedown))
}
tmp_canvas.onmouseup = (e) => {
    mousedown = false;
    socket.emit('down', (mousedown))
}
sketch.appendChild(tmp_canvas);

var mouse = {x: 0, y: 0};
var last_mouse = {x: 0, y: 0};

// Pencil Points
var ppts = [];
socket.on('setMouseMove', ({x, y}) => {
    if(mousedown){
        ctx.drawImage(tmp_canvas, 0, 0);
        tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
        ppts = [];
        mouse.x = x;
        mouse.y = y;
        ppts.push({x: mouse.x, y: mouse.y});
        onPaint();
    }
})
socket.on('setMouseDown', ({x, y}) => {
    mouse.x = x;
    mouse.y = y;
    // tmp_canvas.addEventListener('mousemove', onPaint, false);
    ppts.push({x: mouse.x, y: mouse.y});
    onPaint();
})
/* Mouse Capturing Work */
tmp_canvas.addEventListener('mousemove', function(e) {
    mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
    mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
    socket.emit('mousemove', mouse)
}, false);
let pen_color = '#bd2e2e';

/* Drawing on Paint App */
tmp_ctx.lineWidth = document.getElementById('size_input').innerHTML`;
tmp_ctx.lineJoin = 'round';
tmp_ctx.lineCap = 'round';
tmp_ctx.strokeStyle = pen_color;
tmp_ctx.fillStyle = pen_color;

const changePenColor = (e) => {
    console.log(e.target.value);
    pen_color = e.target.value
    tmp_ctx.strokeStyle = pen_color;
    tmp_ctx.fillStyle = pen_color;
}
const changePenSize = (e) => {
    console.log(e.target.value);
    size = e.target.value
    tmp_ctx.lineWidth = size;
    document.getElementById('size').innerHTML = size
}

tmp_canvas.addEventListener('mousedown', function(e) {
    // console.log('down ');
    tmp_canvas.addEventListener('mousemove', onPaint, false);
    
    mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
    mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
    socket.emit('mousedown', mouse)
    
    ppts.push({x: mouse.x, y: mouse.y});
    
    onPaint();
}, false);

tmp_canvas.addEventListener('mouseup', function() {
    tmp_canvas.removeEventListener('mousemove', onPaint, false);
    
    // Writing down to real canvas now
    ctx.drawImage(tmp_canvas, 0, 0);
    // Clearing tmp canvas
    tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
    
    // Emptying up Pencil Points
    ppts = [];
}, false);

var onPaint = function() {
    // console.log('painting');
    
    // Saving all the points in an array
    ppts.push({x: mouse.x, y: mouse.y});
    // console.log(ppts);
    if (ppts.length < 3) {
        var b = ppts[0];
        tmp_ctx.beginPath();
        //ctx.moveTo(b.x, b.y);
        //ctx.lineTo(b.x+50, b.y+50);
        tmp_ctx.arc(b.x, b.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
        tmp_ctx.fill();
        tmp_ctx.closePath();
        
        return;
    }
    
    // Tmp canvas is always cleared up before drawing.
    // console.log('clear called', tmp_canvas.width, tmp_canvas.height);
    tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
    
    tmp_ctx.beginPath();
    tmp_ctx.moveTo(ppts[0].x, ppts[0].y);
    
    for (var i = 1; i < ppts.length - 2; i++) {
        var c = (ppts[i].x + ppts[i + 1].x) / 2;
        var d = (ppts[i].y + ppts[i + 1].y) / 2;
        // console.log(c, d);
        tmp_ctx.quadraticCurveTo(ppts[i].x, ppts[i].y, c, d);
    }
    
    // For the last 2 points
    // console.log('last two point', ppts[i].x, ppts[i].y);
    tmp_ctx.quadraticCurveTo(
        ppts[i].x,
        ppts[i].y,
        ppts[i + 1].x,
        ppts[i + 1].y
    );
    tmp_ctx.stroke();
    
};
	
