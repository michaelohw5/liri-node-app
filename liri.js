require("dotenv").config();
var fs = require("fs");

var keys = require("./keys");
var request = require('request');
var moment = require("moment");
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);
var axios = require("axios");

var arg = process.argv;
var command = arg[2];
var searchTerm;

var setSearchTerm = function () {
    var term = "";
    for (var i = 3; i < arg.length; i++) {
        term = term + arg[i] + " ";
    }
    searchTerm = term;
}

var liri = function () {
    setSearchTerm();
    if (command === "spotify-this-song") {
        //do spotify stuff
        if (searchTerm === "") {
            searchTerm = "The Sign";
        }
        findSong(searchTerm);
    }
    else if (command === "movie-this") {
        //do movie stuff
        if (searchTerm === "") {
            searchTerm = "Dr. Strangelove";
        }
        findMovie(searchTerm);
    }
    else if (command === "do-what-it-says") {
        //do that stuff
        doIt();
    }
}

var findSong = function (song) {
    spotify
        .search({ type: "track", query: song })
        .then(function (response) {
            var track = response.tracks.items[0].name;
            var album = response.tracks.items[0].album.name;
            var artists = response.tracks.items[0].artists[0].name;
            var preview = response.tracks.items[0].external_urls.spotify;
            console.log("======SEARCH RESULT======")
            console.log(`Track: ${track}`);
            console.log("Album: " + album);
            console.log("Artist: " + artists);
            console.log(`Preview: ${preview}`);
            console.log("=========================");
            fs.appendFile("log.txt", "\n======================\n" + "Command: " + process.argv[2], function (err) {
                if (err) console.error(err);
            });
            fs.appendFile("log.txt", `
Track: ${track}
Album: ${album}
Artist: ${artists}
Preview: ${preview}
======================`, function (err) {
                    if (err) console.error(err);
                    console.log("Added!");
                });
        })
        .catch(function (err) {
            console.log(err);
        });
}

var findMovie = function (movie) {
    var queryUrl = `http://www.omdbapi.com/?t=${movie}&y=&plot=short&apikey=trilogy`;
    axios
        .get(queryUrl)
        .then(function (response) {
            var data = response.data;
            var title = data.Title;
            var year = data.Year;
            var imdb = data.imdbRating;
            var tomato
            if(data.Ratings.length >= 2) {
                tomato = data.Ratings[1].Value;
            }
            else {
                tomato = "N/A"
            }
            var madein = data.Country;
            var lang = data.Language;
            var plot = data.Plot;
            var actors = data.Actors;

            console.log(
                `======SEARCH RESULT======
Title: ${title}
Year: ${year}
Rating:
    IMDB: ${imdb}
    Rotten Tomato: ${tomato}
Country: ${madein}
Language: ${lang}
Actors: ${actors}
Plot: ${plot}
=========================`);
//fs stuff to log
fs.appendFile("log.txt", "\n======================\n" + "Command: " + process.argv[2], function (err) {
    if (err) console.error(err);
});
fs.appendFile("log.txt", `
Title: ${title}
Year: ${year}
Rating:
    IMDB: ${imdb}
    Rotten Tomato: ${tomato}
Country: ${madein}
Language: ${lang}
Actors: ${actors}
Plot: ${plot}
======================`, function (err) {
        if (err) console.error(err);
        console.log("Added!");
    });
        });
}

var doIt = function () {
    var todo;
    var searchfor;
    fs.readFile("./random.txt", "utf8", function (err, data) {
        if (err) return console.error(err);
        var random = data.split(",");
        todo = random[0];
        searchfor = random[1];
        if (todo === "spotify-this-song") {
            findSong(searchfor);
        }
        else if (todo === "movie-this") {
            findMovie(searchfor);
        }
    });
}

liri();
