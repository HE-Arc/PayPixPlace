let canvas;
let ctx;
let pixels;
let scale;
let displayGrid;
let drawingColor;
let pickers;
let colors;


function loadPixels() {
    // Load pixels from database
    $.ajax({
        type: 'GET',
        url: '/canvas/json',
        data: {
            'id': canvasId,
        },
        dataType: 'json',
        success: function (data) {
            pixels = JSON.parse(data);
            drawPixels();
        }
    });
}

function drawPixels() {
    // draw pixels on screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0 ; i < pixels.length ; i++) {
        let x = pixels[i].fields.x;
        let y = pixels[i].fields.y;
        let hex = pixels[i].fields.hex;

        ctx.fillStyle = hex;
        ctx.fillRect(
            x * pixelWidth, 
            y * pixelWidth, 
            pixelWidth,
            pixelWidth
        );
        
        if (displayGrid) {
            ctx.lineWidth = 1 / scale;
            ctx.strokeStyle = "rgba( 128, 128, 128, 0.1)";
            ctx.strokeRect(
                x * pixelWidth, 
                y * pixelWidth, 
                pixelWidth, 
                pixelWidth
            );
        }
    }
}

function setCanvasScale() {
    canvas.style.transform = "scale(" + scale + ")";
}

function setDrawingColor(id) {
    drawingColor = colors[id];
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function initParams() {
    pixels = [];
    scale = 0.1;
    displayGrid = false;
    drawingColor = "#FF0000";

    pickers = [
        document.getElementById("picker1"),
        document.getElementById("picker2"),
        document.getElementById("picker3")
    ];

    colors = [
        "#FF0000",
        "#00FF00",
        "#0000FF"
    ];

    for (let i = 0 ; i < pickers.length ; i++) {
        pickers[i].style.backgroundColor = colors[i];
        pickers[i].addEventListener('click', function() {
            setDrawingColor(i);
        }, false);
    }
}

$(document).ready(function(){
    canvas  = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.addEventListener('click', function(event) {
        let x = parseInt((event.offsetX) / pixelWidth);
        let y = parseInt((event.offsetY) / pixelWidth);
    
        $.ajax({
            type: 'GET',
            url: '/change_pixel_color/',
            data: {
                'canvas_id': canvasId,
                'x': x,
                'y': y,
                'hex': drawingColor,
            },
            dataType: 'json',
            success: function (data) {
                if (data.is_valid) {
                    loadPixels();
                }
            }
        });
    
    }, false);
    
    canvas.addEventListener("mousemove", function() {
        let x = parseInt((event.offsetX) / pixelWidth);
        let y = parseInt((event.offsetY) / pixelWidth);
        drawPixels();
        ctx.lineWidth = 1 / scale;
        let c = hexToRgb(drawingColor);
        ctx.fillStyle = "rgba("+c.r+", "+c.g+", "+c.b+", 0.3)";
        ctx.fillRect(
            x * pixelWidth, 
            y * pixelWidth, 
            pixelWidth,
            pixelWidth
        );
        ctx.strokeRect(
            x * pixelWidth, 
            y * pixelWidth, 
            pixelWidth, 
            pixelWidth
        );
    }, false);
    
    canvas.addEventListener("mouseleave", function() {
        drawPixels();
    }, false);
    
    canvas.addEventListener("wheel", function(e) {
        e.deltaY < 0 ? scale *= 1.2 : scale /= 1.2;
        setCanvasScale();
        e.preventDefault();
    }, false);

    initParams();

    loadPixels();
    setCanvasScale();
});