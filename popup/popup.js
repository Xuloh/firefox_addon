browser.runtime.getBackgroundPage().then(function(background_page) {
    var audio_player = background_page.document.getElementById("audio-player");
    var folder = document.getElementById("folder");
    folder.addEventListener("input", function() {
        var file = this.files[0];
        if(file.type.startsWith("audio/")) {
            var url = window.URL.createObjectURL(file);
            audio_player.src = url;
            audio_player.play();
        }
    });
});
