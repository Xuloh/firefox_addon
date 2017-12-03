var audio_player = document.getElementById("audio-player");
var file_input = document.getElementById("file-input");

var playlist = [];
var current_file = 0;

var now_playing = null;

audio_player.addEventListener("ended", function() {
    URL.revokeObjectURL(this.src);

    if(current_file !== (playlist.length - 1))
        play_file_at(++current_file);
    else {
        this.src = "";
        now_playing = null;
    }
});

file_input.addEventListener("input", function() {
    for(var i = 0; i < this.files.length; i++) {
        var file = this.files[i];
        if(file.type.startsWith("audio/")) {
            playlist.push(file);

            if(now_playing == null) {
                current_file = 0;
                play_file_at(current_file);
            }
        }
    }
});

function play_file_at(index) {
    var file = playlist[index];
    var url = URL.createObjectURL(file);
    audio_player.src = url;
    audio_player.play();
    now_playing = file.name;
}
