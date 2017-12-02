browser.runtime.getBackgroundPage().then(function(background_page) {
    var file_input = background_page.document.getElementById("file-input");
    var audio_player = background_page.document.getElementById("audio-player");

    init_vars_by_id();
    switch_now_playing();
    toggle_play_pause_button();
    toggle_mute_button();
    toggle_loop_button();
    set_volume_input_value();
    set_current_time_input();

    window.addEventListener("unload", function() {
        audio_player.removeEventListener("ended", player_ended_listener);
        audio_player.removeEventListener("timeupdate", player_timeupdate_listener);
    });

    audio_player.addEventListener("ended", player_ended_listener);
    audio_player.addEventListener("timeupdate", player_timeupdate_listener);

    // Register controls event listeners
    file_button.addEventListener("click", function() {
        file_input.click();
    });

    play_pause_button.addEventListener("click", play_pause);

    volume_down_button.addEventListener("click", function() {
        if(audio_player.volume - 0.1 >= 0.0)
            audio_player.volume -= 0.1;
        else
            audio_player.volume = 0.0;
        set_volume_input_value();
    });
    
    volume_up_button.addEventListener("click", function() {
        if(audio_player.volume + 0.1 <= 1.0)
            audio_player.volume += 0.1;
        else
            audio_player.volume = 1.0;
        set_volume_input_value()
    });

    volume_input.addEventListener("input", function() {
        audio_player.volume = this.value;
    })

    mute_button.addEventListener("click", function() {
        audio_player.muted = !audio_player.muted;
        toggle_mute_button();
    });

    loop_button.addEventListener("click", function() {
        audio_player.loop = !audio_player.loop;
        toggle_loop_button();
    });

    current_time_input.addEventListener("input", function() {
        audio_player.currentTime = this.value;
    });

    backward_button.addEventListener("click", function() {
        var current_time = audio_player.currentTime;
        if(current_time - 10 >= 0)
            audio_player.currentTime = current_time - 10;
        else
            audio_player.currentTime = 0;
    });

    forward_button.addEventListener("click", function() {
        var current_time = audio_player.currentTime;
        if(current_time + 10 <= audio_player.duration)
            audio_player.currentTime = current_time + 10;
        else
            audio_player.currentTime = audio_player.duration;
    })

    // Called when the audio file has finished playing
    function player_ended_listener() {
        toggle_play_pause_button();
        switch_now_playing();
        reset_current_time_input();
    }

    // Called to update the current time input's value
    function player_timeupdate_listener() {
        current_time_label.textContent = toTimeStr(audio_player.currentTime);
        current_time_input.value = audio_player.currentTime;
    }

    // Plays/pauses the audio file
    function play_pause() {
        if(audio_player.paused)
            audio_player.play();
        else
            audio_player.pause();
        toggle_play_pause_button();
    }

    // Toggles the play/pause button
    function toggle_play_pause_button() {
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
        if(background_page.now_playing != null) {
            now_playing.textContent = background_page.now_playing;
            now_playing.title = background_page.now_playing;
        }
        else {
            now_playing.textContent = "Nothing playing";
            now_playing.title = "";
        }
    }

    // Toggles the mute button
    function toggle_mute_button() {
        if(audio_player.muted)
            mute_button.classList.add("toggled");
        else
            mute_button.classList.remove("toggled");
    }

    // Toggles the loop button
    function toggle_loop_button() {
        if(audio_player.loop)
            loop_button.classList.add("toggled");
        else
            loop_button.classList.remove("toggled");
    }

    // Sets the volume input value to the audio player volume
    function set_volume_input_value() {
        volume_input.value = audio_player.volume;
    }

    // Sets the current time input max value and value and enables it
    function set_current_time_input() {
        if(background_page.now_playing != null) {
            current_time_input.max = audio_player.duration;
            current_time_input.value = audio_player.currentTime;
            current_time_input.disabled = false;

            current_time_label.textContent = toTimeStr(audio_player.currentTime);
            duration_label.textContent = toTimeStr(audio_player.duration);
        }
    }

    // Resets the current time input max value and value and disables it
    function reset_current_time_input() {
        current_time_input.max = 1;
        current_time_input.value = 0;
        current_time_input.disabled = true;

        current_time_label.textContent = "0:00";
        duration_label.textContent = "0:00";
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

// Formats the given number of seconds to a hh:mm:ss string
function toTimeStr(seconds) {
    seconds = parseInt(seconds);
    var hours, minutes;

    hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;
    minutes = parseInt(seconds / 60);
    seconds = seconds % 60;

    if(seconds < 10)
        seconds = "0" + seconds;

    if(hours > 0)
        return hours + ":" + minutes + ":" + seconds;
    else
        return minutes + ":" + seconds;
}
