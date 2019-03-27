function openModal(event) {
    id = event.currentTarget.dataset.canvasId;
    if(event.currentTarget.checked) {
        $('#confirm-enable-profit-' + id).modal('show'); 
    }
}


document.getElementsByName("checkbox_profit").forEach(element => element.addEventListener ("change", openModal));

document.getElementsByName("btn-confirm-profit").forEach(element => element.addEventListener("click", function(event) {
    id = element.dataset.canvasId;
    $.ajax({
        type: "POST",
        url: "/buy/9",
        data: {
            csrfmiddlewaretoken: window.CSRF_TOKEN,
            canvas_id: id,
        },
        dataType: "json",
        success: function (data) {
            display_informations(data);
            if (data.TransactionSuccess)
            {
                document.getElementsByName("checkbox_profit").forEach(checkbox => {
                    checkboxid = checkbox.dataset.canvasId;
                    if (id == checkboxid)
                    {
                        checkbox.removeEventListener("change", openModal);
                        checkbox.setAttribute('disabled', true)
                    }
                });
            }
        }
    });
}));

document.getElementsByName("btn-close-profit").forEach(element => element.addEventListener("click", function(event) {
    id = element.dataset.canvasId;
    document.getElementsByName("checkbox_profit").forEach(checkbox => {
        checkboxid = checkbox.dataset.canvasId;
        if (id == checkboxid)
            checkbox.checked = false;
    });
}));