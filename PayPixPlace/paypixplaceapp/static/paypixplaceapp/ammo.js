let userAmmoDisplay;
let ammoProgressbar;
let timeRemaining;
let interval;


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
            timeRemaining = data.timeBeforeReload;
            
            if (data.ammo >= data.maxAmmo) {
                ammoProgressbar.value = 0;
            } else if (interval == undefined){
                interval = setInterval(function(){
                    ammoProgressbar.value = data.reloadTime - timeRemaining;
                    timeRemaining -= 0.2;
                }, 200);
                setTimeout(function(){
                    clearInterval(interval);
                    interval = undefined;
                    updateAmmo();
                }, data.timeBeforeReload*1000);
            }
        }
    });
}

$(document).ready(function(){
    userAmmoDisplay = document.getElementById("userAmmo");
    ammoProgressbar = document.getElementById("ammoProgressbar");
    interval = undefined;
    updateAmmo();
});