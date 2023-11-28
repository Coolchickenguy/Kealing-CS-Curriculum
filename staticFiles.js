var path = require('path');

module.exports = function (app, db) {
    app.get('/', function(req, res){
        res.sendFile(path.join(__dirname, 'docs', 'IDE.html'));
    });

    app.get('/tree', function(req, res){
        res.sendFile(path.join(__dirname, 'docs', 'tree.html'));
    });

    app.get('/login', function(req, res){
        res.sendFile(path.join(__dirname, 'docs', 'login.html'));
    });

    app.get('/createAccount', function(req, res) {
        res.sendFile(path.join(__dirname, 'docs', 'createAccount.html'));
    })
     
    app.get("/static/*", function(req, res) {
        res.sendFile(path.join(__dirname, 'static', req.params['0']));
    });

    app.get("/docs/*", function(req, res) {
        res.sendFile(path.join(__dirname, 'docs', req.params['0']));
    });
}