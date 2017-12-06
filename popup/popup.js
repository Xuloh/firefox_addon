initVarsById();

browser.runtime.getBackgroundPage().then(function(backgroundPage) {
    var fileInput = backgroundPage.fileInput;
    var audioPlayer = backgroundPage.audioPlayer;

    var guiUpdater = new GUIUpdater({
        "backgroundPage": backgroundPage,
        "audioPlayer": audioPlayer
    });

    guiUpdater.updateGUI();

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
        audioPlayer.loop = !audioPlayer.loop;
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
    })

    // *** Listeners *** //

    // Called when the audio file has finished playing
    function playerEndedListener() {
        guiUpdater.updateGUI(["playPauseButton", "nowPlaying", "currentTimeInput"]);
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
        guiUpdater.updateGUI("playPauseButton");
    }

});

// Adds a variable for each DOM element with an id
function initVarsById() {
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

class GUIUpdater {
    constructor(context) {
        this.context = context;

        this.guiUpdates = {};
        var guiElements = document.querySelectorAll("*[id][gui-element][gui-update]");
        for(let i = 0; i < guiElements.length; i++) {
            var guiElement = guiElements[i];
            this.guiUpdates[guiElement.id] = window[guiElement.getAttribute("gui-update")].bind(this);
        }
    }

    // Calls the necessary functions to fully update the gui
    updateGUI(gui = "") {
        if(gui === "")
            for(var guiElement in this.guiUpdates)
                this.guiUpdates[guiElement]();
        else
            if(typeof gui === "string" && gui in this.guiUpdates)
                this.guiUpdates[gui]();
            else
                if(Array.isArray(gui))
                    for(let i = 0; i < gui.length; i++)
                        this.guiUpdates[gui[i]]();
                else
                    console.log("Unrecognized parameter " + gui + " in function guiUpdater.updateGUI");
    }
}

// *** GUI UPDATE FUNCTIONS *** //

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
    if(this.context.backgroundPage.nowPlaying != null) {
        nowPlaying.textContent = this.context.backgroundPage.nowPlaying;
        nowPlaying.title = this.context.backgroundPage.nowPlaying;
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
    if(this.context.audioPlayer.loop)
        loopButton.classList.add("toggled");
    else
        loopButton.classList.remove("toggled");
}

// Sets the volume input value to the audio player volume
function setVolumeInputValue() {
    volumeInput.value = this.context.audioPlayer.volume;
}

// Sets the current time input max value and value and enables it
function setCurrentTimeInput() {
    if(this.context.backgroundPage.nowPlaying != null) {
        currentTimeInput.max = this.context.audioPlayer.duration;
        currentTimeInput.value = this.context.audioPlayer.currentTime;
        currentTimeInput.disabled = false;

        currentTimeLabel.textContent = toTimeStr(this.context.audioPlayer.currentTime);
        durationLabel.textContent = toTimeStr(this.context.audioPlayer.duration);
    }
    else {
        currentTimeInput.max = 1;
        currentTimeInput.value = 0;
        currentTimeInput.disabled = true;

        currentTimeLabel.textContent = "0:00";
        durationLabel.textContent = "0:00";
    }
}
