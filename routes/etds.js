const express = require('express');
const router = express.Router();
const ETDmodel = require('../models/ETD.model');
const form = require('../models/ETD.model');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const { urlencoded } = require('body-parser');
const methodOverride = require('method-override');
const expressValidator = require('express-validator');
const { check, validationResult } = require('express-validator');

router.use(bodyParser.urlencoded({extended:true})) 
router.use(bodyParser.json())
//Use methodOverride
router.use(methodOverride(function(req, res){
     if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method
        delete req.body._method
        return method
     }
}))



router.get('/', (req, res) => {
	res.render('etds/index');
});

//define storage for pdf
const storage = multer.diskStorage({
   
//destination for file
   destination:function (req, file, cb) {
		   cb(null, './public')
	   },
   
//add back extention
   filename:function (req, file, cb){
		   cb(null, file.originalname)
           console.log(file)
	   }
 });
   


const maxSize= 5 * 1024 * 1024 // 10 mb PDF size to be uploaded   
//upload parameters from multer
const uploadFile = multer({
    storage: storage,
	fileFilter: (req, file, cb) => {
        if (file.mimetype == 'application/pdf'){
        cb(null, true);
         } else {
        
        cb(('Only PDFS Are to be submitted'), false)
        
     } 
    },
    limits: {fileSize: maxSize}
    })
    
    
router.get('/uploadPdf', (req, res) => {
    res.render('./etds/uploadForm')
})
router.post('/uploadPdf', uploadFile.single('file'), (req, res) =>  {
  
        res.redirect('/etds/metadata')
    

}    
    );
   
   //View Metadata form
router.get('/metadata', (req, res) => {
   res.render('./etds/Form')
});
 
   
   
   //route that handles new post
router.post('/metadata', uploadFile.single('file'), [
    check('Authors_last_name', 'Authors last name is invalid').notEmpty(),
    check('Authors_first_name', 'Authors first name is invalid').notEmpty(),
    check('Computer_Number', 'Computer Number is invalid').isNumeric(),
    check('Supervisors_last_name', 'Supervisors last name is invalid').notEmpty(),
    check('Supervisors_first_name', 'Supervisors first name is invalid').notEmpty(),
    check('Examiners_last_name', 'Examiners last name is invalid').notEmpty(),
    check('Examiners_first_name', 'Examiners first name is invalid').notEmpty(),
    check('Title', 'Title is invalid').notEmpty(),
    check('Publication_Date', 'Publication Date is invalid').notEmpty(), 
    check('Additional_Comment', 'Additional Comment is invalid').notEmpty(),
    check('Level_of_Study', 'Level of Study is invalid').notEmpty(),
    check('Type_of_Publication', 'Type of Publication is invalid').notEmpty(),
    check('Faculty_School', 'School is invalid').notEmpty(),
    check('Department', 'Department is invalid').notEmpty()

], async  (req, res) => {
	 //  console.log(req.file);
	// console.log(req.body);
	   let forms = new ETDmodel ({
	   Authors_last_name: req.body.Authors_last_name,
	   Authors_first_name: req.body.Authors_first_name,
	   Computer_Number: req.body.Computer_Number,
	   Supervisors_last_name: req.body.Supervisors_last_name,
	   Supervisors_first_name: req.body.Supervisors_first_name,
	   Examiners_last_name: req.body.Examiners_last_name,
	   Examiners_first_name: req.body.Examiners_first_name,
	   Title: req.body.Title,
	   Subject: req.body.Subject,
	   Abstract: req.body.Abstract,
	   Publication_Date: req.body.Publication_Date,
	   Additional_Comment: req.body.Additional_Comment,
	   Level_of_Study: req.body.Level_of_Study,
	   Type_of_Publication: req.body.Type_of_Publication,
	   Faculty_School: req.body.Faculty_School,
	   Department: req.body.Department,
       File: req.body.file

	   
	   
   }) 
   {
       const errors= validationResult(req)
       if(!errors.isEmpty()){
           const alert = errors.array()
           res.render('./etds/Form', {
               alert
           })
       }
   }
	   try {
		   forms= await forms.save()
		   console.log(forms)
		   res.redirect('/etds/Confirm/:id');

	   } catch (error) {
		   console.log(error)
          
        }
   });
   
   
//Confirm Details
router.get("/Confirm/:id", (req, res)=>{
        
    ETDmodel.findOne().sort({$natural: -1}).limit(1).exec((err, forms)=>{
        
      if (err){
          console.log(err)
        console.log("Cannot obtain the data")
      }
      else{
          console.log("Successfully rendered user details")
        res.render('./etds/confirm', {Value: forms})
      }
    })
    })




   //view submissions of ETDs
   
router.get('/viewsubmissions', (req, res) => { 
    ETDmodel.find((err, forms) => {
        if (!err) 
        { 
            console.log(forms); 
            res.render('./etds/Submissions', {
                etdList: forms
            });
        } else {
            console.log('Cannot display users details');
        }
    })
})

   
     //view individual users records   
router.get('/viewsubmissions/view/:id', (req, res) => {
    ETDmodel.find({_id: req.params.id}, (err, forms) => {
        if(err) res.json(err);
            else res.render('./etds/individualSub', {etdList: forms});
        });
});


//route to edit a user
router.get('/viewsubmissions/edit/:id', (req, res) =>{
    console.log(req.params.id);
    ETDmodel.findById(req.params.id, (err, forms) => {
      
        if (!err) 
        { 
            console.log(forms); 
            res.render('./etds/editUser', {
                value: forms
            });
        } else {
            console.log("cannot get users");
        }
    })
})

router.put('/viewsubmissions/update/:id', (req, res) =>{
    ETDmodel.findById(req.params.id, (err, value) => {
        if(err){
            res.send(err);
        }else{
            value.Authors_last_name= req.body.Authors_last_name,
            value.Authors_first_name= req.body.Authors_first_name,
            value.Computer_Number= req.body.Computer_Number,
            value.Supervisors_last_name= req.body.Supervisors_last_name,
            value.Supervisors_first_name= req.body.Supervisors_first_name
            value.save((err, saveduser)=>{
                if(err){
                    res.send(err);
                }else{
                    res.redirect('/etds/viewsubmissions');
                    console.log('User updated successfully')
                }
            })    
        }
    })
})

//delete individual users records   
router.get('/viewsubmissions/delete/:id', (req, res) => {
    ETDmodel.findByIdAndDelete({_id: req.params.id}, (err, forms) => {
        if(err) res.redirect('/');
        else res.redirect('/etds/viewsubmissions');
    });
});




module.exports = router;