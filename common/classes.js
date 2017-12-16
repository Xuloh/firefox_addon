// Promise wrapper of the jsmediatags.read method
var readFileMetadata = function(file) {
    return new Promise((resolve, reject) => {
        jsmediatags.read(file, {
            onSuccess: tag => resolve(tag),
            onError: error => reject(error)
        })
    });
}

// Class used to represent an object with a simple event mechanism
class EventEmitter {
    constructor(supportedEvents) {
        this.supportedEvents = supportedEvents;
        this.eventListeners = {};
        for(let i = 0; i < this.supportedEvents.length; i++)
            this.eventListeners[this.supportedEvents[i]] = []
    }

    on(event, eventListener) {
        this.eventListeners[event].push(eventListener);
    }

    off(event, eventListener) {
        var listenerIndex = this.eventListeners[event].indexOf(eventListener);
        if(listenerIndex > -1)
            this.eventListeners[event].splice(listenerIndex, 1);
    }

    trigger(event, data = null) {
        for(let i = 0; i < this.eventListeners[event].length; i++) {
            let eventObject = {
                "type": event,
                "data": data
            };
            setTimeout(() => this.eventListeners[event][i](eventObject), 0);
        }
    }
}

// Class used to store and manipulate a playlist
class Playlist extends EventEmitter {

    // Takes the audio player that will be used by the playlist
    // If an array is given, the playlist is initialised with it
    constructor(audioPlayer, playlist = null) {
        super(["add", "empty", "play", "stop", "switch", "remove"]);

        this.audioPlayer = audioPlayer;
        this.audioPlayer.addEventListener("ended", () => {
            if(this.hasNext())
                this.playNext();
            else
                this.stop();
        });

        this.playlist = [];
        if(playlist != null && Array.isArray(playlist))
            this.add(playlist);

        this.currentTrack = -1;
    }

    // Adds the given track to the playlist
    // If an array is given, adds all the tracks it contains
    add(file) {
        if(!Array.isArray(file))
            file = [file];

        let promises = [];
        for(let i = 0; i < file.length; i++) {
            let track = {
                "url": URL.createObjectURL(file[i]),
                "file": file[i],
                "metadata" : {
                    "filename": file[i].name,
                    "index": this.length() + i + 1
                }
            };
            promises.push(
                readFileMetadata(track.file)
                    .then(tag => {
                        track.metadata.artist = tag.tags.artist;
                        track.metadata.title = tag.tags.title;
                    })
                    .catch(error => console.log(error))
                    .finally(() => {
                        this.playlist.push(track);
                        this.trigger("add", {"track": track});
                    })
            );
        }
        return Promise.all(promises);
    }

    // Returns true if a previous track is available
    hasPrevious() {
        return this.currentTrack > 0;
    }

    // Returns true if a next track is available
    hasNext() {
        return this.currentTrack + 1 < this.playlist.length;
    }

    // Returns the previous track, or null if the start of the playlist was reached
    previous() {
        return this.get(--this.currentTrack);
    }

    // Returns the next track, or null if the end of the playlist was reached
    next() {
        return this.get(++this.currentTrack);
    }

    // Returns the track at the given index
    get(index) {
        if(index >= 0 && index < this.length())
            return this.playlist[index];
        else
            return null;
    }

    // Empties the playlist
    empty() {
        if(this.currentTrack > -1)
            this.audioPlayer.currentTime = this.audioPlayer.duration;

        for(let i = 0; i < this.playlist.length; i++)
            URL.revokeObjectURL(this.playlist[i].url);
        this.currentTrack = -1;
        this.playlist = [];

        this.trigger("empty");
    }

    // Returns the number of tracks in the playlist
    length() {
        return this.playlist.length;
    }

    playNext() {
        if(this.hasNext()) {
            var nextTrack = this.next();
            this.audioPlayer.src = nextTrack.url;
            this.audioPlayer.play();
            this.trigger("play", {"index": this.currentTrack});
        }
    }

    playPrevious() {
        if(this.hasPrevious()) {
            var previousTrack = this.previous();
            this.audioPlayer.src = previousTrack.url;
            this.audioPlayer.play();
            this.trigger("play", {"index": this.currentTrack});
        }
    }

    play(index) {
        if(index >= 0 && index < this.length()) {
            var track = this.get(index);
            this.currentTrack = index;
            this.audioPlayer.src = track.url;
            this.audioPlayer.play();
            this.trigger("play", {"index": index});
        }
    }

    nowPlaying() {
        // console.log("now playing method ;)");
        if(this.currentTrack > -1)
            return this.get(this.currentTrack);
        else
            return null;
    }

    stop() {
        this.audioPlayer.src = "";
        this.currentTrack = -1;
        this.trigger("stop");
    }

    moveUp(index) {
        if(index > 0)
            this.switchTracks(index, index - 1);
    }

    moveDown(index) {
        if(index < this.length() - 1)
            this.switchTracks(index, index + 1);
    }

    switchTracks(index1, index2) {
        if(index1 >= 0 && index1 < this.length() && index2 >= 0 && index2 < this.length()) {

            // Switch the tracks
            var track = this.playlist[index1];
            this.playlist[index1] = this.playlist[index2];
            this.playlist[index2] = track;

            // Update track indices
            this.playlist[index1].metadata.index = index1 + 1;
            this.playlist[index2].metadata.index = index2 + 1;

            // Update current track (if necessary)
            if(this.currentTrack === index1)
                this.currentTrack = index2;
            else if(this.currentTrack === index2)
                this.currentTrack = index1;

            this.trigger("switch", {"index1": index1, "index2": index2});
        }
    }

    // Removes the track at the given index
    remove(index) {
        if(index >= 0 && index < this.length()) {
            URL.revokeObjectURL(this.playlist[index].url);
            this.playlist.splice(index, 1);

            for(let i = index; i < this.length(); i++)
                this.playlist[i].metadata.index = this.playlist[i].metadata.index - 1;

            if(index >= this.length())
                this.stop();
            else
                this.play(index);

            this.trigger("remove", {"index": index});
        }
    }
}

/*
 * Class that can associate a GUI element name to a function used to update this element
 * It creates its own collection of element name/update function using the current Document
 * It looks for HTML elements that have an id, gui-element and gui-update attribute
 * The gui-element tells it that this HTML element is in fact a gui-element
 * The id is used as the name of the element
 * the gui-update gives the name of the update function
 * (this functions needs to exist in the class' global scope)
 */
class GUIUpdater {

    // The context object is available in all the update functions and can contain anything
    constructor(context) {
        this.context = context;

        this.guiUpdates = {};
        var guiElements = document.querySelectorAll("*[id][gui-element][gui-update]");
        for(let i = 0; i < guiElements.length; i++) {
            var guiElement = guiElements[i];
            this.guiUpdates[guiElement.id] = window[guiElement.getAttribute("gui-update")].bind(this);
        }
    }

    // Calls the update function(s) of the specified GUI element(s)
    // If "" is given, calls all the update functions
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
