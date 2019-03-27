function display_informations(data)
{
    transactionState = data.TransactionSuccess ? "success" : "error";
    console.log(data);
    message = "";
    if (Array.isArray(data.Result))
    {
        message = data.Result;
    }
    else
    {
        message = data.Result;
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

