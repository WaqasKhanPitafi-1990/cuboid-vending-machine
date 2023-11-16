const jwt = require("jsonwebtoken");
const usermodel = require("../model/userModel");

const Auth = (role) => {
    async (req, res, next) => {
        try {
            if (!req.header("Authorization")) {
                return res.json({
                    success: false,
                    message: "Please pass token in header"
                })
            }
            const token = req.header("Authorization").replace("Bearer ", "");

            const verify = jwt.verify(token, "secret");

            if (!verify) {
                return res.json({ message: "user don't have accesss" });
            }

            const id = verify.data;

            usermodel.findById(id).select("name email _id phone role")
                .then((data) => {
                    // console.log(data)
                    req.user = data;
                    next();
                });
        } catch (err) {
            res.json({ success:false,message: "user don't have Access" });
        }
    };
}
module.exports = Auth;
