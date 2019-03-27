$(document).ready(function() {
    
    let btnFixColor = document.getElementById("btnFixColor");
    let btnRandomColor = document.getElementById("btnRandomColor");
    let packForm = document.getElementsByName("pack_form");
    
    btnFixColor.addEventListener("click", function(){
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

    btnRandomColor.addEventListener("click", function(){
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

    packForm.forEach(element => element.addEventListener ("submit", function(event){
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

