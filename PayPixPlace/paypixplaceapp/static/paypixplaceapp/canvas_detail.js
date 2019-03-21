let canvas;
let ctx;
let pixels;
let canvasWidth;
let displayGrid;
let drawingColor;
let pickers;
let pixelWidth;
let currentSlot;
let canMove;
let hasMoved;
let canvasContainer;
let pixelInfoDisplay;
let sidebarTrigger;
let isSidebarHidden;
let pinchZoom;

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
 * Loaded as JSON
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

/**
 * returns the name of the owner of the pixel at the given position
 * @param {Integer} x 
 * @param {Integer} y 
 */
function getOwner(x,y) {
    return pixels[x][y].username;
}

/**
 * Draw the pixels on the canvas
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
                ctx.lineWidth = 1 / pinchZoom.scale;
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
    canvas.style.border = 2 / pinchZoom.scale + "px solid #AAAAAA";
}

/**
 * Sets the scale of the js canvas
 * @param {FLoat} x 
 * @param {Float} y 
 */
function setCanvasTranform(x=0,y=0) {
    canvas.style.transformOrigin = x + "px " + y + "px";
    let posCanvas = canvas.getBoundingClientRect()
    
    canvas.style.left = 0 + "px";
    canvas.style.top  = 0 + "px";
    //canvas.style.transform = "scale("+scale+")";

    canvas.style.left = posCanvas.left + "px";
    canvas.style.top  = posCanvas.top + "px";
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
        currentPicker[i].classList.add("ppp-picker-selected");
    }

    isColoring = true;
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
 * display new informations about the selected pixels
 * call without params to clear
 * @param {String} owner 
 * @param {String} protected 
 */
function displayInfos(owner="", protected="") {
    for (let i = 0 ; i < pixelInfoDisplay.owner.length ; i++) {
        pixelInfoDisplay.owner[i].value = owner;
    }
    for (let i = 0 ; i < pixelInfoDisplay.protected.length ; i++) {
        pixelInfoDisplay.protected[i].value = protected;
    }
}

/**
 * handle the click on the button for moving the canvas
 */
function clickMove() {
    isColoring = false;
    // TODO adapt style to be selected etc.. 
}

/**
 * code executed when the user moves the mouse above the canvas
 * @param {MouseEvent} event 
 */
function canvasMouseMoveHover(event) {
    let x = parseInt((event.offsetX) / pixelWidth);
    let y = parseInt((event.offsetY) / pixelWidth);
    x < 0 ? x = 0 : "";x > canvasWidth-1 ? x = canvasWidth-1 : "";
    y < 0 ? y = 0 : "";y > canvasWidth-1 ? y = canvasWidth-1 : "";

    drawPixels();
    ctx.lineWidth = 1 / pinchZoom.scale;
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
}

/**
 * get the OffsetX and offsetY of a click or touch inside an element
 * @param {Event} evt 
 * @param {DOMObject} target 
 */
function getOffsetPosition(evt, target){
    let position = {
        x: (evt.changedTouches) ? evt.changedTouches[0].pageX : evt.pageX,
        y: (evt.changedTouches) ? evt.changedTouches[0].pageY : evt.pageY
    };
    let rect = target.getBoundingClientRect();
    position.x -= rect.x;
    position.y -= rect.y;

    position.x /= pinchZoom.scale;
    position.y /= pinchZoom.scale;

    return position;
}

/**
 * action to fill a pixel (used to respond to events)
 * @param {Event} event 
 */
