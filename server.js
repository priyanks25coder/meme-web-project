const express = require('express');
const { Validator } = require('node-input-validator');
const swaggerJsDoc=require('swagger-jsdoc');
const swaggerUI=require('swagger-ui-express');
const mysql=require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT=process.env.PORT||9000;
app.set(PORT);

var http = require('http');
var fs = require('fs');

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
                     "text/plain"
                 ],
                 "responses": {
                     "201": {
                         "description": "Created",
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
                   "201": {
                       "description": "Created",
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
                     "type": "integer"
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

app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocs));

// app.get('/', (req, res) => {
//     res.send('Just for testing!!');
// });

app.post('/memes', (req, res) => {
   const v = new Validator(req.body, {
      name: 'required|minLength:4',
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
            host:'sql12.freemysqlhosting.net', 
            port:'3306',
            user:'sql12391248',
            password:'zMuBmBRUpq',
            database:'sql12391248'   
         
         //LOCALHOST
         //    host:'localhost',
         //    port:'3310',
         //    user:'root',
         //    password:'',
         //    database:'xmeme'   
         }); 
         conn.connect();
         var sql1="INSERT INTO meme(Name,Caption,URL) VALUES (?)";
         var values=[[name,cap,url]];
         conn.query(sql1,values,(err1,result1) => {
            if(err1){
               if(err1.code=="ER_DUP_ENTRY"){
                  console.log(err1);
                  console.log('Duplicate Entry');
                  res.sendStatus(403);
                  res.end();
               }
               else{
                  console.log("insert "+err1);
                  res.sendStatus(500);
                  res.end();
               }
            }
            else{
               console.log("Record Added");
               res.sendStatus(201);
               res.end();
            }
         });
         console.log(meme);
         conn.end();
      }
   });
});

app.get('/memes', (req, res) => {
   var sql="SELECT * FROM meme ORDER BY ID DESC LIMIT 100";
   const conn=mysql.createConnection({
      host:'sql12.freemysqlhosting.net', 
      port:'3306',
      user:'sql12391248',
      password:'zMuBmBRUpq',
      database:'sql12391248'   
   
   //LOCALHOST
   //    host:'localhost',
   //    port:'3310',
   //    user:'root',
   //    password:'',
   //    database:'xmeme'   
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

app.get('/memes/:id',(req, res) => {
   const conn=mysql.createConnection({
      host:'sql12.freemysqlhosting.net', 
      port:'3306',
      user:'sql12391248',
      password:'zMuBmBRUpq',
      database:'sql12391248'   
   
   //LOCALHOST
   //    host:'localhost',
   //    port:'3310',
   //    user:'root',
   //    password:'',
   //    database:'xmeme'   
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

app.patch('/memes/:id',(req, res) => {

   const v = new Validator(req.body, {
      name: 'required|minLength:4',
      caption: 'required|minLength:4',
      url: 'required|url'
   });
  
   v.check().then((matched) => {
      if (!matched) {
         res.status(400).send(v.errors);
      }
      else{
         const conn=mysql.createConnection({
            host:'sql12.freemysqlhosting.net', 
            port:'3306',
            user:'sql12391248',
            password:'zMuBmBRUpq',
            database:'sql12391248'   
         
         //LOCALHOST
         //    host:'localhost',
         //    port:'3310',
         //    user:'root',
         //    password:'',
         //    database:'xmeme'   
         });
         var sql="UPDATE meme SET CAPTION='"+req.body.caption+"', URL='"+req.body.url+"' WHERE ID="+req.params.id;
         conn.connect();
         conn.query(sql,(err,result) => {
            if(err){
               res.sendStatus(404);
               return res.json({
                  errors: ['User not found']
               });
            }
            console.log("Record Updated");
            console.log(req.body.caption);
            console.log(req.body.url);
            res.sendStatus(200);
            res.end();
         });
         conn.end();
      }
   });
});

app.all('*', (req, res, next) => {
   res.sendStatus(404);
   res.end();
});

app.listen((''+PORT),() =>{
   console.log("Port Connected....");
});