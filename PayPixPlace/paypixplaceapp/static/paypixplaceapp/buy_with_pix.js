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