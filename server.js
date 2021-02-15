const express = require('express');
const { Validator } = require('node-input-validator');
const swaggerJsDoc=require('swagger-jsdoc');
const swaggerUI=require('swagger-ui-express');
const mysql=require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
require("dotenv").config();

const app = express();
const sapp=express();
const PORT=process.env.PORT || 8081;
const SPORT=8080;
const HOST= process.env.HOST || 'localhost';
const DB_USER= process.env.DB_USER || 'root';
const DB_PASS= process.env.DB_PASS || '' ;
const DB_DATABASE='xmeme';
const DB_PORT=process.env.DB_PORT || '3306';
var path=require('path');

app.set(PORT);
sapp.set(SPORT);
console.log("start!!");

const swaggerOptions={
   swaggerDefinition:{
      openapi: '3.0.0',
      info:{
         title:'Meme API',
         version:'1.0.0',
         description:"Meme website API's made with Express and using REST API",
         license: {
            name: 'Licensed Under MIT',
            url: 'https://spdx.org/licenses/MIT.html',
         },
      },
      "tags": [
         {
             "name": "Memes",
             "description": "API for memes"
         }
     ],
     "consumes": [
         "application/json"
     ],
     "produces": [
         "application/json"
     ],
     "paths": {
         "/memes": {
             "get": {
                 "tags": [
                     "Memes"
                 ],
                 "summary": "Get latest 100 memes in system",
                 "responses": {
                     "200": {
                         "description": "OK",
                         "schema": {
                             "$ref": "#/definitions/Memes"
                         }
                     }
                 }
             },
             "post": {
                 "tags": [
                     "Memes"
                 ],
                 "summary": "Create a new meme",
                 "requestBody": {
                     "description": "Meme Object",
                     "required": true,
                     "content": {
                         "application/json": {
                             "schema": {
                                 "$ref": "#/definitions/Meme"
                             }
                         }
                     }
                 },
                 "produces": [
                    "application/json"
                 ],
                 "responses": {
                    "200": {
                        "description": "Created",
                        "schema": {
                            "$ref": "#/definitions/id"
                        }
                    },
                    "400" :{
                        "description" : "Bad Request",
                    },
                    "500": {
                         "description": "Server Error"
                    }
                 }
             }
         },
         "/memes/{id}": {
             "parameters": [
                 {
                     "name": "id",
                     "in": "path",
                     "required": true,
                     "description": "ID of the meme",
                     "type": "integer"
                 }
             ],
             "get": {
                 "tags": [
                     "Memes"
                 ],
                 "summary": "Get meme with given ID",
                 "parameters": [
                     {
                         "in": "path",
                         "name": "id",
                         "required": true,
                         "description": "Meme with id",
                         "schema": {
                             "$ref": "#/definitions/id"
                         }
                     }
                 ],
                 "responses": {
                     "200": {
                         "description": "OK",
                         "schema": {
                             "$ref": "#/definitions/Meme"
                         }
                     },
                     "404": {
                         "description": "Meme not found."
                     }
                 }
             },
             "patch": {
               "tags": [
                   "Memes"
               ],
               "summary": "Update meme",
               "requestBody": {
                   "description": "Meme Object",
                   "required": true,
                   "content": {
                       "application/json": {
                           "schema": {
                               "$ref": "#/definitions/UMeme"
                           },
                       }
                   }
               },
               "produces": [
                   "text/plain"
               ],
               "responses": {
                   "200": {
                       "description": "Updated",
                   },
                   "400" :{
                        "description" : "Bad Request",
                   },
                   "500": {
                       "description": "Server Error"
                   }
               }
           }
         }
     },
     "definitions": {
         "id": {
             "properties": {
                 "id": {
                     "type": "string"
                 }
             }
         },
         "Meme": {
             "type": "object",
             "properties": {
                 "name": {
                     "type": "string"
                 },
                 "caption": {
                     "type": "string"
                 },
                 "url": {
                     "type": "string",
                     "format": "url"
                 }
             }
         },
         "UMeme": {
            "type": "object",
            "properties": {
                "caption": {
                    "type": "string"
                },
                "url": {
                    "type": "string",
                    "format": "url"
                }
            }
        },
         "Memes": {
             "type": "object",
             "properties": {
                 "memes": {
                     "type": "object",
                     "additionalProperties": {
                         "$ref": "#/definitions/Meme"
                     }
                 }
             }
         }
     } 
   },
   apis:['server.js'],
};

const swaggerDocs=swaggerJsDoc(swaggerOptions);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

sapp.use('/swagger-ui',swaggerUI.serve,swaggerUI.setup(swaggerDocs));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/index.html'));
});

