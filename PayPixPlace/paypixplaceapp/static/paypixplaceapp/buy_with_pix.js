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
                console.log(data);
                document.getElementById("userPix").innerHTML = data.UserPix;
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
                console.log(data);
                document.getElementById("userPix").innerHTML = data.UserPix;
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
                console.log(data);
                document.getElementById("userPix").innerHTML = data.UserPix;
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
                console.log(data);
                document.getElementById("userPix").innerHTML = data.UserPix;
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

