let canvas;
let ctx;
let pixels;
let scale;
let displayGrid;
let drawingColor;
let pickers;
let pixelWidth;
let currentSlot;
let isMoving;
let offset;
let canvasContainer;

/**
 * Change the current slot
 * @param {int} id 
 */
function changeCurrentSlot(id) {
    currentSlot = id;
}

/**
 * Change the color for the selected slot and in the data base
 * @param {string} newColor 
 */
function changeSlotColor(newColor) {
    let currentPicker = document.getElementById("picker" + currentSlot);

    currentPicker.style.backgroundColor = newColor;
    currentPicker.addEventListener("click", function() {
        drawingColor = newColor;
    }, false);
    
    drawingColor = newColor;

    $.ajax({
        type: "POST",
        url: "/change_user_slot_color/",
        data: {slot: currentSlot, color: newColor, userId: userId, csrfmiddlewaretoken: window.CSRF_TOKEN},
        dataType: "json",
        success: function(data) {
            console.log(data)
        }
    });
}

/**
 * Loads the pixels of the actual canvas from the database
 * Load as JSON
 */
function loadPixels() {
    // Load pixels from database
    $.ajax({
        type: "GET",
        url: "/canvas/" + canvasId + "/json/",
        dataType: "json",
        success: function (data) {
            pixels = data.pixels;
            pixelWidth = 4000 / data.canvas.width;
            drawPixels();
        }
    });
}

/**
 * Draw the pixels on the screen
 */
function drawPixels() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0 ; i < pixels.length ; i++) {
        let x = pixels[i].x;
        let y = pixels[i].y;
        let hex = pixels[i].hex;

        ctx.fillStyle = hex;
        ctx.fillRect(
            x * pixelWidth, 
            y * pixelWidth, 
            pixelWidth,
            pixelWidth
        );
    }
    if (displayGrid) {
        for (let i = 0 ; i < pixels.length ; i++) {
            let x = pixels[i].x;
            let y = pixels[i].y;
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

/**
 * Sets the scale of the js canvas
 */
function setCanvasTranform() {
    canvas.style.transform = "scale("+scale+")";
}

/**
 * Sets the current drawing color
 * @param {Integer} id
 */
function setDrawingColor(id) {
    drawingColor = colors[id];
}

/**
 * Transforms a Hex color in rgb format
 * @param {String} hex : example: #FFFFFF 
 */
function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * function used to prevent the default action on an event
 */
function preventDefault(event) {
    event.preventDefault();
}

/**
 * Initialise the paramters of the page
 */
function initParams() {
    pixels = [];
    scale = 0.1;
    displayGrid = false;
    drawingColor = "#FF0000";
    isMoving = false;
    canvas.style.position = "absolute";
    canvas.style.transformOrigin = "0 0";
}

// Execute when the page is fully loaded
$(document).ready(function(){
    canvas  = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvasContainer = document.getElementById("canvasContainer");

    document.getElementById("showGridCB").addEventListener("click", function(event) {
        displayGrid = this.checked;
        drawPixels();
    });

    canvasContainer.addEventListener("contextmenu", preventDefault, false);

    canvas.addEventListener("mousedown", function(event) {
        if (event.button == 0) {
            let x = parseInt((event.offsetX) / pixelWidth);
            let y = parseInt((event.offsetY) / pixelWidth);
        
            $.ajax({
                type: "GET",
                url: "/change_pixel_color/",
                data: {
                    "canvas_id": canvasId,
                    "x": x,
                    "y": y,
                    "hex": drawingColor,
                },
                dataType: "json",
                success: function (data) {
                    if (data.is_valid) {
                        loadPixels();
                    }
                }
            });
        }
    }, false);
    
    document.addEventListener("mouseup", function(event) {
        if (event.button == 2) {
            isMoving = false;
            function removeContextMenu(event) {
                document.removeEventListener("contextmenu", preventDefault, false);
                document.removeEventListener("contextmenu", removeContextMenu, false);
            }
            document.addEventListener("contextmenu", removeContextMenu, false);
        }
    });

    canvasContainer.addEventListener("mousedown", function(event){
        if (event.button == 2) {
            document.addEventListener("contextmenu", preventDefault, false);
            isMoving = true;
            offset =  {
                "x" : canvas.offsetLeft - event.clientX,
                "y" : canvas.offsetTop - event.clientY
            };
        }
    }, false);

    canvasContainer.addEventListener("mousemove", function(event) {
        if (isMoving) {
            mousePosition = {

                x : event.clientX,
                y : event.clientY
    
            };
            canvas.style.left = (mousePosition.x + offset.x) + "px";
            canvas.style.top  = (mousePosition.y + offset.y) + "px";
        }
    }, false);

    canvas.addEventListener("mousemove", function(event) {
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
    
    canvasContainer.addEventListener("wheel", function(e) {
        e.deltaY < 0 ? scale *= 1.2 : scale /= 1.2;
        setCanvasTranform();
        e.preventDefault();
    }, false);

    initParams();

    loadPixels();
    setCanvasTranform();
});