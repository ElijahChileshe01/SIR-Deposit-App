const { urlencoded } = require('express');
const express = require('express');
const bodyparser = require('body-parser');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../models/auth');


const User = require('../models/User.model');


// view all users page//
//config page

router.get('/config', (req, res) => {


    User.find((err, users) => {
        if (!err) {
            res.render('userview/config', {
                users: users
            });


        } else { console.log('err in getting all users' + err) }
    });
});



//view single user page
router.get('/viewuser/:id', (req, res) => {
    //console.log(req.params.id);
    User.findById(req.params.id, function(err, pla) {
        if (!err) {
            console.log(pla);


            res.render('userview/viewuser', { use: pla });


        } else {
            console.log(err);
        }
    });

});



//admin update user pointer to the form
router.get('/update/:id', (req, res) => {

    //console.log(req.params.id);
    User.findById(req.params.id, (err, plb) => {
        if (!err) {
            console.log(plb);
            res.render('userview/update', {
                us: plb
            })
        }
    })
});

//admin update user /edit user handle 
router.post('/update/:id', function(req, res) {


    const udata = {
        //id: req.body.id,
        name: req.body.name,
        email: req.body.email
    }

    User.findByIdAndUpdate(req.params.id, udata, (err) => {
        if (err) {
            console.log(err);
            res.redirect('update/' + req.params.id);
        } else {
            res.redirect('../config');
        }
    });



});



//delete entry
router.get('/delete/:id', (req, res) => {

    User.findByIdAndDelete(req.params.id, function(err, project) {
        if (err) {
            res.redirect('/config');
        } else {
            res.redirect('/user/config');
        }
    })


});



//about page
router.get('/about', (req, res) => {

    res.render('userview/about');
});

//submissions page
router.get('/submissions', (req, res) => {
    res.render('userview/submissions');
});


//user profile page
router.get('/userprofile/:id', (req, res) => {



    User.findById(req.params.id, (err, userin) => {
        if (!err) {
            console.log(userin);
            res.render('userview/userprofile', {
                user: userin
            });
        }
    });



});


// user update userprofile page 
router.get('/updateprofile/:id', (req, res) => {


    User.findById(req.params.id, (err, pll) => {
        if (!err) {
            //console.log(pll);
            res.render('userview/updateprofile', {
                userss: pll
            });
        }
    });





});

// update userprofile handle
router.post('/updateprofile/:id', function(req, res) {


    const wdata = {
        id: req.body.id,
        name: req.body.name,
        email: req.body.email
    }

    User.findByIdAndUpdate(req.params.id, wdata, (err) => {
        if (err) {
            console.log(err);
            res.redirect('update/' + req.params.id);
        } else {
            res.redirect('../config');
        }
    });


});



//change password page
router.get('/changepassword', (req, res) => {
    res.render('changepassword');
});




//help page
router.get('/help', (req, res) => {
    res.render('help');
});



// add user
router.get('/adduser', ensureAuthenticated, (req, res) => res.render('userview/adduser'));

//register page
router.get('/register', (req, res) => res.render('userview/register'));

//register handle

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    //check requied fields
    if (!name || !email || !password) {
        errors.push({ msg: 'please fill in all fields' });

    }

    // check pasword length
    if (password.length < 6) {
        errors.push({ msg: "password should be 6 characters long " });
    }

    // checking password match 
    if (password !== password2) {
        errors.push({ msg: "password did not match" });
    }

    //chking if their are errors then send the ryt mass here
    if (errors.length > 0) {
        res.render('userview/register', {
            errors,
            name,
            email,
            password

        });
    } else {
        const newUser = new User({
                name,
                email,
                password

            })
            //cheching if the valus are beig passon here
            //console.log(newUser);
            //res.send(req.body);
            //Hash pass here//
        bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //set pass to hashed here
            newUser.password = hash;
            // saving the new instance in the database here
            newUser.save()
                .then(user => {
                    req.flash('success_msg', 'successefully registered')
                    res.redirect('login');

                })
                .catch(error => {
                    if (error.code === 11000) {
                        req.flash('error_msg', 'this email is already registered')
                        res.redirect('register');

                    }
                    throw error;
                })
        }));




    }




});

//login page
router.get('/login', (req, res) => {
    res.render('userview/login');
});



// login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: 'dashboard',
        failureRedirect: 'login',
        failureFlash: true
    })(req, res, next);
});


//dashboard page
router.get('/dashboard', ensureAuthenticated, (req, res) => {


    res.render('userview/dashboard', {
        //req.params.id
        name: req.user.name,
        id: req.user.id

    });

});







//logout handle
//logout page
router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', 'you have logged out');
    res.redirect('login');
});

//google auth goes here

router.get('/auth/google', passport.authenticate('google', {
    scope: ['email', 'profile']
}));

router.get('auth/google/callbak', passport.authenticate('google', {
    successRedirect: 'dashboard',
    failureRedirect: 'login',
    msg: 'email not registered with google'
}));


//  model settings page

router.get('/modelsettings', (req, res) => {

    res.render('userview/model');

});


// institution repository settings

router.get('/irsettings', (req, res) => {

    res.render('userview/irsettings');
});



module.exports = router;