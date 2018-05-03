//Imports 

var dotenv = require('dotenv').config();
var keys = require('./keys.js'); //local import
var Spotify = require('node-spotify-api');
var Twitter = require('twitter');
var request = require('request');
var fs = require("fs");
var inquirer = require("inquirer");
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

const omdbUrl = "http://www.omdbapi.com/?";


//need to get process.argv parameters into generic variables so that I can run the process from either command line or file

var instruction = "";
var secondaryParam = "";

// [ADDED] If user inputs no instruction, (ie node liri) use user prompts via inquirer to build instruction. 
// This way user doesn't have to memorize exact commands
if(process.argv.length === 2){
inquirer.prompt({
	type: "list",
	message: "Hi! How can I help you?",
	choices: ["my-tweets","spotify-this-song","movie-this","do-what-it-says"],
	name: "instructPrompt"
}).then(function(instructResponse){
	switch(instructResponse.instructPrompt){
		//instructions that need no search string
		case "my-tweets":
		case "do-what-it-says":
		executeInstruction(instructResponse.instructPrompt,"");
		break;
		//instructions that need search string
		case "spotify-this-song":
		case "movie-this":
		instruction = instructResponse.instructPrompt;
		inquirer.prompt({
			type: "input",
			message: "Sure!, What would you like me to search for?",
			name: "searchPrompt"
		}).then(function(searchResponse){
			secondaryParam = searchResponse.searchPrompt;
			secondaryParam = secondaryParam.trim();
			secondaryParam = encodeSearchString(secondaryParam);
			executeInstruction(instruction,secondaryParam);

		});
	}
});
}else{  
//User has specified an instruction in command line call
	instruction = process.argv[2];
//Build query string from rest of command line arguments
for(var i=3;i<process.argv.length;i++){
	secondaryParam += " " + process.argv[i];
}
secondaryParam = secondaryParam.trim();
secondaryParam = encodeSearchString(secondaryParam);
executeInstruction(instruction,secondaryParam);
}

/**************************************************************************
*	executeInstruction
*		performs actions based on instruction
**************************************************************************/
function executeInstruction(instruction, secondaryParam){
	var current = Date.now();
	var currentDate = new Date(current);
	logResults(["-----------------------------------------------------"]);
	logResults([currentDate]);
	logResults([instruction]);
	logResults([secondaryParam]);
	logResults(["-----------------------------------------------------"]);
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
    		// console.log("");
    		// console.log(tweets[i].created_at);
    		// console.log(tweets[i].text);
    		logResults(["",tweets[i].created_at,tweets[i].text]);
    			}
  			}else{
  				return logError('Error occurred: ' + error);
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
			// console.log("");
			// console.log("Artist: " + "Ace of Base");
   // 			console.log("Song: " + "The Sign");
   // 			console.log("Preview Link: " + "https://open.spotify.com/track/0hrBpAOgrt8RXigk83LLNE");
   // 			console.log("Album: " + "The Sign");
   			logResults(["","Artist: " + "Ace of Base","Song: " + "The Sign","Preview Link: " 
   				+ "https://open.spotify.com/track/0hrBpAOgrt8RXigk83LLNE","Album: " + "The Sign"]);
		}else{
		spotify.search({ type: 'track', query: secondaryParam, limit: '1' }, function(error, data) {
  		if (!error) {
  			//If Empty Data Set
  			if(data.tracks.items.length === 0){
  				return logError("Error: No tracks found");
  			} // end if empty data set
  			//console.log(data);
   			for(var i = 0;i<data.tracks.items.length;i++){   			
   			// console.log("");
   			// console.log("Artist: " + data.tracks.items[i].artists[0].name);
   			// console.log("Song: " + data.tracks.items[i].name);
   			// console.log("Preview Link: " + data.tracks.items[i].external_urls.spotify);
   			// console.log("Album: " + data.tracks.items[i].album.name);
   			logResults(["","Artist: " + data.tracks.items[i].artists[0].name,
   				"Song: " + data.tracks.items[i].name,
   				"Preview Link: " + data.tracks.items[i].external_urls.spotify,
   				"Album: " + data.tracks.items[i].album.name]);
   			}

  		}else{
  			return logError('Error occurred: ' + error);
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
			logResults(["If you haven't watched \"Mr. Nobody,\" then you should: http://www.imdb.com/title/tt0485947/",
				"It's on Netflix!"]);
		}
		var requestURL = omdbUrl + "t=" + secondaryParam +"&y=&plot=short&apikey=" + keys.omdb.apikey;
		request(requestURL, function(error,response,body){
			if(!error && response.statusCode === 200){

			// If Empty Data Set
			if(JSON.parse(body).Response === "False"){
				return console.error("Error: Movie not found");
					} // end if empty data set

				var data = JSON.parse(body);
				//console.log(data);
				/*
				console.log("");
				console.log("Title: " + data.Title);
				console.log("Year: "  + data.Year);
				console.log("IMDB Rating: " + data.Ratings[0].Value);

				// Some movie entries seem to not have an RT score, this prevents from breaking
				if(data.Ratings.length > 1){
				console.log("Rotten Tomatos Rating: " + data.Ratings[1].Value);
				}else{
				console.log("Rotten Tomatos Rating: N/A")
				}

				console.log("Country: " + data.Country);
				console.log("Language: " + data.Language);
				console.log("Plot: " + data.Plot);
				console.log("Actors: " + data.Actors);
				*/
				var rTRatingString;
				if(data.Ratings.length > 1){
				rTRatingString = "Rotten Tomatos Rating: " + data.Ratings[1].Value;
				}else{
				rTRatingString = "Rotten Tomatos Rating: N/A";
				}

				logResults(["","Title: "+ data.Title, "Year: " + data.Year,
					"IMDB Rating: " + data.Ratings[0].Value, rTRatingString, "Country: " + data.Country,
					"Language: " + data.Language, "Plot: " + data.Plot, "Actors: " + data.Actors]);				
			}else{
				return logError('Error occurred: ' + error);
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
					secondaryParam += ","+args[i];
				}
				secondaryParam = secondaryParam.trim();
				secondaryParam = encodeSearchString(secondaryParam);
				//console.log(args[0])
				executeInstruction(args[0], secondaryParam);
			}
		})
	break;
	// No recognized instruction
	default:
	logError("Error: Not a vaild instruction. Please use \"my-tweets\",\"spotify-this-song\",\"movie-this\", or \"do-what-it-says\". You can also just run \"node liri\" and use the menu");
	}
}

/****************************************************************************
*		encodeSearchString
*				replaces spaces with "+" for passing to api calls
****************************************************************************/
function encodeSearchString(searchString){
	return searchString.replace(/ /g,"+");
} // end encodeSearchString

function logResults(textArray){
	var textStr = "";
	for(var i = 0; i<textArray.length;i++){
		textStr += textArray[i] + "\n";
		
	}
	console.log(textStr);
	fs.appendFile("log.txt",textStr,function(error){
			if(error){
				console.error(error);
			}
		});
}
function logError(errorText){
	console.error(errorText);
	fs.appendFile("log.txt",errorText+"\n",function(error){
		if(error){
			console.error(error);
		}
	});
}

