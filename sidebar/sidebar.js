var playlistItemTemplateSource = document.getElementById("playlist-item-template").innerHTML;
var playlistItemTemplate = Handlebars.compile(playlistItemTemplateSource);

var playlistEmptyMessage = document.getElementById("playlist-empty-message");
var playlist = document.getElementById("playlist");

browser.runtime.getBackgroundPage().then(function(backgroundPage) {
    var fileInput = backgroundPage.fileInput;
    var addToPlaylistInput = backgroundPage.addToPlaylistInput;

    var fileInputListener = inputListener.bind(fileInput, true);
    var addToPlaylistInputListener = inputListener.bind(addToPlaylistInput, false);

    window.addEventListener("unload", function() {
        fileInput.removeEventListener("input", fileInputListener);
        addToPlaylistInput.removeEventListener("input", addToPlaylistInputListener);
    });

    fileInput.addEventListener("input", fileInputListener);
    addToPlaylistInput.addEventListener("input", addToPlaylistInputListener);

    function inputListener(emptyPlaylist = false) {
        if(emptyPlaylist)
            playlist.innerHTML = "";

        if(playlist.innerHTML === "")
            playlistEmptyMessage.style.height = "0";

        for(let i = 0; i < this.files.length; i++) {
            var file = this.files[i];

            if(file.type.startsWith("audio/")) {
                var newPlaylistItem = playlistItemTemplate({
                    "name": file.name
                });

                console.log(newPlaylistItem);
                playlist.innerHTML += newPlaylistItem;
            }
        }
    }
});
