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

    remove(event, eventListener) {
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
            this.eventListeners[event][i](eventObject);
        }
    }
}

// Class used to store and manipulate a playlist
class Playlist extends EventEmitter {

    // Takes the audio player that will be used by the playlist
    // If an array is given, the playlist is initialised with it
    constructor(audioPlayer, playlist = null) {
        super(["add", "empty"]);

        this.audioPlayer = audioPlayer;
        this.audioPlayer.addEventListener("ended", function() {
            this.playNext();
        }.bind(this));

        this.playlist = [];
        if(playlist != null && Array.isArray(playlist))
            this.add(playlist);

        this.currentTrack = -1;
    }

    // Adds the given track to the playlist
    // If an array is given, adds all the tracks it contains
    add(track) {
        if(!Array.isArray(track))
            track = [track];
        for(let i = 0; i < track.length; i++)
            this.playlist.push({
                "url": URL.createObjectURL(track[i]),
                "file": track[i]
            });
        this.trigger("add", {"track": track});
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
        if(this.currentTrack > 0)
            return this.playlist[--this.currentTrack];
        else
            return null;
    }

    // Returns the next track, or null if the end of the playlist was reached
    next() {
        if(this.currentTrack < this.playlist.length)
            return this.playlist[++this.currentTrack];
        else
            return null;
    }

    // Returns the track at the given index
    get(index) {
        return this.playlist[index];
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
        }
        else
            this.audioPlayer.src = "";
    }

    playPrevious() {
        if(this.hasPrevious()) {
            var previousTrack = this.previous();
            this.audioPlayer.src = previousTrack.url;
            this.audioPlayer.play();
        }
        else
            this.audioPlayer.src = "";
    }

    nowPlaying() {
        // console.log("now playing method ;)");
        if(this.currentTrack > -1)
            return this.get(this.currentTrack).file.name;
        else
            return null;
    }
}

var fileInput = document.getElementById("fileInput");
var addToPlaylistInput = document.getElementById("addToPlaylistInput");

var playlist = new Playlist(document.getElementById("audioPlayer"));

fileInput.addEventListener("input", fileInputListener.bind(fileInput, true));
addToPlaylistInput.addEventListener("input", fileInputListener.bind(addToPlaylistInput, false));

// Handles adding tracks to the playlist and overriding the playlist
function fileInputListener(overridePlaylist = false) {
    if(overridePlaylist)
        playlist.empty();

    playlist.add(Array.from(this.files).filter(file => file.type.startsWith("audio/")));

    if(overridePlaylist || playlist.nowPlaying() === null)
        playlist.playNext();
}
