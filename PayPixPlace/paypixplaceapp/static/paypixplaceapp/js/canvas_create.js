$(document).ready(function () {
    // Hide place selection from user form
    if(userRole != "admin") {
        document.getElementById("div_id_place").className += " d-none";
    }
});