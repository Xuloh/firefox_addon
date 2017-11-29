document.addEventListener("DOMContentLoaded", function() {
    var audio_player = document.getElementById("audio-player");
    var file_input = document.getElementById("file-input");

    audio_player.addEventListener("ended", function() {
        URL.revokeObjectURL(this.src);
        this.src = "";
        now_playing = null;
    });

    file_input.addEventListener("input", function() {
        var file = this.files[0];
        if(file.type.startsWith("audio/")) {
            var url = URL.createObjectURL(file);
            audio_player.src = url;
            audio_player.play();
            now_playing = file.name;
        }
    });
});

var now_playing = null;
