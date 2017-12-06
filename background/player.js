var audioPlayer = document.getElementById("audio-player");
var fileInput = document.getElementById("file-input");

var playlist = [];
var currentFile = 0;

var nowPlaying = null;

audioPlayer.addEventListener("ended", function() {
    URL.revokeObjectURL(this.src);

    if(currentFile !== (playlist.length - 1))
        playFileAt(++currentFile);
    else {
        this.src = "";
        nowPlaying = null;
    }
});

fileInput.addEventListener("input", function() {
    for(var i = 0; i < this.files.length; i++) {
        var file = this.files[i];
        if(file.type.startsWith("audio/")) {
            playlist.push(file);

            if(nowPlaying == null) {
                currentFile = 0;
                playFileAt(currentFile);
            }
        }
    }
});

function playFileAt(index) {
    var file = playlist[index];
    var url = URL.createObjectURL(file);
    audioPlayer.src = url;
    audioPlayer.play();
    nowPlaying = file.name;
}
