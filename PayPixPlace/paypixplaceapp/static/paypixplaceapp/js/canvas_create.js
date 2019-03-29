$(document).ready(function () {
    if(userRole != "admin") {
        document.getElementById("div_id_place").className += " d-none";
    }
});