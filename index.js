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
    console.log("Your request is"+JSON.stringify(req.body));
    var city="";
    var source = req.body.result.source;
    if(req.body.result.action==="findestinationairport"){
        city=req.body.result.parameters.destination.city;
        sendAirports(req,res,city,source);
    } else if(req.body.result.action==="findoriginairport"){
        city=req.body.result.parameters.origin.city;
        sendAirports(req,res,city,source);
    } else if(req.body.result.action ==="triptype"){
        sendTripTypes(req,res,source);
    }else if(req.body.result.action === "flightsearch"){
        searchFlights(req,res,source);
    }else if(req.body.result.action === "findcabin"){
        sendCabinTypes(req,res,source);
    }
});


function searchFlights(req,res,source){
    var depDate = req.body.result.parameters.date;
    var cabin = req.body.result.parameters.cabin;
    var adultCount = 0;
    var youthCount = 0;
    var childCount = 0;
    var infantCount = 0;
    if(null !== req.body.result.parameters.adultcount){
        adultCount = req.body.result.parameters.adultcount;
    }else if (null != req.body.result.parameters.childcount){
        childCount = req.body.result.parameters.childcount;
    }else if(null != req.body.result.parameters.infantcount){
        infantCount = req.body.result.parameters.infantcount;
    }else if(null != req.body.result.parameters.youthcount){
        youthCount = req.body.result.parameters.youthcount;
    }
    var destination = req.body.result.parameters.toairport.IATA;
    var origin = req.body.result.parameters.fromairport.IATA;

    console.log("Destination is"+destination);
    console.log("Origin is"+origin);
    //console.log("adultcount"+adultCount);

    request({
        url: "https://api.sandbox.amadeus.com/v1.2/flights/low-fare-search",
        qs: {
            apikey: "gsd9NA8otlDkflTSKXaAd09VE2xQrNLN",
            origin: origin,
            destination : destination,
            departure_date : depDate,
            adults : adultCount,
            children: childCount,
            infants : infantCount,
            include_airlines : "BA",
            nonstop : "false",
            currency:"GBP",
            travel_class : cabin,
            number_of_results : 10
        },
        method: 'GET',
        json: true
    },function(error, response, body){
        //console.log(JSON.stringify(body));
        if (!error && response.statusCode == 200) {
            var replies = getTotalListOfFare(body);
            var currencyCode = body.currency;
            if(source === "agent"){
                messages = [
                    {
                        title:"Please select one of the fares for your journey in GBP",
                        replies:replies,
                        type: 2}
                ];
            } else if (source === "facebook"){
                messages = [
                    {
                        title:"Please select one of the fares for your journey in GBP",
                        platform:"facebook",
                        replies:replies,
                        type: 2}
                ];
            }
            res.json({
                //speech: responseJson,
                //displayText: "This is your display text",
                messages:messages,
                source: source
            });
        }else{
            res.json({
                displayText:response.body.message,
                type: 0});
        }
    });
}

function getTotalListOfFare(body){
    var replies = new Array(body.results.length);
    console.log(body.results.length);
    for(var i=0;i<body.results.length;i++){
        total = body.results[i].fare.total_price;
        console.log("totalFare"+total);
        //replies.push[total];
        replies[i] = Math.round(total);
        console.log("replies"+replies.length);
    }
    return replies;
}

function sendTripTypes(req,res,source){
    messages = [
        {
            title:"Please select a trip type",
            //image_url:"http://www.gstatic.com/webp/gallery/1.webp",
            //subtitle:"We have the right hat for everyone.",
            //platform:"facebook",
            replies:["oneway" ,"return"],
            type: 2}
    ];
    res.json({
        //speech: responseJson,
        //displayText: airportList,
        messages:messages,
        source: source});
}

function sendCabinTypes(req,res,source){
    messages = [
        {
            title:"Please select a cabin of your choice",
            //image_url:"http://www.gstatic.com/webp/gallery/1.webp",
            //subtitle:"We have the right hat for everyone.",
            //platform:"facebook",
            replies:["Economy" ,"Business","First Class"],
            type: 2}
    ];
    res.json({
        //speech: responseJson,
        //displayText: airportList,
        messages:messages,
        source: source});
}

function sendAirports(req,res,city,source){
    var outString = "Result is";
    console.log("City sent from Bot is"+city);
    request({
        url: "https://api.sandbox.amadeus.com/v1.2/airports/autocomplete",
        qs: {
            term: city,
            apikey: "gsd9NA8otlDkflTSKXaAd09VE2xQrNLN"
        },
        method: 'GET',
        json: true
    }, function(error, response, body){
        if (!error && response.statusCode == 200) {
            console.log("Airport Service Response is"+JSON.stringify(body));
            res.setHeader('Content-Type', 'application/json');
            var airportList = JSON.stringify(body);
            var replies =[];
            for(var i=0;i<body.length;i++){
                //console.log("Inside for loop");
                var airportCode = body[i].value;
                //console.log("airportCode"+airportCode);
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
                displayText: "This is your display text",
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