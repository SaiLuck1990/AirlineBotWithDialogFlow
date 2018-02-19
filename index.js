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

app.post('/result',function(req,res){
    var currency = req.body.result.parameters.currency;
    var outputCurrency = req.body.result.parameters.outputCurrency;
    var outString = "Result is";
    console.log(currency);
    console.log(outputCurrency);
    request({
         url: "https://api.fixer.io/latest",
         qs: {
                    base: currency,
                    symbols: outputCurrency
                },
         method: 'GET',
        json: true
    }, function(error, response, body){ 
		  if (!error && response.statusCode == 200) { 
              console.log('Success');
			  console.log(body);
			  res.setHeader('Content-Type', 'application/json');
                // send only text response
              var responseJson = "You result"+JSON.stringify(body);
              console.log(responseJson);

              //var quickReplies = "{messages:[{type:0,platform:facebook,+speech:Sure ! Can you also please let me know where would you like to start your journey from (origin) ?},{type:2,platform:facebook,title:hello,replies:[London Heathrow,London City,London Gatwick]},{type:0,speech:yes}]}";

             //res.json(quickReplies);
             res.json({
            speech: responseJson,
            displayText: responseJson,
            messages:[
                   {
                    title:"select",
                    platform:"facebook",
                    replies:['gbp','inr'],
                    buttons:[
                    {
                   type:"web_url",
                   url:"https://petersfancybrownhats.com",
                   title:"View Website"
                     },{
                   type:"postback",
                   title:"Start Chatting",
                   payload:"DEVELOPER_DEFINED_PAYLOAD"
                    }              
                   ],
                    type: 2}
                ],
            source: 'sample'
           });
             
		  }else{
			  res.send("Error !!!!!"+error);
		  }
	   });
});

// Heroku assigns a dynamci port 
app.listen(process.env.PORT || 5000,function(){
    console.log('running on port',app.get('port'));
});