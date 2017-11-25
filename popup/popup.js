console.log("imotep");
var folder = document.getElementById("folder");
folder.addEventListener("input", function() {
    console.log(this.files);
    for(var i = 0; i < this.files.length; i++)
        console.log(window.URL.createObjectURL(this.files[i]));
})
