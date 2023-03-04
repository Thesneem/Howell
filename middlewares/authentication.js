const usermodel = require("../models/usermodel")



module.exports ={
    userSession: async(req, res, next) => {
        if (req.session.logIn ) {
            let userdata= await usermodel.findOne({_id:req.session.userid})
          if(userdata.status == 'unblocked')  {
                next()

            }
            else{
                req.session.logIn = false
                req.session.message = {
                type: 'danger',
                message: 'You are blocked by the admin'
            }
            res.render('error/blockedPage')
            }
        }
        else {
            res.redirect('/login')
        }
    },

    adminSession: (req, res, next) => {
        if (req.session.adminlogIn) {
            next()
        }
        else {
            res.redirect('/admin')
        }
    }
    ,
 
}