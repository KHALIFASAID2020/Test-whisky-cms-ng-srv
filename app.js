const express=require('express');
const app=express();
const api=require('./api/v1/index');
const bodyParser = require('body-parser');
const cors=require('cors');

const mongoose=require('mongoose');
const connection=mongoose.connection;

app.set('port',(process.env.port||3000));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());
app.use('/api/v1',api);//localhost:3000/api/v1

mongoose.connect('mongodb://localhost:27017/whiskycmsbis',{useNewUrlParser:true});
connection.on('error',(err)=>{
	console.error(`connection to mongodb error: ${err.message}`);
});
connection.once('open',()=>{
	console.log('connected mongoDB');

	app.listen(app.get('port'),()=>{
		console.log(`express server ecoute sur le port  ${app.get('port')} !!!`);
	});
});
