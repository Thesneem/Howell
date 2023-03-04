const usermodel = require("../models/usermodel");

module.exports = {
  ajaxSession: async (req, res, next) => {
    if (req.session.userlogged) {
      res.locals.userdata = await usermodel.findOne({
        email: req.session.useremail,
      });
     
      next();
    } else {
      res.json("LOGIN FIRST");
    }
  },
};