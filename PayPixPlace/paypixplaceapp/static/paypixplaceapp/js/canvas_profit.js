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
    $.ajax({
        type: "POST",
        url: "/buy/9",
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

// document.getElementsByName("btn-close-profit").forEach(element => element.addEventListener("click", function(event) {
//     id = element.dataset.canvasId;
//     document.getElementsByName("checkbox_profit").forEach(checkbox => {
//         checkboxid = checkbox.dataset.canvasId;
//         if (id == checkboxid)
//             checkbox.checked = false;
//     });
// }));

$('[id^=confirm-enable-profit]').on("hide.bs.modal", function () {
    clicked_checkbox.checked = false;
});