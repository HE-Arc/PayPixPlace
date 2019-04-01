function display_informations(data) {

    transactionState = data.TransactionSuccess ? "success" : "error";

    message = data.Result[1];
    if (data.TransactionSuccess) {

        let openUnlockModal = true;
        let unlockItem = document.getElementById("unlockItem");

        //Remove all child of unlockItem
        while (unlockItem.firstChild) {
            unlockItem.removeChild(unlockItem.firstChild);
        }

        switch (data.Result[0]) {
            case 0:
            case 2:
                unlockItem.appendChild(displayUnlockText("New color acquired!"));
                unlockItem.appendChild(displayUnlockItem(" ppp-unlock-item ppp-unlock-item-border mb-3", data.Result[2]));
                break;

            case 1:
                unlockItem.appendChild(displayUnlockText("New color pack acquired!"));
                for (let i = 0; i < data.Result[2].length; i++) {
                    const color = data.Result[2][i];

                    unlockItem.appendChild(displayUnlockItem(" ppp-unlock-item ppp-unlock-item-border mb-3", color));
                }
                break;

            case 3:
                unlockItem.appendChild(displayUnlockText("New color slot acquired!"));
                if (typeof isNewSlotAcquired !== "undefined") {
                    isNewSlotAcquired = true;
                }
                unlockItem.appendChild(displayUnlockItem(" ppp-unlock-item-icon mb-3 fas fa-palette", data.Result[2]));
                break;

            case 5:
                unlockItem.appendChild(displayUnlockText("Max ammo increased by one!"));
                unlockItem.appendChild(displayUnlockItem(" ppp-unlock-item-icon mb-3 fas fa-arrows-alt", data.Result[2]));
                break;

            case 6:
                unlockItem.appendChild(displayUnlockText("Refill time was reduced by 5 seconds!"));
                unlockItem.appendChild(displayUnlockItem(" ppp-unlock-item-icon mb-3 fas fa-hourglass-end", data.Result[2]));
                break;

            case 7:
                unlockItem.appendChild(displayUnlockText("One instant ammo added!"));
                unlockItem.appendChild(displayUnlockItem(" ppp-unlock-item-icon mb-3 fas fa-plus-circle", data.Result[2]));
                break;
            case 8:
            case 9:
                unlockItem.appendChild(displayUnlockText("You will now earn 10% of all the PIX spend on this canvas!"));
                unlockItem.appendChild(displayUnlockItem(" ppp-unlock-item-icon mb-3 fas fa-percent", data.Result[2]));
                break;
                
            default:
                break;
        }

        if(openUnlockModal) {
            $("#unlock-item-modal").modal();
        }
    }

    $.notify(
        message,
        {
            className : transactionState,
            // whether to hide the notification on click
            clickToHide: true,
            // whether to auto-hide the notification
            autoHide: true,
            // if autoHide, hide after milliseconds
            autoHideDelay: 4000,
            position: "top right",
            gap: 2
        }
    )
    document.getElementById("userPix").innerHTML = data.UserPix;
    updateAmmo();
}

function displayUnlockText(unlockText) {

    let para = document.createElement("p");
    let textPara = document.createTextNode(unlockText);
    para.appendChild(textPara);

    return para;
}

function displayUnlockItem(classes, data) {

    let node = document.createElement("div");
    node.className += classes;
    node.style.backgroundColor = data;

    return node;
}

$(document).ready(function() {

    //Source : https://stackoverflow.com/questions/19305821/multiple-modals-overlay
    //Exact code source : http://jsfiddle.net/CxdUQ/
    //Allows to have multiple modal open
    $(document).on('show.bs.modal', '.modal', function (event) {
        var zIndex = 1040 + (10 * $('.modal:visible').length);
        $(this).css('z-index', zIndex);
        setTimeout(function() {
            $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
        }, 0);
    });
    
    $('#unlock-item-modal').on('hidden.bs.modal', function () {
        if($('.modal:visible').length > 0) {
            $('body').addClass('modal-open');
        }
    });

    document.getElementById("btnFixColor").addEventListener("click", function(){
        // Ajax request to buy a fixed color
        $.ajax({
            type: "POST",
            url: "/buy/0/",
            data: {
                csrfmiddlewaretoken: window.CSRF_TOKEN,
                "hex": document.getElementById("fix_color").value,
            },
            dataType: "json",
            success: function (data) {
                display_informations(data);
            }
        });
    });

    document.getElementById("btnRandomColor").addEventListener("click", function(){
        // Ajax request to buy a random color
        $.ajax({
            type: "POST",
            url: "/buy/2/",
            data: {
                csrfmiddlewaretoken: window.CSRF_TOKEN,
            },
            dataType: "json",
            success: function (data) {
                display_informations(data);
            }
        });
    });

    document.getElementById("btnBuySlot").addEventListener("click", function(){
        // Ajax request to buy a slot
        $.ajax({
            type: "POST",
            url: "/buy/3/",
            data: {
                csrfmiddlewaretoken: window.CSRF_TOKEN,
            },
            dataType: "json",
            success: function (data) {
                display_informations(data);
            }
        });
    });

    document.getElementById("btnIncreaseMaxAmmo").addEventListener("click", function(){
        // Ajax request to increase the max ammo
        $.ajax({
            type: "POST",
            url: "/buy/5/",
            data: {
                csrfmiddlewaretoken: window.CSRF_TOKEN,
            },
            dataType: "json",
            success: function (data) {
                display_informations(data);
            }
        });
    });

    document.getElementById("btnReduceRefillTime").addEventListener("click", function(){
        // Ajax request to reduce the refill time
        $.ajax({
            type: "POST",
            url: "/buy/6/",
            data: {
                csrfmiddlewaretoken: window.CSRF_TOKEN,
            },
            dataType: "json",
            success: function (data) {
                display_informations(data);
            }
        });
    });

    document.getElementById("btnInstantAmmo").addEventListener("click", function(){
        // Ajax request to buy one ammo instantaneously
        $.ajax({
            type: "POST",
            url: "/buy/7/",
            data: {
                csrfmiddlewaretoken: window.CSRF_TOKEN,
            },
            dataType: "json",
            success: function (data) {
                display_informations(data);
            }
        });
    });

    document.getElementsByName("pack_form").forEach(element => element.addEventListener ("submit", function(event){
        // Ajax request to buy a color pack
        event.preventDefault();
        $.ajax({
            type: "POST",
            url: "/buy/1/",
            data: {
                csrfmiddlewaretoken: window.CSRF_TOKEN,
                pack_id: element.getElementsByClassName("pack_id")[0].value,
            },
            dataType: "json",
            success: function (data) {
                display_informations(data);
            }
        });
    }));
    
    $(function () {
        $('#fix_color_picker').colorpicker({
            inline: true,
            container: true,
            format: "hex",
            useAlpha: false
        });
    });

});

