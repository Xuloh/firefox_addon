browser.runtime.getBackgroundPage().then(function(backgroundPage) {
    var fileInput = backgroundPage.fileInput;
    var audioPlayer = backgroundPage.audioPlayer;

    initVarsById();

    updateGUI();

    window.addEventListener("unload", function() {
        audioPlayer.removeEventListener("ended", playerEndedListener);
        audioPlayer.removeEventListener("timeupdate", playerTimeUpdateListener);
    });

    audioPlayer.addEventListener("ended", playerEndedListener);
    audioPlayer.addEventListener("timeupdate", playerTimeUpdateListener);

    // Register controls event listeners
    fileButton.addEventListener("click", function() {
        fileInput.click();
    });

    playPauseButton.addEventListener("click", playPause);

    volumeDownButton.addEventListener("click", function() {
        if(audioPlayer.volume - 0.1 >= 0.0)
            audioPlayer.volume -= 0.1;
        else
            audioPlayer.volume = 0.0;
        updateGUI("volume_input");
    });

    volumeUpButton.addEventListener("click", function() {
        if(audioPlayer.volume + 0.1 <= 1.0)
            audioPlayer.volume += 0.1;
        else
            audioPlayer.volume = 1.0;
        updateGUI("volume_input")
    });

    volumeInput.addEventListener("input", function() {
        audioPlayer.volume = this.value;
    })

    muteButton.addEventListener("click", function() {
        audioPlayer.muted = !audioPlayer.muted;
        updateGUI("mute_button");
    });

    loopButton.addEventListener("click", function() {
        audioPlayer.loop = !audioPlayer.loop;
        updateGUI("loop_button");
    });

    currentTimeInput.addEventListener("input", function() {
        audioPlayer.currentTime = this.value;
    });

    backwardButton.addEventListener("click", function() {
        var currentTime = audioPlayer.currentTime;
        if(currentTime - 10 >= 0)
            audioPlayer.currentTime = currentTime - 10;
        else
            audioPlayer.currentTime = 0;
    });

    forwardButton.addEventListener("click", function() {
        var currentTime = audioPlayer.currentTime;
        if(currentTime + 10 <= audioPlayer.duration)
            audioPlayer.currentTime = currentTime + 10;
        else
            audioPlayer.currentTime = audioPlayer.duration;
    })

    // *** Listeners *** //

    // Called when the audio file has finished playing
    function playerEndedListener() {
        updateGUI(["play_pause_button", "now_playing", "current_time_input"]);
    }

    // Called to update the current time input's value
    function playerTimeUpdateListener() {
        currentTimeLabel.textContent = toTimeStr(audioPlayer.currentTime);
        currentTimeInput.value = audioPlayer.currentTime;
    }

    // Plays/pauses the audio file
    function playPause() {
        if(audioPlayer.paused)
            audioPlayer.play();
        else
            audioPlayer.pause();
        updateGUI("play_pause_button");
    }

    // *** GUI UPDATE FUNCTIONS *** //

    // Toggles the play/pause button
    function togglePlayPauseButton() {
        if(audioPlayer.paused) {
            playPauseButton.classList.remove("fa-pause");
            playPauseButton.classList.add("fa-play");
            playPauseButton.title = "Play";
        }
        else {
            playPauseButton.classList.remove("fa-play");
            playPauseButton.classList.add("fa-pause");
            playPauseButton.title = "Pause";
        }
    }

    // Updates the now playing display
    function switchNowPlaying() {
        if(backgroundPage.nowPlaying != null) {
            nowPlaying.textContent = backgroundPage.nowPlaying;
            nowPlaying.title = backgroundPage.nowPlaying;
        }
        else {
            nowPlaying.textContent = "Nothing playing";
            nowPlaying.title = "";
        }
    }

    // Toggles the mute button
    function toggleMuteButton() {
        if(audioPlayer.muted)
            muteButton.classList.add("toggled");
        else
            muteButton.classList.remove("toggled");
    }

    // Toggles the loop button
    function toggleLoopButton() {
        if(audioPlayer.loop)
            loopButton.classList.add("toggled");
        else
            loopButton.classList.remove("toggled");
    }

    // Sets the volume input value to the audio player volume
    function setVolumeInputValue() {
        volumeInput.value = audioPlayer.volume;
    }

    // Sets the current time input max value and value and enables it
    function setCurrentTimeInput() {
        if(backgroundPage.nowPlaying != null) {
            currentTimeInput.max = audioPlayer.duration;
            currentTimeInput.value = audioPlayer.currentTime;
            currentTimeInput.disabled = false;

            currentTimeLabel.textContent = toTimeStr(audioPlayer.currentTime);
            durationLabel.textContent = toTimeStr(audioPlayer.duration);
        }
        else {
            currentTimeInput.max = 1;
            currentTimeInput.value = 0;
            currentTimeInput.disabled = true;

            currentTimeLabel.textContent = "0:00";
            durationLabel.textContent = "0:00";
        }
    }

    // Calls the necessary functions to fully update the gui
    function updateGUI(gui = "") {
        var guiFuncs = {
            "now_playing": switchNowPlaying,
            "play_pause_button": togglePlayPauseButton,
            "mute_button": toggleMuteButton,
            "loop_button": toggleLoopButton,
            "volume_input": setVolumeInputValue,
            "current_time_input": setCurrentTimeInput
        }

        if(gui === "")
            for(var guiElement in guiFuncs)
                guiFuncs[guiElement]();
        else
            if(typeof gui === "string" && gui in guiFuncs)
                guiFuncs[gui]();
            else
                if(Array.isArray(gui))
                    for(var i = 0; i < gui.length; i++)
                        guiFuncs[gui[i]]();
                else
                    console.log("Unrecognized parameter " + gui + " in function updateGUI");
    }

});

// Adds a variable for each DOM element with an id
function initVarsById() {
    var elementsById = document.querySelectorAll("*[id][var]");
    for(var i = 0; i < elementsById.length; i++) {
        var varName = elementsById[i].id;
        window[varName] = elementsById[i];
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
