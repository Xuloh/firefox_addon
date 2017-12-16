initElementsById();

browser.runtime.getBackgroundPage().then(function(backgroundPage) {
    var audioPlayer = backgroundPage.audioPlayer;
    var fileInput = backgroundPage.fileInput;
    var addToPlaylistInput = backgroundPage.addToPlaylistInput;
    var playlist = backgroundPage.playlist;

    var guiUpdater = new GUIUpdater({
        "backgroundPage": backgroundPage,
        "audioPlayer": audioPlayer,
        "playlist": playlist
    });

    guiUpdater.updateGUI();

    // *** REGISTER EVENT LISTENERS *** //

    var playPauseListener = guiUpdater.updateGUI.bind(guiUpdater, "playPauseButton");

    // Remove listeners attached to objects in the background page when the popup in unloaded
    window.addEventListener("unload", function() {
        audioPlayer.removeEventListener("ended", playerEndedListener);
        audioPlayer.removeEventListener("timeupdate", playerTimeUpdateListener);
        audioPlayer.removeEventListener("play", playPauseListener);
        audioPlayer.removeEventListener("pause", playPauseListener);
    });

    audioPlayer.addEventListener("ended", playerEndedListener);
    audioPlayer.addEventListener("timeupdate", playerTimeUpdateListener);
    audioPlayer.addEventListener("play", playPauseListener);
    audioPlayer.addEventListener("pause", playPauseListener);

    fileButton.addEventListener("click", function() {
        fileInput.click();
    });

    addToPlaylistButton.addEventListener("click", function() {
        addToPlaylistInput.click();
    });

    emptyButton.addEventListener("click", function() {
        playlist.empty();
    });

    playPauseButton.addEventListener("click", function() {
        var update = false;
        if(playlist.nowPlaying() === null)
            update = true;
        playlist.playPause();
        if(update)
            guiUpdater.updateGUI(["nowPlaying", "currentTimeInput", "durationLabel"]);
    });

    stopButton.addEventListener("click", function() {
        playlist.stop();
        guiUpdater.updateGUI(["playPauseButton", "nowPlaying", "currentTimeInput", "durationLabel"]);
    });

    volumeDownButton.addEventListener("click", function() {
        if(audioPlayer.volume - 0.1 >= 0.0)
            audioPlayer.volume -= 0.1;
        else
            audioPlayer.volume = 0.0;
        guiUpdater.updateGUI("volumeInput");
    });

    volumeUpButton.addEventListener("click", function() {
        if(audioPlayer.volume + 0.1 <= 1.0)
            audioPlayer.volume += 0.1;
        else
            audioPlayer.volume = 1.0;
        guiUpdater.updateGUI("volumeInput")
    });

    volumeInput.addEventListener("input", function() {
        audioPlayer.volume = this.value;
    })

    muteButton.addEventListener("click", function() {
        audioPlayer.muted = !audioPlayer.muted;
        guiUpdater.updateGUI("muteButton");
    });

    loopButton.addEventListener("click", function() {
        if(!audioPlayer.loop && !playlist.loop)
            audioPlayer.loop = true;
        else if(audioPlayer.loop && !playlist.loop) {
            audioPlayer.loop = false;
            playlist.loop = true;
        }
        else
            playlist.loop = false;
        guiUpdater.updateGUI("loopButton");
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
    });

    previousButton.addEventListener("click", function() {
        playlist.playPrevious();
        guiUpdater.updateGUI(["nowPlaying", "currentTimeInput", "durationLabel"]);
    });

    nextButton.addEventListener("click", function() {
        playlist.playNext();
        guiUpdater.updateGUI(["nowPlaying", "currentTimeInput", "durationLabel"]);
    });

    // *** LISTENERS *** //

    // Called when the audio file has finished playing
    function playerEndedListener() {
        guiUpdater.updateGUI(["playPauseButton", "nowPlaying", "currentTimeInput", "durationLabel"]);
    }

    // Called to update the current time input's value
    function playerTimeUpdateListener() {
        currentTimeLabel.textContent = toTimeStr(audioPlayer.currentTime);
        currentTimeInput.value = audioPlayer.currentTime;
    }
});

// *** MISC FUNCTIONS *** //

// Adds a variable for each gui-element with an id in the document
function initElementsById() {
    var guiElements = document.querySelectorAll("*[id][gui-element]");
    for(let i = 0; i < guiElements.length; i++) {
        var guiElement = guiElements[i].id;
        window[guiElement] = guiElements[i];
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

// *** GUI UPDATE STUFF *** //

// Toggles the play/pause button
function togglePlayPauseButton() {
    if(this.context.audioPlayer.paused) {
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
    if(this.context.playlist.nowPlaying() != null) {
        nowPlaying.textContent = this.context.playlist.nowPlaying().file.name;
        nowPlaying.title = this.context.playlist.nowPlaying().file.name;
    }
    else {
        nowPlaying.textContent = "Nothing playing";
        nowPlaying.title = "";
    }
}

// Toggles the mute button
function toggleMuteButton() {
    if(this.context.audioPlayer.muted)
        muteButton.classList.add("toggled");
    else
        muteButton.classList.remove("toggled");
}

// Toggles the loop button
function toggleLoopButton() {
    if(this.context.audioPlayer.loop && !this.context.playlist.loop) {
        loopButton.classList.add("toggled");
        loopButton.title = "Loop playlist";
    }
    else if(!this.context.audioPlayer.loop && this.context.playlist.loop) {
        loopButton.classList.add("toggled");
        loopButton.children[0].classList.remove("hidden");
        loopButton.title = "No loop";
    }
    else {
        loopButton.children[0].classList.add("hidden");
        loopButton.classList.remove("toggled");
        loopButton.title = "Loop track";
    }
}

// Sets the volume input value to the audio player volume
function setVolumeInputValue() {
    volumeInput.value = this.context.audioPlayer.volume;
}

// Sets the current time input max value and value and enables it
function setCurrentTimeInput() {
    if(this.context.playlist.nowPlaying() != null) {
        var duration = this.context.audioPlayer.duration;
        if(isNaN(duration))
            this.context.audioPlayer.addEventListener("loadedmetadata",  function() {
                currentTimeInput.max = this.duration;
            }, {"once": true});
        else
            currentTimeInput.max = this.context.audioPlayer.duration;

        currentTimeInput.value = this.context.audioPlayer.currentTime;
        currentTimeInput.disabled = false;

        currentTimeLabel.textContent = toTimeStr(this.context.audioPlayer.currentTime);
    }
    else {
        currentTimeInput.max = 1;
        currentTimeInput.value = 0;
        currentTimeInput.disabled = true;

        currentTimeLabel.textContent = "0:00";
    }
}

// Sets the duration durationLabel
function setDurationLabel() {
    if(this.context.playlist.nowPlaying() != null) {
        var duration = this.context.audioPlayer.duration;
        if(isNaN(duration))
            this.context.audioPlayer.addEventListener("loadedmetadata",  function() {
                durationLabel.textContent = toTimeStr(this.duration, true);
            }, {"once": true});
        else
            durationLabel.textContent = toTimeStr(this.context.audioPlayer.duration, true);
    }
    else
        durationLabel.textContent = "0:00";
}
