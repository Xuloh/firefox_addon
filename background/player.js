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

    // If an array is given, the playlist is initialised with it
    constructor(playlist = null) {
        super(["add", "empty"]);
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

    // Returns true if a next track is available
    hasNext() {
        return this.currentTrack + 1 < this.playlist.length;
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

    // Returns the index of the current track
    getCurrentTrack() {
        return this.currentTrack;
    }

    // Empties the playlist
    empty() {
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
}

var audioPlayer = document.getElementById("audioPlayer");
var fileInput = document.getElementById("fileInput");
var addToPlaylistInput = document.getElementById("addToPlaylistInput");

var playlist = new Playlist();

var nowPlaying = null;

audioPlayer.addEventListener("ended", function() {
    if(playlist.hasNext())
        playTrack(playlist.next());
    else {
        this.src = "";
        nowPlaying = null;
    }
});

fileInput.addEventListener("input", fileInputListener.bind(fileInput, true));
addToPlaylistInput.addEventListener("input", fileInputListener.bind(addToPlaylistInput, false));

// Handles adding tracks to the playlist and overriding the playlist
function fileInputListener(overridePlaylist = false) {
    if(overridePlaylist) {
        audioPlayer.pause();
        playlist.empty();
    }

    playlist.add(Array.from(this.files).filter(file => file.type.startsWith("audio/")));

    if(overridePlaylist || nowPlaying === null)
        playTrack(playlist.next());
}

// Plays the given track
function playTrack(track) {
    audioPlayer.src = track.url;
    audioPlayer.play();
    nowPlaying = track.file.name;
}
