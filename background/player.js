var fileInput = document.getElementById("fileInput");
var addToPlaylistInput = document.getElementById("addToPlaylistInput");
var audioPlayer = document.getElementById("audioPlayer");
audioPlayer.src = "";

var playlist = new Playlist(audioPlayer);

fileInput.addEventListener("input", fileInputListener.bind(fileInput, true));
addToPlaylistInput.addEventListener("input", fileInputListener.bind(addToPlaylistInput, false));

// Handles adding tracks to the playlist and overriding the playlist
function fileInputListener(overridePlaylist = false) {
    if(overridePlaylist)
        playlist.empty();

    playlist.add(Array.from(this.files).filter(file => file.type.startsWith("audio/"))).then(() => {
        if(overridePlaylist || playlist.nowPlaying() === null)
            playlist.playNext();
    });
}
