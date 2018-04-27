//Imports 

var dotenv = require('dotenv').config();
var keys = require('./keys.js'); //local import
var Spotify = require('node-spotify-api');
var Twitter = require('twitter');
var request = require('request');
var fs = require("fs");
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

const omdbUrl = "http://www.omdbapi.com/?";


//need to get process.argv parameters into generic variables so that I can run the process from either command line or file

var instruction = process.argv[2];
var secondaryParam = "";

for(var i=3;i<process.argv.length;i++){
	secondaryParam += " " + process.argv[i];
}
secondaryParam = secondaryParam.trim();



//console.log(keys);
function executeInstruction(instruction, secondaryParam){
switch(instruction){
	/****************************************** 
	*	my-tweets
	*		-access twitter and output tweets
	*******************************************/
	case "my-tweets":
		var params = {screen_name: 'Tux789'};
		client.get('statuses/user_timeline', params, function(error, tweets, response) {
  		if (!error) {
    		//if total tweets is less than 20, only display how many tweets there are
    		var maxLength = 20;
    		if(tweets.length < maxLength){
    			maxLength = tweets.length;
    		}
    		for(var i=0;i<maxLength;i++){
    		console.log("");
    		console.log(tweets[i].created_at);
    		console.log(tweets[i].text);
    			}
  			}else{
  				return console.error('Error occurred: ' + error);
  			}
		});
	break;

	/******************************************
	*	spotify-this-song
	*		-access spotify and look up song
	******************************************/
	case "spotify-this-song":
		var trackTitle = 'The Sign';
		if(secondaryParam === ""){
			console.log("");
			console.log("Artist: " + "Ace of Base");
   			console.log("Song: " + "The Sign");
   			console.log("Preview Link: " + "https://open.spotify.com/track/0hrBpAOgrt8RXigk83LLNE");
   			console.log("Album: " + "The Sign");
		}else{
		spotify.search({ type: 'track', query: secondaryParam, limit: '1' }, function(error, data) {
  		if (!error) {
  			//var response = JSON.parse(data);
   			//console.log(JSON.stringify(data,null,2));
   			for(var i = 0;i<data.tracks.items.length;i++){
   				//console.log("in loop");
   			console.log("");
   			console.log("Artist: " + data.tracks.items[i].artists[0].name);
   			console.log("Song: " + data.tracks.items[i].name);
   			console.log("Preview Link: " + data.tracks.items[i].external_urls.spotify);
   			console.log("Album: " + data.tracks.items[i].album.name);

   			//console.log("Song: ") + data.
   			}

  		}else{
  			return console.error('Error occurred: ' + error);
  		}		 
		});
	}
	break;

	/******************************************
	*	movie-this
	*		-access OMDB to pull information on a movie title
	******************************************/
	case "movie-this":
		if(secondaryParam === ""){
			secondaryParam = "mr nobody";
			console.log("If you haven't watched \"Mr. Nobody,\" then you should: http://www.imdb.com/title/tt0485947/");
			console.log("It's on Netflix!");
		}
		var requestURL = omdbUrl + "t=" + secondaryParam +"&y=&plot=short&apikey=" + keys.omdb.apikey;
		//requestURL ="http://www.omdbapi.com/?t=" + secondaryParam + "&y=&plot=short&apikey=trilogy";
		//console.log(requestURL)
		request(requestURL, function(error,response,body){
			if(!error){
				var data = JSON.parse(body);
				//console.log(data);
				console.log("");
				console.log("Title: " + data.Title);
				console.log("Year: "  + data.Year);
				console.log("IMDB Rating: " + data.Ratings[0].Value);
				console.log("Rotten Tomatos Rating: " + data.Ratings[1].Value);
				console.log("Country: " + data.Country);
				console.log("Language: " + data.Language);
				console.log("Plot: " + data.Plot);
				console.log("Actors: " + data.Actors);
				
			}else{
				return console.error('Error occurred: ' + error);
			}
		});

	break;
	/***************************************
	* do-what-it-says
	*	-use fs to read in a file "random.txt" and do its instructions
	****************************************/
	case "do-what-it-says":
		fs.readFile("random.txt","utf8",function(error,data){
			if(error){
				return console.error('Error occurred: ' + error);
			}else{
				//console.log(data);
				var args = data.split(",");
				secondaryParam = "";
				for(var i=1;i<args.length;i++){
					secondaryParam += " "+args[i];
				}
				secondaryParam = secondaryParam.trim();
				//console.log(args[0])
				executeInstruction(args[0], secondaryParam);
			}
		})
	break;
	default:
	console.log("Error");
}
}



executeInstruction(instruction, secondaryParam);