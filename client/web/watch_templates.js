/*global require, console, setTimeout*/
(function () {
    "use strict";

    var LineByLineReader = require('.vendors//line-by-line/line-by-line.js'),
        fs = require("fs"),
        dir = "templates",
        out = "templates.html",
        time_last_updated = 0,
        time_last_changed = 1;

    // TODO<Question:MADS>: is writeFile synchronous?
    function updateTemplateFile(done) {
        fs.readdir(dir, function (err, files) {
            var out_stream = fs.createWriteStream(out),
                len = files.length;

            function writeFiles(done) {
                function writeFile(i) {
                    if (i < len) {
                        var file = files[i],
                            id = file.split(".")[0],
                            lreader = new LineByLineReader(dir + "/" + file);
                            
                        //console.log("\rPiping " + file);
                        out_stream.write("\n\n\t<!---" + file.toUpperCase() + "--->");
                        out_stream.write("\n\t<script id='" + id + "'>");
                        
                        lreader.on('line', function (line) {
                            out_stream.write("\n\t\t" + line);
                        });
                        
                        lreader.on("end", function () {
                            out_stream.write("\n\t</script>");
                            writeFile(i + 1);
                        });
                    } else {
                        done();
                    }
                }
                writeFile(0);
            }
            
            out_stream.write("<templates>");
            writeFiles(function () {
                out_stream.end("\n\n</templates>");
                console.log('\tupdated template, included #files:', len);
                time_last_updated = Date.now();
                done();
            });
        });
    }

    function change_listener() { // (event, file)
        time_last_changed = Date.now();
    }
    
    function setUpdateOnChanged(delay, notify) {
        function check() {
            if (time_last_changed > time_last_updated) {
                notify(check);
            } else {
                setTimeout(check, delay);
            }
        }
        check();
    }
    
    fs.watch("templates", change_listener);
    setUpdateOnChanged(300, updateTemplateFile);
    console.log("Now watching '" + dir + "'. CTRL + C for exit");

}());