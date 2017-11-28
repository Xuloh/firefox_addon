document.addEventListener("DOMContentLoaded", function() {
    var audio_player = document.getElementById("audio-player");
    var file_input = document.getElementById("file-input");
    file_input.addEventListener("input", function() {
        var file = this.files[0];
        if(file.type.startsWith("audio/")) {
            var url = window.URL.createObjectURL(file);
            audio_player.src = url;
            audio_player.play();
        }
    });
});