app.post('/memes', async function(req, res){
   const v = new Validator(req.body, {
      name: 'required|minLength:2',
      caption: 'required|minLength:4',
      url: 'required|url'
   });
  
   v.check().then((matched) => {
      if (!matched) {
         res.status(400).send(v.errors);
      }

      else{
         const meme=req.body;
         const name=""+req.body.name;
         const cap=""+req.body.caption;
         const url=""+req.body.url;
         const conn=mysql.createConnection({
            host:HOST, 
            port:DB_PORT,
            user:DB_USER,
            password:DB_PASS,
            database:DB_DATABASE,
            multipleStatements:true
         //LOCALHOST
         //    host:'localhost',
         //    port:'3310',
         //    user:'root',
         //    password:'',
         //    database:'xmeme'   
         }); 
         var sql1="INSERT INTO meme(Name,Caption,URL) VALUES (?); SELECT id FROM meme  WHERE name='"+name+"' and caption='"+cap+"' and url='"+url+"'";
         var values=[[name,cap,url]];
         conn.query(sql1,values,(err1,result1) => {
            if(err1){
               if(err1.code=="ER_DUP_ENTRY"){
                  console.log(err1);
                  console.log('Duplicate Entry');
                  res.status(403).send("Duplicate Entry");
               }
               else{
                  console.log("insert "+err1);
                  res.status(500).send("Server Error");
               }
            }
            else{
                res.json(result1[1]);
                res.status(200); 
            }
            res.end();
        });
        console.log(meme);
        conn.end();
      }
   });
});

app.get('/memes', async function(req, res){
   var sql="SELECT * FROM meme ORDER BY ID DESC LIMIT 100";
   const conn=mysql.createConnection({
      host:HOST, 
      port:DB_PORT,
      user:DB_USER,
      password:DB_PASS,
      database:DB_DATABASE     
   });
   conn.connect();
   conn.query(sql,(err,result) => {
      if(err){
         res.sendStatus(500);
         return res.json({
            errors: ['Something went wrong']
         });
      }
      if(!result){
         res.json([]);
         res.end();      
      }
      else{
         
        console.log(result);
        res.json(result);
        res.end();
      }
   });
   conn.end();
});

app.get('/memes/:id',async function(req, res){
   const conn=mysql.createConnection({
    host:HOST, 
    port:DB_PORT,
    user:DB_USER,
    password:DB_PASS,
    database:DB_DATABASE
   });
   var sql="SELECT * FROM meme WHERE Id ="+req.params.id;
   conn.connect();
   conn.query(sql,(err,result) => {
      if(err){
         res.sendStatus(500);
         return res.json({
            errors: ['Something went wrong']
         });      
      }
      if(result.length==0){
         res.sendStatus(404);
         res.end();
      }
      else{
         res.json(result);
         res.end();
      }
   });
   conn.end();
   // var sm=memes[Number(req.params.id)-1];
   // if(!sm){
   //    res.end("No entry with this Id!!");
   // }
   // else{
   //    res.json(sm);
   // }

});

app.patch('/memes/:id',async function(req, res){

   const v = new Validator(req.body, {
      caption: 'required|minLength:4',
      url: 'required|url'
   });
  
   v.check().then((matched) => {
      if (!matched) {
         res.status(400).send(v.errors);
      }
      else{
         const conn=mysql.createConnection({
            host:HOST, 
            port:DB_PORT,
            user:DB_USER,
            password:DB_PASS,
            database:DB_DATABASE,
            multipleStatements:true
         });
         var sql="SELECT ID FROM meme WHERE ID="+req.params.id+";UPDATE meme SET CAPTION='"+req.body.caption+"', URL='"+req.body.url+"' WHERE ID="+req.params.id;
         conn.connect();
         conn.query(sql,(err,result) => {
            if(err){
                if(err.code=="ER_DUP_ENTRY"){
                    console.log('Duplicate Entry');
                    res.status(403).send('Duplicate Entry');
                }
                else{
                    console.log('Server Error');
                    res.status(500).send('Server Error');
                }
            }
            else {
                if(result[0].length==0){
                    console.log('No such entry');
                    res.status(403).send('No entry with this id');
                }
                else{
                    console.log("Updated!!");
                    res.status(200).send("Updated!!");
                }
            }
            res.end();
         });
         conn.end();
      }
   });
});

app.all('*', async function(req, res, next){
   res.sendStatus(404);
   res.end();
});

sapp.listen((''+SPORT),async function(){
    console.log('swagger listening!!');
});

app.listen((''+PORT),async function(){
   console.log("Port Connected....");
});