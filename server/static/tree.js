module.exports = function ({app, getStatic, UserManager, banned}) {
    app.get('/tree', async function(req, res) {
        const username = req.cookies.username;
        const token = req.cookies.token;

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

        res.sendFile(getStatic('docs/tree.html'));
    });
}