var mysql= require('mysql');

var conn=mysql.createConnection({
    host:'localhost',
    user:'root',
    port: '3306',
    password:'',
    multipleStatements: true
});

conn.connect((err)=>{
    if(err){
        console.log(err);
        throw err;
    }
    else{
        console.log("Connected!!");
    }
});

sql="DROP DATABASE IF EXISTS xmeme;CREATE DATABASE IF NOT EXISTS xmeme;USE xmeme;CREATE TABLE IF NOT EXISTS `meme` (`ID` int(11) NOT NULL AUTO_INCREMENT,`NAME` varchar(10) NOT NULL,`CAPTION` varchar(100) NOT NULL,`URL` varchar(500) NOT NULL,PRIMARY KEY(`ID`),CONSTRAINT UK_Meme UNIQUE (`NAME`,`CAPTION`,`URL`));";
conn.query(sql,(err,result)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log('created the tables!!');
    }
});

conn.end();