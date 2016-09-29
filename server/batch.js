var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nyusdg');

var dbschema = require('./dbschema.js');
var Data = dbschema.Data;

var url = 'http://websys3.stern.nyu.edu/~websysF15GB3/websys/imagedirectory/',
    lazy = require("lazy"),
    fs = require("fs");

new lazy(fs.createReadStream('./datasheet_nyusdg.csv'))
    .lines
    .forEach(function (line) {
            var arr = line.toString().split(",");
            if (arr[0] != 'CATEGORY') {
                console.log(arr[0]);
                var data1 = new Data(
                    {
                        category: arr[0],
                        name: arr[1],
                        created: new Date(),
                        discount: arr[2],
                        requirement: arr[3],
                        info: arr[4],
                        web: arr[5],
                        logo: url + arr[6].replace(/(\r\n|\n|\r)/gm, ""),
                        lat: arr[7],
                        lng: arr[8],
                        location: arr[9],
                        phone: arr[10]

                    });
                data1.save(function (err, doc) {
                });
            }
        }
    );