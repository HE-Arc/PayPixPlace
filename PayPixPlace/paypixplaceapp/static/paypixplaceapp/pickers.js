let pickers;
let currentSlot;

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

        }
    });
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


// Execute when the page is fully loaded
$(document).ready(function(){
    
    drawingColor = colors[0];

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
});