module.exports = function ({app, getStatic}) {
    app.get('/', function(req, res) {
        res.sendFile(getStatic('docs/index.html'));
        //res.redirect('/login');
    });
}