let canvas;
let ctx;
let pixels;
let canvasWidth;
let scale;
let displayGrid;
let drawingColor;
let pickers;
let pixelWidth;
let currentSlot;
let isMoving;
let offset;
let canvasContainer;
let pixelInfoDisplay;

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
    let currentPicker = document.getElementsByClassName("picker" + currentSlot);

    for (let i = 0; i < currentPicker.length; i++) {
        currentPicker[i].style.backgroundColor = newColor;
        currentPicker[i].addEventListener("click", function() {
            drawingColor = newColor;
        }, false);
    }
    
    drawingColor = newColor;

    $.ajax({
        type: "POST",
        url: "/change_user_slot_color/",
        data: {
            slot: currentSlot, 
            color: newColor, 
            userId: userId
        },
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
            canvasWidth = data.canvas.width;
            pixelWidth = 4000 / canvasWidth;
            drawPixels();
        }
    });
}

function getOwner(x,y) {
    return pixels[x][y].username;
}

/**
 * Draw the pixels on the screen
 */
function drawPixels() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let x = 0 ; x < pixels.length ; x++) {
        for (let y = 0 ; y < pixels[x].length ; y++) {
            ctx.fillStyle = pixels[x][y].hex;
            ctx.fillRect(
                x * pixelWidth, 
                y * pixelWidth, 
                pixelWidth,
                pixelWidth
            );    
        }
    }

    if (displayGrid) {
        for (let x = 0 ; x < pixels.length ; x++) {
            for (let y = 0 ; y < pixels[x].length ; y++) {
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
    canvas.style.border = 2 / scale + "px solid #AAAAAA";
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
    let currentPicker = document.getElementsByClassName("picker" + (id + 1));

    drawingColor = colors[id];
    
    for (let i = 0 ; i < pickers.length ; i++) {
        localPicker = pickers[i];

        for (let j = 0; j < localPicker.length; j++) {
            localPicker[j].classList.remove("ppp-picker-selected");
        }
    }
    
    for (let i = 0; i < currentPicker.length; i++) {
        currentPicker[i].classList.remove("ppp-picker-selected");
    }
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

function displayInfos(owner="", protected="") {
    for (let i = 0 ; i < pixelInfoDisplay.owner.length ; i++) {
        pixelInfoDisplay.owner[i].innerHTML = owner;
    }
    for (let i = 0 ; i < pixelInfoDisplay.protected.length ; i++) {
        pixelInfoDisplay.protected[i].innerHTML = protected;
    }
}

/**
 * Initialise the paramters of the page
 */
function initParams() {
    canvas  = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvasContainer = document.getElementById("canvasContainer");
    pixelInfoDisplay = {
        owner : document.getElementsByClassName("pixelOwner"),
        protected : document.getElementsByClassName("pixelProtected"),
    }

    pixels = [];
    pickers = [];
    scale = 0.1;
    displayGrid = false;
    isMoving = false;
    canvas.style.position = "absolute";
    canvas.style.transformOrigin = "0 0";
    drawingColor = colors[0];

    pickers.push(document.getElementsByClassName("picker1"));
    pickers.push(document.getElementsByClassName("picker2"));
    pickers.push(document.getElementsByClassName("picker3"));
    pickers.push(document.getElementsByClassName("picker4"));

    for (let i = 0 ; i < pickers.length ; i++) {
        currentPicker = pickers[i];

        for (let j = 0; j < currentPicker.length; j++) {
            currentPicker[j].style.backgroundColor = colors[i];
            currentPicker[j].addEventListener('click', function() {
                setDrawingColor(i);
            }, false);
        }
    }
}

// Execute when the page is fully loaded
$(document).ready(function(){
    
    initParams();
    
    // display the grid when the checkbox is checked
    let showGridCBs = document.getElementsByClassName("showGridCB");
    for (let index = 0; index < showGridCBs.length; index++) {
        showGridCBs[index].addEventListener("click", function(event) {
            displayGrid = this.checked;
            drawPixels();
        });
    }

    // prevent the opening of the context menu on the canvas container 
    canvasContainer.addEventListener("contextmenu", preventDefault, false);

    // mouse left click on the canvas, to draw pixels
    canvas.addEventListener("mousedown", function(event) {
        if (event.button == 0) {
            let x = parseInt((event.offsetX) / pixelWidth);
            let y = parseInt((event.offsetY) / pixelWidth);
        
            $.ajax({
                type: "POST",
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
    
    // mouse right click up on the document
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

    // mouse right click on the canvas container
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

    // moves the canvas when the user is clicking
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

    // redraw the canvas when the mouse hovering, with the pixel below highlighted
    canvas.addEventListener("mousemove", function(event) {
        let x = parseInt((event.offsetX) / pixelWidth);
        let y = parseInt((event.offsetY) / pixelWidth);
        x < 0 ? x = 0 : "";x > canvasWidth-1 ? x = canvasWidth-1 : "";
        y < 0 ? y = 0 : "";y > canvasWidth-1 ? y = canvasWidth-1 : "";

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
        ctx.strokeStyle = "rgba( 128, 128, 128, 0.5)";
        ctx.strokeRect(
            x * pixelWidth, 
            y * pixelWidth, 
            pixelWidth, 
            pixelWidth
        );
        let ownerName = getOwner(x,y);
        if (ownerName != null) {
            displayInfos(ownerName, "False");
        } else {
            displayInfos();
        }
    }, false);
    
    // redraw the canvas when the mouse leaves the area
    canvas.addEventListener("mouseleave", function() {
        drawPixels();
        displayInfos();
    }, false);
    
    // zoom on the canvas with the mouse wheel
    canvasContainer.addEventListener("wheel", function(e) {
        e.deltaY < 0 ? scale *= 1.2 : scale /= 1.2;
        setCanvasTranform();
        drawPixels();
        preventDefault(e);
    }, false);

    // send the csrf token for POST requests
    // source : https://docs.djangoproject.com/en/dev/ref/csrf/#ajax
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", window.CSRF_TOKEN);
            }
        }
    });

    loadPixels();
    setCanvasTranform();
});