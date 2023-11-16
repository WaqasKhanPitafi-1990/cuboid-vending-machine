const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const userModel = require('../model/userModel');
// var opts = {};

module.exports = function (passport) {
    console.log('Hello');
    passport.use(
        new JwtStrategy({
            secretOrKey: 'secret',
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        },
            function (jwt_payload, cb) {


                userModel.findById(jwt_payload.data).select('name email _id phone').then(data => {
                    if (data) {
                        cb(null, data);
                    } else {
                        return cb(null, false);
                    }
                }).catch(err => cb(null, false));
                // cb(null, false)
                // cb(new Error('user not found'), null)
            }
        )
    );
};


// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = 'secret';
// opts.issuer = 'accounts.examplesoft.com';
// opts.audience = 'yoursite.net';
// passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
//     User.findOne({ id: jwt_payload.sub }, function (err, user) {
//         if (err) {
//             return done(err, false);
//         }
//         if (user) {
//             return done(null, user);
//         } else {
//             return done(null, false);
//             // or you could create a new account
//         }
//     });
// }));