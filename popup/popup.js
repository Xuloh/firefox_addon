browser.runtime.getBackgroundPage().then(function(background_page) {
    var file_input = background_page.document.getElementById("file-input");
    var audio_player = background_page.document.getElementById("audio-player");

    init_vars_by_id();

    switch_play_pause_button();

    switch_now_playing();

    audio_player.addEventListener("ended", player_ended_listener);

    window.addEventListener("unload", function() {
        audio_player.removeEventListener("ended", player_ended_listener);
    });

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

    function player_ended_listener() {
        switch_play_pause_button();
        switch_now_playing();
    }

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

    function switch_now_playing() {
        if(background_page.now_playing != null) {
            nothing_playing.style.display = "none";
            now_playing.style.display = "inline";
            playing.style.display = "inline";
            playing.textContent = background_page.now_playing;
        }
        else {
            nothing_playing.style.display = "inline";
            now_playing.style.display = "none";
            playing.style.display = "none";
            playing.textContent = "";
        }
    }
});

function init_vars_by_id() {
    var elements_by_id = document.querySelectorAll("*[id]");
    for(var i = 0; i < elements_by_id.length; i++) {
        var var_name = elements_by_id[i].id.split("-").join("_");
        window[var_name] = elements_by_id[i];
    }
}
