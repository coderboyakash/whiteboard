var socket = io.connect('localhost:3000')
	
var canvas = document.querySelector('#paint');
var ctx = canvas.getContext('2d');

var sketch = document.querySelector('#sketch');
// it return all the css applied to the sketch element
var sketch_style = getComputedStyle(sketch);
let user_id = "2";
let socket_id = null;
socket.on('connect', ()=>{
    // socket.emit('addUser', ({socket_id:socket.id, publisher_id:1, subscriber_id:2}))
    socket.emit('add_connections', ({socket_id:socket.id, user_id:user_id}))
    socket_id = socket.id
    document.getElementById('socket_id').innerHTML = socket_id
})

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
        tmp_canvas.addEventListener('mousemove', onPaint, false);
        tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
        mouse.x = x;
        mouse.y = y;
        onPaint();
    }
})
socket.on('setMouseDown', ({x, y}) => {
    mouse.x = x;
    mouse.y = y;
    ppts.push({x: mouse.x, y: mouse.y});
    onPaint();
})
/* Mouse Capturing Work */
tmp_canvas.addEventListener('mousemove', function(e) {
    mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
    mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
    socket.emit('mousemove', mouse)
}, false);
let pen_color = document.getElementById('pen_color').value;

/* Drawing on Paint App */
tmp_ctx.lineWidth = document.getElementById('pen_input').value;
tmp_ctx.lineJoin = 'round';
tmp_ctx.lineCap = 'round';
tmp_ctx.strokeStyle = pen_color;
tmp_ctx.fillStyle = pen_color;

const activateEraserMode = () => {
    back_color = document.getElementById('back_color').value
    size = document.getElementById('eraser_input').value
    canvas.backgroundColor = back_color
    tmp_ctx.strokeStyle = back_color;
    tmp_ctx.fillStyle = back_color;
    tmp_ctx.lineWidth = size;
    socket.emit('changePenColor', (back_color))
    socket.emit('changePenSize', (size))
}

const activateDrawMode = () => {
    pen_color = document.getElementById('pen_color').value
    size = document.getElementById('pen_input').value
    tmp_ctx.strokeStyle = pen_color;
    tmp_ctx.fillStyle = pen_color;
    tmp_ctx.lineWidth = size;
    socket.emit('changePenColor', (pen_color))
    socket.emit('changePenSize', (size))
}

const changeBackgroundColor = (e) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.backgroundColor = e.target.value
    socket.emit('changeBackgroundColor', (e.target.value))
    socket.emit('changePenColor', (e.target.value))
}
socket.on('setBackgroundColor', (color) => {
    canvas.style.backgroundColor = color
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})
socket.on('clearBoard', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})

const clearBoard = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clearBoardListen')
}

const changePenColor = (e) => {
    // console.log(e.target.value);
    pen_color = e.target.value
    tmp_ctx.strokeStyle = pen_color;
    tmp_ctx.fillStyle = pen_color;
    socket.emit('changePenColor', (pen_color))
    document.getElementById('pensize').innerHTML = size
    socket.emit('changePenSize', (size))
}
const changePenSize = (e) => {
    console.log(e.target.value);
    size = e.target.value
    tmp_ctx.lineWidth = size;
    document.getElementById('pensize').innerHTML = size
    socket.emit('changePenSize', (size))
}
socket.on('setPenSize', (size) => {
    tmp_ctx.lineWidth = size;
})

const changeEraserSize = (e) => {
    console.log(e.target.value);
    size = e.target.value
    tmp_ctx.lineWidth = size;
    document.getElementById('erasersize').innerHTML = size
    socket.emit('changePenSize', (size))
}

tmp_canvas.addEventListener('mousedown', function(e) {
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
    // Saving all the points in an array
    ppts.push({x: mouse.x, y: mouse.y});
    if (ppts.length < 3) {
        var b = ppts[0];
        tmp_ctx.beginPath();
        tmp_ctx.arc(b.x, b.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
        tmp_ctx.fill();
        tmp_ctx.closePath();
        
        return;
    }
    
    // Tmp canvas is always cleared up before drawing.
    tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
    
    tmp_ctx.beginPath();
    tmp_ctx.moveTo(ppts[0].x, ppts[0].y);
    
    for (var i = 1; i < ppts.length - 2; i++) {
        var c = (ppts[i].x + ppts[i + 1].x) / 2;
        var d = (ppts[i].y + ppts[i + 1].y) / 2;
        tmp_ctx.quadraticCurveTo(ppts[i].x, ppts[i].y, c, d);
    }
    
    // For the last 2 points
    tmp_ctx.quadraticCurveTo(
        ppts[i].x,
        ppts[i].y,
        ppts[i + 1].x,
        ppts[i + 1].y
    );
    tmp_ctx.stroke();
    
};

socket.on('setPenColor', (color) => {
    // console.log(color)
    tmp_ctx.strokeStyle = color;
    tmp_ctx.fillStyle = color;
})
	
