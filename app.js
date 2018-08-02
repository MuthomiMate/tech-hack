const express = require('express');
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
const bodyParser = require('body-parser');
const axios = require('axios')
app = express();
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());



app.post('/', (req, res) =>{
    const text = req.body.text
    const natural_language_understanding = new NaturalLanguageUnderstandingV1({
        'username': '22fab62b-be9c-4e4b-9c06-d3ff3735d143',
        'password': 'URHUq57trTKV',
        'version': '2018-03-16'
    });
    const parameters = {
        'text': text,
        'language': "en",
        'features': {
        'sentiment' : {

        },
        'entities': {
            'emotion': true,
            'sentiment': true,
            'limit': 2
        },
        'keywords': {
            'emotion': true,
            'sentiment': true,
            'limit': 2
        },
        'concepts': {

        },
        'semantic_roles': {

        },
        'relations': {

        },
        'emotion':{

        },
        }
    }

    natural_language_understanding.analyze(parameters, function(err, response) {
        if (err){
            res.json({'error': err})
        }
        else {
            const actions = response.semantic_roles;
            getWordsThatMatch(actions);
            // .map(action =>{
            //     getWordsThatMatch(action.action.text)
            //     res.json({'response': response})
            // })
        }
    });

});

getWordsThatMatch = async (parameters) =>{
    parameters.map(action =>{
        words = action.action.text;
        const word = words.replace(" ", "+");
        const response =  await axios.get(`https://api.datamuse.com/words?ml=${word}`);
        console.log(response);
        return response;
    });


}
module.exports = app;