function fillPixel(event) {
    let pos = getOffsetPosition(event, canvas);
    let x = parseInt((pos.x) / pixelWidth);
    let y = parseInt((pos.y) / pixelWidth);
    if (x < 0 || y < 0 || x > canvasWidth-1 || y > canvasWidth-1) {
        return;
    }
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

/**
 * prevent the context menu from showing when exiting the canvas area with right click pressed
 */
function preventContextMenu() {
    function removeContextMenu(event) {
        document.removeEventListener("contextmenu", preventDefault, false);
        document.removeEventListener("contextmenu", removeContextMenu, false);
    }
    document.addEventListener("contextmenu", removeContextMenu, false);
}

function resetTransform() {
    let rectCanvas = canvas.getBoundingClientRect();
    let rectContainer = canvasContainer.getBoundingClientRect();
    pinchZoom.setTransform({
        scale: 0.1,
        x: (rectContainer.width - rectCanvas.width/10)/2,
        y: (rectContainer.height - rectCanvas.height/10)/4,
        // Fire a 'change' event if values are different to current values
        allowChangeEvent: true,
    });
}

/**
 * Initialise the parameters of the page
 */
function initParams() {
    canvas  = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    isSidebarHidden = false;
    sidebarTrigger = document.getElementById("sidebarTrigger");

    canvasContainer = document.getElementById("canvasContainer");
    pixelInfoDisplay = {
        owner : document.getElementsByClassName("pixelOwner"),
        protected : document.getElementsByClassName("pixelProtected"),
    }

    pixels = [];
    pickers = [];
    pinchZoom = document.querySelector(".pinch-zoom");
    displayGrid = false;
    canMove = false;
    hasMoved = false;
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

    pickerMove = document.getElementsByClassName("pickerMove");
    for (let i = 0; i < pickerMove.length; i++) {
        pickerMove[i].addEventListener("click", clickMove, false);
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

    sidebarTrigger.addEventListener('click', function() {
        isSidebarHidden = !isSidebarHidden;

        if(isSidebarHidden) {
            document.getElementById("sidebarTriggerOpen").hidden = true;
            document.getElementById("sidebarTriggerClose").hidden = false;
            document.getElementById("sidebarContainer").classList.add("ppp-sidebar-container-close");
            document.getElementById("downbarContainer").classList.add("ppp-downbar-container-open");
        } else {
            document.getElementById("sidebarTriggerOpen").hidden = false;
            document.getElementById("sidebarTriggerClose").hidden = true;
            document.getElementById("sidebarContainer").classList.remove("ppp-sidebar-container-close");
            document.getElementById("downbarContainer").classList.remove("ppp-downbar-container-open");
        }
    });

    resetTransform();
    window.addEventListener('resize', evt => {
        resetTransform();
    });

    
    // mouse left click on the canvas, to draw pixels
    canvas.addEventListener("mousedown", function(event) {
        hasMoved = false;
        canMove = true;
    }, false);
    
    canvas.addEventListener("mouseup", function(event) {
        canMove = false;
        if (!hasMoved) {
            fillPixel(event);
        }
    }, false);

    // mouse right click on the canvas container
    canvasContainer.addEventListener("mousedown", function(event){
        if (event.buttons == 2 || event.buttons == 3) {
            document.addEventListener("contextmenu", preventDefault, false);
        }
        hasMoved = false;
        canMove = true;
    }, false);
    
    // moves the canvas when the user is clicking
    canvasContainer.addEventListener("mousemove", function(event) {
        if (canMove) {
            hasMoved = true;
        }
    }, false);
    

    // prevent the opening of the context menu on the canvas container 
    canvasContainer.addEventListener("contextmenu", preventDefault, false);
    // mouse right click up on the document
    document.addEventListener("mouseup", function(event) {
        canMove = false;
        preventContextMenu();
    });


    // Mobile part
    canvas.addEventListener("touchstart", function(event){
        hasMoved = false;
        canMove = true;
    }, false);

    canvas.addEventListener("touchend", function(event){
        canMove = false;
        if (!hasMoved) {
            fillPixel(event);
        }
    }, false);
    
    canvasContainer.addEventListener("touchmove", function(event){
        if (canMove) {
            hasMoved = true;
        }
    }, false);

    document.addEventListener("touchend", function(event){
        canMove = false;
    }, false);


    // redraw the canvas when the mouse hovering, with the pixel below highlighted
    canvas.addEventListener("mousemove", canvasMouseMoveHover, false);
    
    // redraw the canvas when the mouse leaves the area
    canvas.addEventListener("mouseleave", function() {
        drawPixels();
        displayInfos();
    }, false);
    

    // send the csrf token before POST requests
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