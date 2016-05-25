var mongoose = require('mongoose')
    , express = require('express')
    , bodyParser = require('body-parser')
    , hash = require('./password.js').hash
    , sessions = require('client-sessions')
    , dbschema = require('./dbschema.js')
    , fs  =   require('fs');

mongoose.connect('mongodb://localhost/nyusdg');


//var User = mongoose.model("user", UserSchema);
var User = dbschema.User;
var user = new User();

user.username = "admin";

hash("123", function (err, salt, hash) {
    if (err) {
        console.log(err);
    }
    user.salt = salt;
    user.hash = hash;
    user.save(function (err) {
        if (err) {
            console.log(err);
            if (err.code === 11000) {
                console.log('usename exists');
            }
        } else {
            console.log("user saved");
        }
    });
});


//--------------------------------------------------

var Data = dbschema.Data;


var app = express();

//--------------------------------------------------
app.use(cookieParser);
app.use(sessions({
    secret: 'nyusdgsadwndvqdncojqqa', // should be a large unguessable string
    duration: 30 * 60 * 1000, // how long the session will stay valid in ms
    activeDuration: 5 * 60 * 1000 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
}));
/*
 app.use(function(req, res, next) {
 if (req.mySession.seenyou) {
 res.setHeader('X-Seen-You', 'true');
 } else {
 // setting a property will automatically cause a Set-Cookie response
 // to be sent
 req.mySession.seenyou = true;
 res.setHeader('X-Seen-You', 'false');
 }
 });
 */


app.use(bodyParser.json({}));


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//--------------------------------------------------
app.post('/login', function (req, res) {
    //console.log(req.body.username);
    //console.log(req.body.password);
    User.findOne({username: req.body.username}, function (err, user) {
        if (!user) {
            res.send('User not found');
        }
        else hash(req.body.password, user.salt, function (err, hash) {
            if (err) res.send('Unknown Error');
            if (hash == user.hash) {
                req.nyusdg.user = user;
                res.send('Login Success!');
                //console.log("Success!!!!");
            }
            else {
                res.send('Invalid password');

            }
        });
    });

});

// middleware
function restrict(req, res, next) {
    if (req.session.nyusdg && req.session.nyusdg.user) {
        User.findOne({username: req.nyusdg.user.username}, function (err, user) {
            if (!user) {
                req.nyusdg.reset();
                res.send('1');
            }
            else {
                next();
            }
        });
    }
    else {
        res.send('1');
    }

}

//--------------------------------------------------


app.get('/data/:classifier', function (req, res) {
    console.log(req.params.classifier);
    Data.find({category: req.params.classifier}, function (err, data) {
        //res.send('hello world');
        res.json(data);
    });
});


app.get('/data/:id', function (req, res) {
    Data.findById(req.params.id, function (err, data) {
        //res.send('hello world');
        res.json(data);
    });
});


app.get('/data/', function (req, res) {
    Data.find(function (err, data) {
        //res.send('hello world');
        res.json(data);
    });
});


//--------------------------------------------------
app.delete('/data/:id', restrict, function (req, res) {

    Data.remove({_id: req.params.id}, function (err, count) {
        //console.log(err);
        //console.log(count);
        Data.find(function (err, data) {
            res.json(data);
        });
    });
});
var regex = /^data:.+\/(.+);base64,(.*)$/;
var severurl = 'http://45.55.229.232/';
app.post('/data/', restrict, function (req, res) {
    //console.log(req);

    var matches = req.body.storePhoto.match(regex);
    var ext = matches[1];
    var data = matches[2];
    var buffer = new Buffer(data, 'base64');
    var cur = new Date();
    var imageurl = '../uploads/' + req.body.name + cur.toISOString() + "." + ext;
    fs.writeFile(imageurl , buffer);

    var data1 = new Data(
        {
            category: req.body.category,
            name: req.body.name,
            created: cur,
            discount: req.body.discount,
            requirement: req.body.requirement,
            info: req.body.info,
            web: req.body.web,
            logo: severurl+imageurl,
            lat: req.body.lat,
            lng: req.body.lng,
            location: req.body.location,
            phone: req.body.phone
        });

    data1.save(function (err, doc) {
        Data.find(function (err, data) {
            res.json(data);
        });
    });
});



app.listen(7003);