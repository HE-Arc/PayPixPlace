let pickers;
let currentSlot;
let selectCB;
let pixelLocked;

/**
 * Change the current slot
 * @param {int} id 
 */
function changeCurrentSlot(id) {
    currentSlot = id;
}

/**
 * Check if the color for the selected slot can be changed
 * @param {string} newColor 
 */
function changeSlotColor(newColor) {

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
            if(data.is_valid) {
                drawingColor = newColor;
                setCursor();
                applyChangeSlotColor(newColor);
            }
        }
    });
}

/**
 * Change the color for the selected slot and in the data base
 * @param {string} newColor 
 */
function applyChangeSlotColor(newColor) {
    
    let currentPicker = document.getElementsByClassName("picker" + currentSlot);
    
    for (let i = 0 ; i < pickers.length ; i++) {
        localPicker = pickers[i];

        for (let j = 0; j < localPicker.length; j++) {
            localPicker[j].classList.remove("ppp-picker-selected");
        }
    }

    for (let i = 0; i < currentPicker.length; i++) {
        currentPicker[i].style.backgroundColor = newColor;
        currentPicker[i].classList.add("ppp-picker-selected");
        currentPicker[i].addEventListener("click", function() {
            drawingColor = newColor;
            setCursor();
        }, false);
    }
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
    selectCB.checked = false;
    setCursor();
    $("#selectionToolbox").hide();
    selectedPixel = null;
    drawPixels();
}

/**
 * Locks a pixel in the canvas
 * @param {Integer} x 
 * @param {Integer} y 
 */
function lockPixel(x,y) {
    $.ajax({
        type: "POST",
        url: "/lock_pixel/",
        data: {
            canvas_id : canvasId,
            x : x,
            y : y
        },
        dataType: "json",
        success: function(data) {
            if (data.is_valid) {
                loadPixels();
                pixelLocked.checked = true;
                pixelLocked.disabled = true;
                displayInfos(x,y);
            }
        }
    });
}


// Execute when the page is fully loaded
$(document).ready(function(){
    
    drawingColor = colors[0];
    setCursor();
    pickers = []

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

    selectCB = document.getElementById("selectCB");
    selectCB.addEventListener("click", function() {
        isColoring = !this.checked;
        setCursor();
        $("#selectionToolbox").slideToggle();
        selectedPixel = null;
        cleanInfos();
        drawPixels();
    });
    selectedPixel = null;

    pixelLocked = document.getElementById("pixelLocked");
    pixelLocked.addEventListener("click", function() {
        if (selectedPixel && !this.disabled) {
            lockPixel(selectedPixel.x, selectedPixel.y);
        }
    });
});