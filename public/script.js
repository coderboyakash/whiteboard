let canvas = document.getElementById('canvas')

canvas.width = .80 * window.innerWidth
canvas.height = .75 * window.innerHeight

var socket = io.connect('localhost:3000')
let ctx = canvas.getContext('2d')

ctx.lineWidth = 5;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.strokeStyle = 'blue';
ctx.fillStyle = 'blue';
let x;
let y;
let mouseDown = false;

window.onmousedown = (e) => {
    ctx.moveTo(x, y)
    socket.emit('down', {x, y})
    mouseDown = true;
}
window.onmouseup = (e) => {
    mouseDown = false;
    socket.emit('mousedown', false)
}
window.onmousemove = (e) => {
    x = e.clientX;
    y = e.clientY;

    if(mouseDown){
        socket.emit('draw', {x, y})
        ctx.lineTo(x, y)
        ctx.stroke()
    }
}
socket.on('ondown', ({x, y}) => {
    ctx.moveTo(x, y)
})
socket.on('ondraw', ({x, y}) => {
    // console.log(x, y)
    ctx.lineTo(x, y)
    ctx.stroke()
})

function screenshot(){
    html2canvas(canvas).then(function(canvas) {
        // document.body.appendChild(canvas);
        document.getElementById("image").src= canvas.toDataURL();
   });
}