/*global require, console*/
var fs = require("fs");

var dir = "templates",
    out = "templates.html",
    ts;

function splice() {
    "use strict";
    fs.readdir(dir, function (err, files) {
        var out_stream = fs.createWriteStream(out);
        
        function writeFiles() {
            var len = files.length;
            
            function writeFile(i) {
                if (i < len) {
                    var file = files[i],
                        id = file.split(".")[0],
                        in_stream = fs.createReadStream(dir + "/" + file);
                    console.log("Piping " + file);
                    out_stream.write("\n\n\n<!---" + file.toUpperCase() + "--->\n");
                    out_stream.write("\n\t<script id='" + id + "'>\n");
                    in_stream.pipe(out_stream, { end: false });
                    in_stream.on("end", function () {
                        out_stream.write("\n\t</script>");
                        writeFile(i + 1);
                    });
                } else {
                    out_stream.end("</templates>");
                }
            }
            writeFile(0);
        }
        
        out_stream.write("<templates>");
        writeFiles();
    });
}

splice();

ts = Date.now();
fs.watch("templates", function (event, filename) {
    "use strict";
    var tmp = Date.now();
    if (ts + 300 > tmp) { //TODO is 300 fair?
        splice();
    }
    ts = tmp;
});
console.log("Now watching '" + dir + "'. CTRL + C for exit");