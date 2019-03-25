let canvas;
let ctx;
let pixels;
let scale;
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
let panZoomInstance;
let mainLoop;
let downloadButton;
let userPix;
let mouseLastPos;

const canvasPixelSize = 4000;

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
            userPix.innerHTML = data.pix;
            drawPixels();
            if (mouseLastPos) {

            }
        }
    });
}

/**
 * returns the name of the owner of the pixel at the given position
 * @param {Integer} x 
 * @param {Integer} y 
 */
function getOwner(x,y) {
    return pixels.length > 0 ? pixels[x][y].username : null;
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
 * code executed when the user moves the mouse above the canvas
 * @param {MouseEvent} event
 */
function canvasMouseMoveHover(event) {
    let x = undefined;
    let y = undefined;
    if (event) {
        x = parseInt((event.offsetX) / pixelWidth);
        y = parseInt((event.offsetY) / pixelWidth);
        x < 0 ? x = 0 : "";
        x > canvasWidth-1 ? x = canvasWidth-1 : "";
        y < 0 ? y = 0 : "";
        y > canvasWidth-1 ? y = canvasWidth-1 : "";
        mouseLastPos = {
            x : x,
            y : y
        }
    } else if (mouseLastPos){
        x = mouseLastPos.x;
        y = mouseLastPos.y;
    }

    drawPixels();
    if (x !=undefined && y != undefined) {
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

    position.x /= scale;
    position.y /= scale;

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
                updateAmmo();
                $.notify(
                    "+1 PIX ! You were rewarded for placing a pixel on this canvas !",
                    {
                        className : "success",
                        // whether to hide the notification on click
                        clickToHide: true,
                        // whether to auto-hide the notification
                        autoHide: true,
                        // if autoHide, hide after milliseconds
                        autoHideDelay: 4000,
                        position: "bottom right",
                        gap: 2
                    }
                )
            } else {
                $.notify(
                    "Can't place pixel, next ammo in " + Math.round(timeRemaining) + " seconds", 
                    {
                        // whether to hide the notification on click
                        clickToHide: true,
                        // whether to auto-hide the notification
                        autoHide: true,
                        // if autoHide, hide after milliseconds
                        autoHideDelay: 4000,
                        position: "bottom right",
                        gap: 2
                    }
                );
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
    
    scale = 0.1;
    panZoomInstance.zoomAbs(
        ((rectContainer.width-280) - rectCanvas.width*scale) / 2 + 280, // initial x position
        (rectContainer.height - rectCanvas.height*scale) / 2, // initial y position
        scale  // initial zoom 
    );
}

/**
 * Initialise all the events on the mouse and touch
 */
function initEvents() {

    // redraw the canvas when the mouse leaves the area
    canvas.addEventListener("mouseleave", function() {
        drawPixels();
        displayInfos();
        mouseLastPos = undefined;
    });
    
    // draw a pixel on right click, prevent the context menu 
    canvasContainer.addEventListener("contextmenu", preventDefault);
    
    // redraw the canvas when the mouse hovering, with the pixel below highlighted
    canvas.addEventListener("mousemove", canvasMouseMoveHover);
    
    //redraw the pixels when zoomed in or out
    canvas.addEventListener("wheel", drawPixels, false);
    
    // Mouse events
    canvas.addEventListener("mousedown", function(event){
        hasMoved = false;
        canMove = true;
    });
    canvas.addEventListener("mouseup", function(event){
        canMove = false;
        if (!hasMoved) {
            fillPixel(event);
        }
    });
    canvasContainer.addEventListener("mousemove", function(event){
        if (canMove) {
            hasMoved = true;
        }
    });

    // Mobile events
    canvas.addEventListener("touchstart", function(event){
        hasMoved = false;
        canMove = true;
    });
    canvas.addEventListener("touchend", function(event){
        canMove = false;
        if (!hasMoved) {
            fillPixel(event);
        }
    });
    canvasContainer.addEventListener("touchmove", function(event){
        if (canMove) {
            hasMoved = true;
        }
    });
    document.addEventListener("touchend", function(event){
        canMove = false;
    });

    // Calculate the current scale and store it on zoom event
    panZoomInstance.on('zoom', function(e) {
        setTimeout(
            function() {
                let rectCanvas = canvas.getBoundingClientRect();
                scale = rectCanvas.width / canvasPixelSize;
                
            }, 10
        );
    });

    downloadButton.addEventListener("click", function() {
        let link = document.createElement("a");
        link.download = canvasName;
        link.href = "/canvas/" + canvasId + "/img";
        link.click();
    });
}

/**
 * Initialise the parameters of the page
 */
function initParams() {
    canvas  = document.getElementById("canvas");
    canvas.width = canvasPixelSize;
    canvas.height = canvasPixelSize;
    ctx = canvas.getContext("2d");

    isSidebarHidden = false;
    sidebarTrigger = document.getElementById("sidebarTrigger");
    downloadButton = document.getElementById("downloadButton");
    userPix = document.getElementById("userPix");

    canvasContainer = document.getElementById("canvasContainer");
    pixelInfoDisplay = {
        owner : document.getElementsByClassName("pixelOwner"),
        protected : document.getElementsByClassName("pixelProtected"),
    }
    ammoInfos = {
        ammo: 3,
        maxAmmo: 3,
        reloadTime : 60,
        timeBeforeReload : 0
    }
    pixels = [];
    pickers = [];

    mouseLastPos = undefined;

    panZoomInstance = panzoom(canvas, {
        maxZoom: 10,
        minZoom: 0.05,
        smoothScroll: false, // disable animation when moving
        zoomDoubleClickSpeed: 1 // disable doubleclick zoom
    });
    
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
    resetTransform();
    initEvents();
    
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

    setInterval(function() {
        canvasMouseMoveHover();
    }, 4000)

    loadPixels();
});