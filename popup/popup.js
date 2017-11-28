browser.runtime.getBackgroundPage().then(function(background_page) {
    var file_input = background_page.document.getElementById("file-input");
    var audio_player = background_page.document.getElementById("audio-player");

    var file_button = document.getElementById("file-button");
    var play_button = document.getElementById("play-button");
    var pause_button = document.getElementById("pause-button");

    var volume_up_button = document.getElementById("volume-up-button");
    var volume_down_button = document.getElementById("volume-down-button");
    var mute_button = document.getElementById("mute-button");

    file_button.addEventListener("click", function() {
        file_input.click();
    });

    play_button.addEventListener("click", function() {
        audio_player.play();
    });

    pause_button.addEventListener("click", function() {
        audio_player.pause();
    });

    volume_up_button.addEventListener("click", function() {
        if(audio_player.volume + 0.1 <= 1.0)
            audio_player.volume += 0.1;
    });

    volume_down_button.addEventListener("click", function() {
        if(audio_player.volume - 0.1 >= 0)
            audio_player.volume -= 0.1;
    });

    mute_button.addEventListener("click", function() {
        audio_player.muted = !audio_player.muted;
    });
});
