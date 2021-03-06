let canvas;
let ctx;
let pixels;
let scale;
let canvasWidth;
let displayGrid;
let hideProtected;
let pixelWidth;
let canMove;
let countMove;
let canvasContainer;
let pixelInfoDisplay;
let sidebarTrigger;
let isSidebarHidden;
let panZoomInstance;
let mainLoop;
let mouseLastPos;
let drawingColor;
let isColoring;
let selectedPixel;
let hideProtectedCB;
let lockImage;
let pausePanzoomCB;
let isNewSlotAcquired;
let mouseCord;

const CANVAS_PIXEL_WIDTH = 4000;

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
            if (data.pix != -1) {
                document.getElementById("userPix").innerHTML = data.pix;
            }
            canvasMouseMoveHover();
            if (selectedPixel) {
                displayInfos(selectedPixel.x,selectedPixel.y);
            }
        }
    });
}

/**
 * returns the pixel at the given position
 * @param {Integer} x 
 * @param {Integer} y 
 */
function getPixel(x,y) {
    return pixels.length > 0 ? pixels[x][y] : null;
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

            if (hideProtected && pixels[x][y].timeLeft > 0) {
                ctx.drawImage(
                    lockImage,
                    x * pixelWidth, 
                    y * pixelWidth, 
                    pixelWidth,
                    pixelWidth
                );
            }
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

    if (selectedPixel) {
        ctx.lineWidth = 5 / scale;
        ctx.strokeStyle = "black";
        ctx.strokeRect(
            selectedPixel.x * pixelWidth, 
            selectedPixel.y * pixelWidth, 
            pixelWidth, 
            pixelWidth
        );
    }

    canvas.style.border = 1 / scale + "px solid #AAAAAA";
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
 * @param {String} timeLeft : number of seconds of protection left
 */
function displayInfos(x,y) {
    let pixel = getPixel(x,y);
    for (let i = 0 ; i < pixelInfoDisplay.owner.length ; i++) {
        pixelInfoDisplay.owner[i].value = pixel.username;
    }
    for (let i = 0 ; i < pixelInfoDisplay.protected.length ; i++) {
        if (pixel.timeLeft <= 0) {
            protectedMsg = "Not protected";
            pixelLocked.removeClass("fa-lock");
            pixelLocked.addClass("fa-lock-open");
            lockModalButton.show();
        } else {
            protectedMsg = secondsToTime(pixel.timeLeft);
            pixelLocked.removeClass("fa-lock-open");
            pixelLocked.addClass("fa-lock");
            lockModalButton.hide();
        }
        pixelInfoDisplay.protected[i].value = protectedMsg;
    }
}

/**
 * Resets the info panel
 */
function cleanInfos() {
    for (let i = 0 ; i < pixelInfoDisplay.owner.length ; i++) {
        pixelInfoDisplay.owner[i].value = "";
    }
    for (let i = 0 ; i < pixelInfoDisplay.protected.length ; i++) {
        pixelLocked.checked = false;
        pixelLocked.enabled = true;
        pixelInfoDisplay.protected[i].value = "";
    }
}

/**
 * Transforms a integer of seconds into a HH:MM:SS format
 * @param {Integer} timeLeft 
 */
function secondsToTime(timeLeft) {
    return parseInt(timeLeft/3600) + ":" + parseInt(timeLeft/60)%60 + ":" + timeLeft%60;
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
    } else {
        mouseCord.innerHTML = "";
    }

    drawPixels();

    if (!isNaN(x) && !isNaN(y)) {
        mouseCord.innerHTML = "X : " + x + "<br>Y : " + y;
        ctx.lineWidth = 1 / scale;
        if (drawingColor && isColoring) {
            let c = hexToRgb(drawingColor);
            ctx.fillStyle = "rgba("+c.r+", "+c.g+", "+c.b+", 0.3)";
        } else {
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        }
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
    if (mouseLastPos){
        x = mouseLastPos.x;
        y = mouseLastPos.y;
    }
    if (drawingColor) {
        pixels[x][y].hex = drawingColor;
    }

    canvasMouseMoveHover();

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
                updateAmmo();
                notify(
                    "+1 PIX ! You were rewarded for placing a pixel on this canvas !",
                    "success"
                );

            } else {
                if (data.user_authenticated) {
                    if (data.pixel_locked) {
                        notify(
                            "Pixel protected, wait that protection time ends"
                        );

                    } else {
                        notify(
                            "Can't place pixel, next ammo in " + Math.round(timeRemaining) + " seconds"
                        );
                    }

                } else {
                    notify(
                        "You need to login before placing pixels"
                    );
                }
            }
        }
    });
}

/**
 * Use Notifiy library to display notifications
 * @param {String} text : text to display
 * @param {String} className : type of notif, error, success, warning, etc...
 */
