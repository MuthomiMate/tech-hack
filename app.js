const express = require('express');
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors')
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
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

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
            'sentiment': {}
        }
    }

    natural_language_understanding.analyze(parameters, async function(err, response) {
        if (err){
            res.json({'error': err})
        }
        else {
            const result = await getWordsThatMatch(response);
            res.json(result);
        }
    });

});

const intersect = (array1, array2) =>
    array1.filter(text => -1 !== array2.map(item => item.word).indexOf(text));

const getWordsThatMatch = async (parameters) => {
    const result = { overallSentiment: parameters.sentiment.document.label };
    let allMatchedWordsForCommunication = [];
    let allMatchedWordsForInitiative = [];
    let allMatchedWordsForIntegration = [];
    let allMatchedWordsForProfessionalism = [];
    let allMatchedWordsForQuality = [];
    let allMatchedWordsForQuantity = [];

    for (let item of parameters.keywords) {
        words = item.text;
        const word = words.replace(" ", "+");
        const response =  await axios.get(`https://api.datamuse.com/words?ml=${word}&max=50`);

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

        const sentimentResponse =  await axios.get(`https://api.datamuse.com/words?rel_trg=${word}`);
        const sentimentWordsCommunication = intersect(communication, sentimentResponse.data);
        const sentimentWordsInitiative = intersect(initiative, sentimentResponse.data);
        const sentimentWordsIntegration = intersect(integration, sentimentResponse.data);
        const sentimentWordsProfessionalism = intersect(professionalism, sentimentResponse.data);
        const sentimentWordsQuality = intersect(quality, sentimentResponse.data);
        const sentimentWordsQuantity = intersect(quantity, sentimentResponse.data);
        result.attributePresence = {
            communication: sentimentWordsCommunication.length > 0 ? true : false,
            initiative: sentimentWordsInitiative.length > 0 ? true : false,
            integration: sentimentWordsIntegration.length > 0 ? true : false,
            professionalism: sentimentWordsProfessionalism.length > 0 ? true : false,
            quality: sentimentWordsQuality.length > 0 ? true : false,
            quantity: sentimentWordsQuantity.length > 0 ? true : false,
        }
    }

    result.communication = allMatchedWordsForCommunication;
    result.initiative = allMatchedWordsForInitiative;
    result.integration = allMatchedWordsForIntegration;
    result.professionalism = allMatchedWordsForProfessionalism;
    result.quality = allMatchedWordsForQuality;
    result.quantity = allMatchedWordsForQuantity;

    return result;
}

module.exports = app;