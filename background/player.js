class Playlist {
    constructor(playlist = null) {
        if(playlist != null && Array.isArray(playlist))
            this.playlist = playlist;
        else
            this.playlist = [];

        this.currentTrack = 0;
    }

    add(track) {
        if(Array.isArray(track))
            this.playlist = this.playlist.concat(track);
        else
            this.playlist.push(track);
    }

    hasNext() {
        return this.currentTrack < this.playlist.length;
    }

    next() {
        if(this.currentTrack < this.playlist.length)
            return this.playlist[this.currentTrack++];
        else
            return null;
    }

    get(index) {
        return this.playlist[index];
    }

    empty() {
        this.playlist = [];
    }

    length() {
        return this.playlist.length;
    }
}

var audioPlayer = document.getElementById("audioPlayer");
var fileInput = document.getElementById("fileInput");

var playlist = new Playlist();

var nowPlaying = null;

audioPlayer.addEventListener("ended", function() {
    URL.revokeObjectURL(this.src);

    if(playlist.hasNext())
        playTrack(playlist.next());
    else {
        this.src = "";
        nowPlaying = null;
    }
});

fileInput.addEventListener("input", function() {
    for(var i = 0; i < this.files.length; i++) {
        var file = this.files[i];
        if(file.type.startsWith("audio/")) {
            playlist.add(file);

            if(nowPlaying == null) {
                playTrack(playlist.next());
            }
        }
    }
});

function playTrack(track) {
    var url = URL.createObjectURL(track);
    audioPlayer.src = url;
    audioPlayer.play();
    nowPlaying = track.name;
}
