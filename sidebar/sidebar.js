var playlistItemTemplateSource = document.getElementById("playlist-item-template").innerHTML;
var playlistItemTemplate = Handlebars.compile(playlistItemTemplateSource);

var playlistEmptyMessage = document.getElementById("playlist-empty-message");
var playlistContainer = document.getElementById("playlist");

browser.runtime.getBackgroundPage().then(function(backgroundPage) {
    var fileInput = backgroundPage.fileInput;
    var addToPlaylistInput = backgroundPage.addToPlaylistInput;
    var playlist = backgroundPage.playlist;

    window.addEventListener("unload", function() {
        playlist.remove("add", playlistAddListener);
        playlist.remove("empty", playlistEmptyListener);
    });

    playlist.on("add", playlistAddListener);
    playlist.on("empty", playlistEmptyListener);

    function playlistAddListener(event) {
        if(playlistContainer.childElementCount === 0)
            playlistEmptyMessage.classList.add("hidden");

        for(let i = 0; i < event.data.track.length; i++) {
            var file = event.data.track[i];

            if(file.type.startsWith("audio/")) {
                var newPlaylistItem = playlistItemTemplate({
                    "name": file.name
                });
                playlistContainer.innerHTML += newPlaylistItem;
            }
        }
    }

    function playlistEmptyListener() {
        playlistContainer.innerHTML = "";
        playlistEmptyMessage.classList.remove("hidden");
    }
});
