browser.runtime.getBackgroundPage().then(function(background_page) {
    var file_input = background_page.document.getElementById("file-input");
    var audio_player = background_page.document.getElementById("audio-player");

    init_vars_by_id();
    switch_play_pause_button();
    switch_now_playing();

    window.addEventListener("unload", function() {
        audio_player.removeEventListener("ended", player_ended_listener);
    });

    audio_player.addEventListener("ended", player_ended_listener);

    // Register buttons event listeners
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

    // Called when the audio file has finished playing
    function player_ended_listener() {
        switch_play_pause_button();
        switch_now_playing();
    }

    // Plays/pauses the audio file
    function play_pause() {
        if(audio_player.paused)
            audio_player.play();
        else
            audio_player.pause();
        switch_play_pause_button();
    }

    // Switches the play/pause button
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

    // Updates the now playing display
    function switch_now_playing() {
        if(background_page.now_playing != null)
            now_playing.textContent = "Now playing : " + background_page.now_playing;
        else
            now_playing.textContent = "Nothing playing";
    }
});

// Adds a variable for each DOM element with an id
function init_vars_by_id() {
    var elements_by_id = document.querySelectorAll("*[id]");
    for(var i = 0; i < elements_by_id.length; i++) {
        var var_name = elements_by_id[i].id.split("-").join("_");
        window[var_name] = elements_by_id[i];
    }
}
