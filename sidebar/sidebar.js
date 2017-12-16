"use strict";

var playlistItemTemplateSource = document.getElementById("playlist-item-template").innerHTML;
var playlistItemTemplate = Handlebars.compile(playlistItemTemplateSource);

var playlistEmptyMessage = document.getElementById("playlist-empty-message");
var playlistContainer = document.getElementById("playlist");
var addToPlaylistButton = document.getElementById("add-to-playlist");

browser.runtime.getBackgroundPage().then(function(backgroundPage) {
    var playlist = backgroundPage.playlist;

    var playlistControls = {
        "move-up": function() {
            var index = this.parentNode.parentNode.children[0].innerHTML;
            playlist.moveUp(index - 1);
        },
        "move-down": function() {
            var index = this.parentNode.parentNode.children[0].innerHTML;
            playlist.moveDown(index - 1);
        },
        "remove": function() {
            var index = this.parentNode.parentNode.children[0].innerHTML;
            playlist.remove(index - 1);
        }
    };

    updateSidebar();

    window.addEventListener("unload", function() {
        playlist.off("add", playlistAddListener);
        playlist.off("empty", playlistEmptyListener);
        playlist.off("play", playlistPlayListener);
        playlist.off("stop", playlistStopListener);
        playlist.off("switch", playlistSwitchListener);
        playlist.off("remove", playlistRemoveListener);
    });

    playlist.on("add", playlistAddListener);
    playlist.on("empty", playlistEmptyListener);
    playlist.on("play", playlistPlayListener);
    playlist.on("stop", playlistStopListener);
    playlist.on("switch", playlistSwitchListener);
    playlist.on("remove", playlistRemoveListener);

    playlistContainer.addEventListener("click", function(event) {
        if(event.target.classList.contains("playlist-item")) {
            let index = parseInt(event.target.querySelector(".index").textContent) - 1;
            playlist.play(index);
        }
        else if(event.target.hasAttribute("control")) {
            let control = event.target.getAttribute("control");
            playlistControls[control].apply(event.target);
        }
    });

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

    function playlistSwitchListener(event) {
        var index1 = event.data.index1;
        var index2 = event.data.index2;

        var track = document.createElement("div");

        // Update the first track
        track.innerHTML = playlistItemTemplate(playlist.get(index1).metadata);
        track.innerHTML = track.children[0].innerHTML;
        playlistContainer.children[index1].innerHTML = track.innerHTML;

        // Update the second track
        track.innerHTML = playlistItemTemplate(playlist.get(index2).metadata);
        track.innerHTML = track.children[0].innerHTML;
        playlistContainer.children[index2].innerHTML = track.innerHTML;

        // Update the playing track
        document.querySelector(".playlist-item.playing").classList.remove("playing");
        playlistContainer.children[playlist.currentTrack].classList.add("playing");
    }

    function playlistRemoveListener(event) {
        var index = event.data.index;
        playlistContainer.children[index].remove();

        for(let i = index; i < playlist.length(); i++) {
            var indexContainer = playlistContainer.children[i].children[0];
            indexContainer.innerHTML = indexContainer.innerHTML - 1;
        }

        if(playlist.nowPlaying() !== null) {
            if(playlist.currentTrack !== index)
                document.querySelector(".playlist-item.playing").classList.remove("playing");
            playlistContainer.children[playlist.currentTrack].classList.add("playing");
        }
    }

    function updateSidebar() {
        if(playlist.length() > 0) {
            playlistEmptyMessage.classList.add("hidden");
            playlistContainer.classList.remove("hidden");
            playlistContainer.innerHTML = "";

            for(let i = 0; i < playlist.length(); i++)
                addToView(playlist.get(i));

            if(playlist.nowPlaying() !== null)
                playlistContainer.children[playlist.currentTrack].classList.add("playing");
        }
    }
});

function addToView(track) {
    playlistContainer.innerHTML += playlistItemTemplate(track.metadata);
}
