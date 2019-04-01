canvas_id = 0;
clicked_checkbox = null;

function openModal(event) {
    canvas_id = event.currentTarget.dataset.canvasId;
    if(event.currentTarget.checked) {
        clicked_checkbox = event.currentTarget;
        $('#confirm-enable-profit').modal('show'); 
    }
}

document.getElementsByName("checkbox_profit").forEach(element => element.addEventListener ("change", openModal));

document.getElementsByName("btn-confirm-profit").forEach(element => element.addEventListener("click", function(event) {
    // When confirming the modal, send an ajax request to enable the profit on the canvas
    $.ajax({
        type: "POST",
        url: "/buy/9/",
        data: {
            csrfmiddlewaretoken: window.CSRF_TOKEN,
            canvas_id: canvas_id,
        },
        dataType: "json",
        success: function (data) {
            display_informations(data);
            if (data.TransactionSuccess)
            {
                clicked_checkbox.removeEventListener("change", openModal);
                clicked_checkbox.setAttribute('disabled', true);
                clicked_checkbox.checked = true;
            }
        }
    });
}));

$('[id^=confirm-enable-profit]').on("hide.bs.modal", function () {
    clicked_checkbox.checked = false;
});