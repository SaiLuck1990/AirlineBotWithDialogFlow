const express = require('express');
const request = require('request');
const app = express();
const bodyParser = require('body-parser');

app.set('port',(process.env.port || 5000));

app.use(bodyParser.urlencoded({extended : false}));

app.use(bodyParser.json());

//app.use(express.static('public'));

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
			  res.type('json');
              res.json(JSON.stringify(body));
		  }else{
			  res.send("Error !!!!!"+error);
		  }
	   });
});

app.listen(app.get('port'),function(){
    console.log('running on port',app.get('port'));
});