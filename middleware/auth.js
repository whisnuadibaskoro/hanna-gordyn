function auth(
req,
res,
next
){

    if(
        req.session.login
    ){

        return next();

    }

    res.redirect("/admin");

}

module.exports = auth;