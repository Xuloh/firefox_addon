browser.runtime.getBackgroundPage().then(function(background_page) {
    var file_input = background_page.document.getElementById("file-input");
    var file_button = document.getElementById("file-button");
    file_button.addEventListener("click", function() {
        file_input.click();
    });
});
