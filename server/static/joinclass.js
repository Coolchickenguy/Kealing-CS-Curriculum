module.exports = function ({app, getStatic, UserManager, banned}) {
    app.get('/joinclass', async function(req, res) {
        if (!username || !token) {
            res.redirect('/login');
            return;
        }

        if (!UserManager.checkLogin(username, token)) {
            res.redirect('/login');
            return;
        }

        if (await banned({UserManager, getStatic, res, username})) {
            return;
        }

        res.sendFile(getStatic('docs/joinclass.html'));
        //res.redirect('/login');
    });
}