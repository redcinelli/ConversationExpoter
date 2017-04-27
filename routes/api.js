var express = require('express');
const fs = require('fs');
var router = express.Router();
const conversationToCsv = require('../tooling/conversationtocsv');

/* GET users listing. */
router.get('/listworkspace', function(req, res, next) {
  console.log(req.query);
  let {username} = req.query;
  let {password} = req.query;
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
  let {username} = req.query;
  let {password} = req.query;
  let {workspace_id} =  req.query;
  if(!password || !username || username == '' || password == ''|| !workspace_id || workspace_id == ''){
    console.log("pop",username,password);
    res.status(406).send("I need the username & password");
  }else {
    conversationToCsv.exportWorspace(username,password,workspace_id)
    .then((pathFile)=>{
      res.status(200).send(pathFile)
    }).catch((err)=>{
      console.log(err);
      res.status(500).send(err)
    })
  }
});

module.exports = router;
