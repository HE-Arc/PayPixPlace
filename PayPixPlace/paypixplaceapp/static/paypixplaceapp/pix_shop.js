function display_informations(data) {

    transactionState = data.TransactionSuccess ? "success" : "error";

    console.log(data);

    message = data.Result[1];
    if (data.TransactionSuccess) {

        let openUnlockModal = true;
        let unlockItem = document.getElementById("unlockItem");
        let node;
        let para;
        let textPara;

        //Remove all child of unlockItem
        while (unlockItem.firstChild) {
            unlockItem.removeChild(unlockItem.firstChild);
        }

        switch (data.Result[0]) {
            case 0:
            case 2:

                para = document.createElement("p");
                textPara = document.createTextNode("New color acquired!");
                para.appendChild(textPara);

                unlockItem.appendChild(para);

                node = document.createElement("div");
                node.className += " ppp-unlock-item ppp-unlock-item-border mb-3";
                node.style.backgroundColor = data.Result[2];

                unlockItem.appendChild(node);
                break;

            case 1:

                para = document.createElement("p");
                textPara = document.createTextNode("New color pack acquired!");
                para.appendChild(textPara);

                unlockItem.appendChild(para);

                for (let i = 0; i < data.Result[2].length; i++) {
                    const color = data.Result[2][i];

                    node = document.createElement("div");
                    node.className += " ppp-unlock-item ppp-unlock-item-border mb-3";
                    node.style.backgroundColor = color;

                    unlockItem.appendChild(node);
                }
                break;

            case 3:

                para = document.createElement("p");
                textPara = document.createTextNode("New color slot acquired!");
                para.appendChild(textPara);

                unlockItem.appendChild(para);

                node = document.createElement("div");
                node.className += " ppp-unlock-item-icon mb-3 fas fa-palette";
                node.style.backgroundColor = data.Result[2];

                unlockItem.appendChild(node);
                break;

            case 5:

                para = document.createElement("p");
                textPara = document.createTextNode("Max ammo increased by one!");
                para.appendChild(textPara);

                unlockItem.appendChild(para);

                node = document.createElement("div");
                node.className += " ppp-unlock-item-icon mb-3 fas fa-arrows-alt";
                node.style.backgroundColor = data.Result[2];

                unlockItem.appendChild(node);
                break;

            case 6:

                para = document.createElement("p");
                textPara = document.createTextNode("Refill time was reduced by 5 seconds!");
                para.appendChild(textPara);

                unlockItem.appendChild(para);

                node = document.createElement("div");
                node.className += " ppp-unlock-item-icon mb-3 fas fa-hourglass-end";
                node.style.backgroundColor = data.Result[2];
                unlockItem.appendChild(node);
                break;

            case 7:

                para = document.createElement("p");
                textPara = document.createTextNode("Refill time was reduced by 5 seconds!");
                para.appendChild(textPara);

                unlockItem.appendChild(para);

                node = document.createElement("div");
                node.className += " ppp-unlock-item-icon mb-3 fas fa-plus-circle";
                node.style.backgroundColor = data.Result[2];
                unlockItem.appendChild(node);
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
    document.getElementById("userAmmo").innerHTML = data.Ammo;
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
    })

    document.getElementById("btnFixColor").addEventListener("click", function(){
        $.ajax({
            type: "POST",
            url: "/buy/0",
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
        $.ajax({
            type: "POST",
            url: "/buy/2",
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
        $.ajax({
            type: "POST",
            url: "/buy/3",
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
        $.ajax({
            type: "POST",
            url: "/buy/5",
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
        $.ajax({
            type: "POST",
            url: "/buy/6",
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
        $.ajax({
            type: "POST",
            url: "/buy/7",
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
        event.preventDefault();
        $.ajax({
            type: "POST",
            url: "/buy/1",
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

