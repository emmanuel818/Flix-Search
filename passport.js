const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

//Defines basic HTTP authentication for login requests
passport.use(new LocalStrategy ({
    //Takes a username and password from the request body
    usernameField: 'Username',
    passwordField: 'Password'
}, (username, password, callback) => {
    console.log(username + ' ' + password);
    //Uses Mongoose to check database for a user with the same username
    Users.findOne({ Username: username }, (error, user) => {
        if (error) {
            console.log(error);
            return callback(error);
        }
        // If username can't be found send back error message
        if (!user) {
            console.log('incorrect username');
            return callback(null, false, { message: 'Incorrect username'});
        }
        if (!user.validatePassword(password)) {
            console.log('incorrect password');
        }
        
        console.log('finished');
        return callback(null, user);
    });
}));

//Authenticate users based on JWT submitted alongside request
passport.use(new JWTStrategy ({
    //JWT extracted from the header of the HTTP request
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    // Verifies the signature of the JWT making sure the sender is who he says he is
    secretOrKey: 'your_jwt_secret'
}, (jwtPayload, callback) => {
    return Users.findById(jwtPayload._id)
    .then((user) => {
        return callback(null, user);
    })
    .catch((error) => {
        return callback(error)
    });
}));