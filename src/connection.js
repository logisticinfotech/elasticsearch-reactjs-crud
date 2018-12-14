var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: 'http://localhost:9200',
    requestTimeout: Infinity, // Tested
    keepAlive: true // Tested
});

module.exports = client;