function notify(text, className="error") {
    $.notify(
        text, 
        {
            className : className,
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

/**
 * Sets the cursor to be a paintbrush of the same color as the drawing color 
 */
function setCursor() {
    if (drawingColor != null && isColoring) {
        canvasContainer.style.cursor = "url(/cursor/"+drawingColor.replace("#","")+"), auto";
        canvas.style.cursor = "url(/cursor/"+drawingColor.replace("#","")+"), auto";
    } else {
        canvasContainer.style.cursor = "pointer";
        canvas.style.cursor = "pointer";
    }
}

/**
 * Resets the canvas position and scale
 */
function resetTransform() {
    let rectCanvas = canvas.getBoundingClientRect();
    let rectContainer = canvasContainer.getBoundingClientRect();
    
    scale = 0.1;
    panZoomInstance.zoomAbs(
        ((rectContainer.width) - rectCanvas.width*scale) / 2, // initial x position
        (rectContainer.height - rectCanvas.height*scale) / 2, // initial y position
        scale  // initial zoom 
    );
}

/**
 * Select the pixel below the mouse/Touch
 * @param {Event} event 
 */
function selectPixel(event) {
    let pos = getOffsetPosition(event, canvas);
    let x = parseInt((pos.x) / pixelWidth);
    let y = parseInt((pos.y) / pixelWidth);
    if (x < 0 || y < 0 || x > canvasWidth-1 || y > canvasWidth-1) {
        return;
    }
    if (mouseLastPos){
        x = mouseLastPos.x;
        y = mouseLastPos.y;
    }
    
    displayInfos(x, y);
    
    selectedPixel = {
        x : x,
        y : y
    }
    canvasMouseMoveHover();
}

/**
 * On mouseup of touchstart action 
 * @param {Event} event 
 */
function onPointerUp(event) {
    canMove = false;
    if (countMove <= 1) {
        if (isColoring) {
            fillPixel(event);
        } else {
            selectPixel(event);
        }
    }
}

/**
 * On mouseup or touchend action
 * @param {Event} event 
 */
function onPointerDown(event) {
    countMove = 0;
    canMove = true;
}

/**
 * On mouse or touch move action
 * @param {Event} event 
 */
function onPointerMove(event) {
    if (canMove) {
        countMove++;
    }
}

/**
 * Initialise all the events on the mouse and touch
 */
function initEvents() {

    // redraw the canvas when the mouse leaves the area
    canvas.addEventListener("mouseleave", function() {
        drawPixels();
        mouseCord.innerHTML = "";
        mouseLastPos = null;
    });
    
    // draw a pixel on right click, prevent the context menu 
    canvasContainer.addEventListener("contextmenu", preventDefault);
    
    // redraw the canvas when the mouse hovering, with the pixel below highlighted
    canvas.addEventListener("mousemove", canvasMouseMoveHover);
    
    //redraw the pixels when zoomed in or out
    canvas.addEventListener("wheel", drawPixels);

    
    // Mouse events
    canvas.addEventListener("mousedown", onPointerDown);
    canvas.addEventListener("mouseup", onPointerUp);
    canvasContainer.addEventListener("mousemove", onPointerMove);

    // Mobile events
    canvas.addEventListener("touchstart", onPointerDown);
    canvas.addEventListener("touchend", onPointerUp);
    canvasContainer.addEventListener("touchmove", onPointerMove);

    // Calculate the current scale and store it on zoom event
    panZoomInstance.on('zoom', function(e) {
        setTimeout(
            function() {
                let rectCanvas = canvas.getBoundingClientRect();
                scale = rectCanvas.width / CANVAS_PIXEL_WIDTH;
                
            }, 10
        );
    });

    hideProtectedCB.addEventListener("click", function() {
        hideProtected = this.checked;
        drawPixels();
    });

    pausePanzoomCB.addEventListener("click", function() {
        if (this.checked) {
            panZoomInstance.pause();
        } else {
            panZoomInstance.resume();
        }
    });

    // refresh the colors selector when the user buys new colors
    $("#buy-color-modal").on('hide.bs.modal', function(){
        $.ajax({
            type: "GET",
            url: "/colors/",
            dataType: "json",
            success: function (data) {
                try {
                    let elem = document.getElementById("color-picker-modal-inner");
                    let html = "";
                    for (let i=0 ; i < data.length ; i++) {
                        html += '<div class="ppp-color-case" style="background-color: ' + data[i] + ';" onclick="changeSlotColor(' + "'" + data[i] + "'" + ');"></div>\n';
                    }
                    elem.innerHTML = html;
                } catch(error) {
                }
            }
        });
        if (isNewSlotAcquired) {
            document.location.reload();
        }
    });
}

/**
 * Initialise the parameters of the page
 */
function initParams() {
    canvas  = document.getElementById("canvas");
    canvas.width = CANVAS_PIXEL_WIDTH;
    canvas.height = CANVAS_PIXEL_WIDTH;

    ctx = canvas.getContext("2d");

    isSidebarHidden = false;
    sidebarTrigger = document.getElementById("sidebarTrigger");
    
    canvasContainer = document.getElementById("canvasContainer");
    hideProtectedCB = document.getElementById("hideProtectedCB");
    hideProtectedCB.checked = false;

    pausePanzoomCB = document.getElementById("pausePanzoomCB");
    pausePanzoomCB.checked = false;

    lockImage = document.getElementById("lockImage");
    hideProtected = false;
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

    mouseLastPos = null;
    drawingColor = null;
    selecting = false;

    panZoomInstance = panzoom(canvas, {
        maxZoom: 10,
        minZoom: 0.05,
        smoothScroll: false, // disable animation when moving
        zoomDoubleClickSpeed: 1 // disable doubleclick zoom
    });
    
    displayGrid = false;
    canMove = false;
    countMove = 0;

    isColoring = true;

    isNewSlotAcquired = false;

    mouseCord = document.getElementById("mouseCord");
}

// Execute when the page is fully loaded
$(document).ready(function(){
    
    initParams();
    resetTransform();
    initEvents();
    setCursor();

    // display the grid when the checkbox is checked
    let showGridCBs = document.getElementsByClassName("showGridCB");
    for (let index = 0; index < showGridCBs.length; index++) {
        showGridCBs[index].checked = false;
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

    loadPixels();

    mainLoop = setInterval(function() {
        loadPixels();
    }, 4000)
});