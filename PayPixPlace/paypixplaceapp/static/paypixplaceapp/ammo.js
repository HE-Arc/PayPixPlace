let userAmmoDisplay;
let ammoProgressbar;

/**
 * updates the ammo informations in the navBar
 * sets the progressBar
 */
function updateAmmo() {
    $.ajax({
        type: "GET",
        url: "/ammo/",
        dataType: "json",
        success: function (data) {
            userAmmoDisplay.innerHTML = data.ammo;
            ammoProgressbar.max = data.reloadTime;
            ammoProgressbar.value = data.reloadTime - data.timeBeforeReload;
            if (data.ammo == data.maxAmmo) {
                ammoProgressbar.value = 0;
            }
        }
    });
}

$(document).ready(function(){
    userAmmoDisplay = document.getElementById("userAmmo");
    ammoProgressbar = document.getElementById("ammoProgressbar");

    mainLoop = setInterval(function(){
        updateAmmo();
    }, 200);
    
    updateAmmo();
});