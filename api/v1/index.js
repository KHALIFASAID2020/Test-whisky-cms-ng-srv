const express=require('express');
const router = express.Router();

const Blogpost=require('../models/blogpost');
const mongoose = require('mongoose');

const multer = require('multer');
const crypto = require('crypto');
const path = require('path');



router.get('/ping',(req,res)=>{
	res.status(200).json({msg :'pong',date: new Date});
});//localhost:3000/ping

router.get('/blog-posts',(req,res)=>{
//res.status(200).json({msg:'khalifa said'});
Blogpost.find()
 .sort({'createdOn' : -1})
 .exec()
 .then(blogPosts =>res.status(200).json(blogPosts))
 .catch(err=>res.status(500)
 .json({message : 'blog post not found :<', error : err}));
    
});

const storage = multer.diskStorage({
	destination: '',
	filename: function (req, file, callback) {
		crypto.pseudoRandomBytes(16000000, function(err, raw) {
			if (err) return callback(err);
			callback(null, raw.toString('hex') + path.extname(file.originalname));
		});
	}
});

var upload = multer({storage: storage});

// file upload route
router.post('/blog-posts/images', upload.single('blogimage'), (req, res) => {
	// console.log('req.file', req.file);
	if (!req.file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
		return res.status(400).json({ msg: 'only image files please'});
	}
	res.status(201).send({ fileName: req.file.filename, file: req.file });
});




router.post('/blog-posts',(req,res)=>{
    console.log('req.body',req.body);
    const blogPost = new Blogpost(req.body);

    blogPost.save((err,blogPost)=>{
        if(err){
            return res.status(500).json(err);
        }
        res.status(201).json(blogPost);
    });
    
});

router.get('/blog-posts/:id',(req,res)=>{
    const id=req.params.id;
    Blogpost.findById(id)
        .then(blogPost =>res.status(200).json(blogPost))
        .catch(err=>res.status(500).json({message:`blog post with id ${id} not found` , error : err}));
});

router.delete('/blog-posts/:id',(req,res)=>{
    const id=req.params.id;
    Blogpost.findByIdAndDelete(id,(err,blogPost)=>{
        if(err){
            return res.status(500).json(err);
        }
        res.status(202).json({
         msg : `blog post with id ${blogPost._id} deleted`
        });
    });
});

router.delete('/blog-posts', (req, res) => {
	// retrieves the query parameter: http://localhost:3000/api/v1/blog-posts?ids=5c1133b8225e420884687048,5c1133b6225e420884687047
	const ids = req.query.ids;
	console.log('query allIds', ids);
	const allIds = ids.split(',').map(id => {
		// casting as a mongoose ObjectId	
		if (id.match(/^[0-9a-fA-F]{24}$/)) {
			return mongoose.Types.ObjectId((id));		 
		}else {
			console.log('id is not valid', id);
			return -1;
		}
	});
	const condition = { _id: { $in: allIds} };
	Blogpost.deleteMany(condition, (err, result) => {
		if (err) {
			return res.status(500).json(err);
		}
		res.status(202).json(result);
	});
});
module.exports=router;
