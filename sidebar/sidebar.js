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
    });

    playlist.on("add", playlistAddListener);
    playlist.on("empty", playlistEmptyListener);

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

        for(let i = 0; i < event.data.track.length; i++)
            addToView(event.data.track[i], playlistContainer.childElementCount + i + 1);
    }

    function playlistEmptyListener() {
        playlistContainer.innerHTML = "";
        playlistContainer.classList.add("hidden");
        playlistEmptyMessage.classList.remove("hidden");
    }

    function updateSidebar() {
        if(playlist.length() > 0) {
            playlistEmptyMessage.classList.add("hidden");
            playlistContainer.classList.remove("hidden");

            for(let i = 0; i < playlist.length(); i++)
                addToView(playlist.get(i).file, i + 1);
        }
    }
});

function addToView(file, index) {
    let fileInfo = {
        "index": index,
        "filename": file.name
    };

    jsmediatags.read(file, {
        onSuccess: function(tag) {
            fileInfo["artist"] = tag.tags.artist;
            fileInfo["title"] = tag.tags.title;
            playlistContainer.innerHTML += playlistItemTemplate(fileInfo);
        },
        onError: function(error) {
            console.log(error);
        }
    });
}
