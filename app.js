const express = require('express');
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
const bodyParser = require('body-parser');
const axios = require('axios');
const communication = require('./attributes/communication.json');
const initiative = require('./attributes/initiative.json');
const integration = require('./attributes/integration.json');
const professionalism = require('./attributes/professionalism.json');
const quality = require('./attributes/quality.json');
const quantity = require('./attributes/quantity.json');

app = express();
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());


app.post('/', (req, res) => {
    const text = req.body.text;
    const natural_language_understanding = new NaturalLanguageUnderstandingV1({
        'username': '22fab62b-be9c-4e4b-9c06-d3ff3735d143',
        'password': 'URHUq57trTKV',
        'version': '2018-03-16'
    });
    const parameters = {
        'text': text,
        'language': "en",
        'features': {
            'keywords': {
                'emotion': true,
                'sentiment': true,
                'limit': 10
            },
            'semantic_roles': {
                'keywords': true,
                'limit': 5
            },
            'relations': {
                'model': 'en-news'
            },
        }
    }

    natural_language_understanding.analyze(parameters, async function(err, response) {
        if (err){
            res.json({'error': err})
        }
        else {
            // console.log(response.semantic_roles[0].object.keywords, "\n ************");
            // console.log("=========\n\n", response.keywords);
            // const actions = response.semantic_roles;
            const result = await getWordsThatMatch(response);
            res.json(result);
        }
    });

});

const intersect = (array1, array2) =>
    array1.filter(text => -1 !== array2.map(item => item.word).indexOf(text));

const getWordsThatMatch = async (parameters) => {
    const result = {};
    let allMatchedWordsForCommunication = [];
    let allMatchedWordsForInitiative = [];
    let allMatchedWordsForIntegration = [];
    let allMatchedWordsForProfessionalism = [];
    let allMatchedWordsForQuality = [];
    let allMatchedWordsForQuantity = [];

    for (let item of parameters.keywords) {
        words = item.text;
        const word = words.replace(" ", "+");
        const response =  await axios.get(`https://api.datamuse.com/words?ml=${word}`);

        const matchedWordsCommunication = intersect(communication, response.data);
        allMatchedWordsForCommunication.push(...matchedWordsCommunication);

        const matchedWordsInitiative = intersect(initiative, response.data);
        allMatchedWordsForInitiative.push(...matchedWordsInitiative);

        const matchedWordsIntegration = intersect(integration, response.data);
        allMatchedWordsForIntegration.push(...matchedWordsIntegration);

        const matchedWordsProfessionalism = intersect(professionalism, response.data);
        allMatchedWordsForProfessionalism.push(...matchedWordsProfessionalism);

        const matchedWordsQuality = intersect(quality, response.data);
        allMatchedWordsForQuality.push(...matchedWordsQuality);

        const matchedWordsQuantity = intersect(quantity, response.data);
        allMatchedWordsForQuantity.push(...matchedWordsQuantity);
    }

    for (let item of parameters.semantic_roles) {
        words = item.action.text;
        const word = words.replace(" ", "+");
        const response =  await axios.get(`https://api.datamuse.com/words?ml=${word}`);

        const matchedWordsCommunication = intersect(communication, response.data);
        allMatchedWordsForCommunication.push(...matchedWordsCommunication);

        const matchedWordsInitiative = intersect(initiative, response.data);
        allMatchedWordsForInitiative.push(...matchedWordsInitiative);

        const matchedWordsIntegration = intersect(integration, response.data);
        allMatchedWordsForIntegration.push(...matchedWordsIntegration);

        const matchedWordsProfessionalism = intersect(professionalism, response.data);
        allMatchedWordsForProfessionalism.push(...matchedWordsProfessionalism);

        const matchedWordsQuality = intersect(quality, response.data);
        allMatchedWordsForQuality.push(...matchedWordsQuality);

        const matchedWordsQuantity = intersect(quantity, response.data);
        allMatchedWordsForQuantity.push(...matchedWordsQuantity);
    }

    result.communication = [ ...new Set(allMatchedWordsForCommunication) ];
    result.initiative = [ ...new Set(allMatchedWordsForInitiative) ];
    result.integration = [ ...new Set(allMatchedWordsForIntegration) ];
    result.professionalism = [ ...new Set(allMatchedWordsForProfessionalism) ];
    result.quality = [ ...new Set(allMatchedWordsForQuality) ];
    result.quantity = [ ...new Set(allMatchedWordsForQuantity) ];

    return result;
}

module.exports = app;




