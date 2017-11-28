browser.runtime.getBackgroundPage().then(function(background_page) {
    var file_input = background_page.document.getElementById("file-input");
    var audio_player = background_page.document.getElementById("audio-player");

    var file_button = document.getElementById("file-button");
    var play_button = document.getElementById("play-button");
    var pause_button = document.getElementById("pause-button");

    file_button.addEventListener("click", function() {
        file_input.click();
    });

    play_button.addEventListener("click", function() {
        audio_player.play();
    });

    pause_button.addEventListener("click", function() {
        audio_player.pause();
    });
});
