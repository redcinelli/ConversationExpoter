var express = require('express');
const fs = require('fs');
var router = express.Router();
const conversationToCsv = require('../tooling/conversationtocsv');

/* GET users listing. */
router.get('/listworkspace', function(req, res, next) {
  console.log(req.query);
  var username = req.query.username;
  var password = req.query.password;
  if(!password || !username || username == '' || password == ''){
    console.log("pop",username,password);
    res.status(406).send("I need the username & password");
  }else {
    conversationToCsv.listingWorkspace(username,password)
    .then((listworkspace)=>{
      res.status(200).send(listworkspace)
    }).catch((err)=>{
      console.log(err);
      res.status(500).send(err)
    })
  }
});

router.get('/exportworkspace', function(req, res, next) {
  console.log(req.query);
  var username = req.query.username;
  var password = req.query.password;
  var workspace_id =  req.query.workspace_id;
  if(!password || !username || username == '' || password == ''|| !workspace_id || workspace_id == ''){
    console.log("pop",username,password);
    res.status(406).send("I need the username & password");
  }else {
    conversationToCsv.exportWorspace(username,password,workspace_id)
    .then((pathFile)=>{
      pathFile = pathFile.split('public')[1];
      res.status(200).send(pathFile)
    }).catch((err)=>{
      console.log(err);
      res.status(500).send(err)
    })
  }
}).post('/exportworkspace',function(req, res) {
  var importedJson = JSON.parse(req.body.data)
  console.log(importedJson.plop);
  if(!importedJson ||importedJson == '' || importedJson == {}){
    res.status(406).send("The data sended was empty")
  }else {
    conversationToCsv.uploadJSONtoxlsx(importedJson)
    .then((pathFile)=>{
      pathFile = pathFile.split('public')[1];
      res.status(200).send(pathFile)
    }).catch((err)=>{
      console.log(err);
      res.status(500).send(err)
    })
  }
});

module.exports = router;
