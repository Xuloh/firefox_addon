var playlistItemTemplateSource = document.getElementById("playlist-item-template").innerHTML;
var playlistItemTemplate = Handlebars.compile(playlistItemTemplateSource);

var playlistEmptyMessage = document.getElementById("playlist-empty-message");
var playlistContainer = document.getElementById("playlist");
var addToPlaylistButton = document.getElementById("add-to-playlist");

browser.runtime.getBackgroundPage().then(function(backgroundPage) {
    var playlist = backgroundPage.playlist;

    updateSidebar();

    window.addEventListener("unload", function() {
        playlist.remove("add", playlistAddListener);
        playlist.remove("empty", playlistEmptyListener);
        playlist.remove("play", playlistPlayListener);
        playlist.remove("stop", playlistStopListener);
    });

    playlist.on("add", playlistAddListener);
    playlist.on("empty", playlistEmptyListener);
    playlist.on("play", playlistPlayListener);
    playlist.on("stop", playlistStopListener);

    addToPlaylistButton.addEventListener("click", function() {
        backgroundPage.addToPlaylistInput.click();
    });

    // *** DRAG N DROP EVENT HANDLERS *** //

    addToPlaylistButton.addEventListener("drop", function(event) {
        event.preventDefault();
        event.stopPropagation();
        this.classList.remove("dragover");
        backgroundPage.fileInputListener.bind(event.dataTransfer, false)();
    });

    addToPlaylistButton.addEventListener("dragover", function(event) {
        event.preventDefault();
        event.stopPropagation();
    });

    addToPlaylistButton.addEventListener("dragenter", function(event) {
        this.classList.add("dragover");
        event.preventDefault();
        event.stopPropagation();
    });

    addToPlaylistButton.addEventListener("dragleave", function(event) {
        console.log("dragleave");
        this.classList.remove("dragover");
        event.preventDefault();
        event.stopPropagation();
    });

    // *** PLAYLIST LISTENERS *** //

    function playlistAddListener(event) {
        if(playlistContainer.childElementCount === 0) {
            playlistEmptyMessage.classList.add("hidden");
            playlistContainer.classList.remove("hidden");
        }

        addToView(event.data.track);
    }

    function playlistEmptyListener() {
        playlistContainer.innerHTML = "";
        playlistContainer.classList.add("hidden");
        playlistEmptyMessage.classList.remove("hidden");
    }

    function playlistPlayListener(event) {
        var oldPlaying = document.querySelector(".playlist-item.playing");
        if(oldPlaying !== null)
            oldPlaying.classList.remove("playing");
        playlistContainer.children[event.data.index].classList.add("playing");
    }

    function playlistStopListener() {
        document.querySelector(".playlist-item.playing").classList.remove("playing");
    }

    function updateSidebar() {
        if(playlist.length() > 0) {
            playlistEmptyMessage.classList.add("hidden");
            playlistContainer.classList.remove("hidden");

            for(let i = 0; i < playlist.length(); i++)
                addToView(playlist.get(i));

            playlistContainer.children[playlist.currentTrack].classList.add("playing");
        }
    }
});

function addToView(track) {
    playlistContainer.innerHTML += playlistItemTemplate(track.metadata);
}
