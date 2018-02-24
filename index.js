const express = require('express');
const request = require('request');
const app = express();
const bodyParser = require('body-parser');

app.set('port',(process.env.port || 5000));

app.use(bodyParser.urlencoded({extended : false}));

app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/hello' ,function(req,res){
    res.send('Hello I am Sailakshmi');
});

app.post('/airports',function(req,res){
    //console.log("Your request is"+JSON.stringify(req.body));
    var city="";
    var source = req.body.result.source;
    if(req.body.result.action==="findestinationairport"){
       city=req.body.result.parameters.destination.city;
       sendResponse(req,res,city,source);
    } else if(req.body.result.action==="findoriginairport"){
      city=req.body.result.parameters.origin.city;
       sendResponse(req,res,city,source);
    } else if(req.body.result.action ==="triptype"){

    }
});
function sendTripTypes(req,res,source){
    res.json({
            //speech: responseJson,
            //displayText: airportList,
            title:"Please select a trip type",
            messages:["oneway" ,"return"],
            source: source});
}
 function sendResponse(req,res,city,source){
    var outString = "Result is";
    console.log("City sent from Bot is"+city);
    request({
         url: "https://api.sandbox.amadeus.com/v1.2/airports/autocomplete",
         qs: {
                    term: city,
                    apikey: "J5ZkcObTCaZvq9MlYs0rjycwAx8PdVTk"
                },
         method: 'GET',
        json: true
    }, function(error, response, body){ 
		  if (!error && response.statusCode == 200) { 
			  //console.log("Airport Service Response is"+JSON.stringify(body));
			  res.setHeader('Content-Type', 'application/json');
              var airportList = JSON.stringify(body);
              var replies =[];
              for(var i=0;i<body.length;i++){
                  var airportCode = body[i].value;
                  var airportName = body[i].label;
                  replies.push(airportName);
              }
            var messages =[];

            if(source === "agent"){
                messages = [
                   {
                    title:"Please select an airport in "+city,
                    //platform:"facebook",
                    replies:replies,
                    type: 2}
                ];
            } else if (source === "facebook"){
                messages = [
                   {
                    title:"Please select an airport in "+city,
                    platform:"facebook",
                    replies:replies,
                    type: 2}
                ];
            }
            res.json({
            //speech: responseJson,
            //displayText: airportList,
            messages:messages,
            source: source
           });  
		  }else{
			  res.send("Error !!!!!"+error);
		  }
	   });
  }
// Heroku assigns a dynamic port 
app.listen(process.env.PORT || 5000,function(){
    console.log('running on port',app.get('port'));
});