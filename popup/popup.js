browser.runtime.getBackgroundPage().then(function(background_page) {
    var file_input = background_page.document.getElementById("file-input");
    var audio_player = background_page.document.getElementById("audio-player");

    var file_button = document.getElementById("file-button");
    var play_pause_button = document.getElementById("play-pause-button");

    var volume_up_button = document.getElementById("volume-up-button");
    var volume_down_button = document.getElementById("volume-down-button");
    var mute_button = document.getElementById("mute-button");

    switch_play_pause_button();

    file_button.addEventListener("click", function() {
        file_input.click();
    });
    
    play_pause_button.addEventListener("click", play_pause);

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

    function play_pause() {
        if(audio_player.paused)
            audio_player.play();
        else
            audio_player.pause();
        switch_play_pause_button();
    }

    function switch_play_pause_button() {
        if(audio_player.paused) {
            play_pause_button.classList.remove("fa-pause");
            play_pause_button.classList.add("fa-play");
            play_pause_button.title = "Play";
        }
        else {
            play_pause_button.classList.remove("fa-play");
            play_pause_button.classList.add("fa-pause");
            play_pause_button.title = "Pause";
        }
    }
});
