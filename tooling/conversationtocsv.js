const readline = require('readline');
const watson = require('watson-developer-cloud');
const xlsxParser = require('./conversation_fromJSONtoCSV');
const cleanner = require('../tooling/cleanner');
const path = require('path');
const fs = require('fs');
const Promise = require("bluebird");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const conversationGateway = [
  "https://gateway-fra.watsonplatform.net/conversation/api",
  "https://gateway.watsonplatform.net/conversation/api"
]

var findgateway = function (username,password){
  return new Promise(function(resolve, reject) {
    var test = [];
    for (gateway of conversationGateway) {
      console.log(`findgateway using ${gateway}`);
      test.push(pingWorkSpaces(username,password,gateway))
    }
    Promise.any(test).then((workspace)=>{
      resolve(workspace)
    }).catch((err)=>{
      reject(err)
    })
  });
}

module.exports.listingWorkspace = function (username,password) {
  return new Promise(function(resolve, reject) {
    findgateway(username, password)
    .then((conversation)=>{
      return getWorkSpaces(conversation)
    })
    .then((infoWorkspaces)=>{
      var wsNameID = {}
      for (ws of infoWorkspaces) {
        wsNameID[ws.name] = ws.workspace_id
      }
      resolve(wsNameID)
    })
    .catch((err)=>{
      reject(err)
    })
  });
};

module.exports.exportWorspace = function (username,password,workspace_id) {
  // we make a bit of space in the tmp directory
  cleanner.manageSize();
  return new Promise(function(resolve, reject) {
    findgateway(username, password)
    .then((conversation)=>{
      return exportWorspace(conversation,workspace_id)
    })
    .then((fullworkspace)=>{
      var nameFile = Date.now()+`.xlsx`;
      var pathFile = path.join(__dirname,'..','public','tmp',nameFile);
      xlsxParser.formatXLSX(fullworkspace,pathFile)
      resolve(pathFile);
    })
    .catch((err)=>{reject(err)});
  });
};

module.exports.uploadJSONtoxlsx = function (data) {
  cleanner.manageSize();
  return new Promise(function(resolve, reject) {
    var nameFile = Date.now()+`.xlsx`;
    var pathFile = path.join(__dirname,'..','public','tmp',nameFile);
    console.log('starting parse of the json');
    console.log(data.name);
    xlsxParser.formatXLSX(data,pathFile)
    resolve(pathFile);
  });
};

function chooseWorkspace(workspaces){
  return new Promise(function(resolve, reject) {
    var listWorkspace = []
    var selectedWorkspace = {}
    workspaces.forEach(function(workspace,index,array) {
      listWorkspace.push(workspace.name);
      console.log(`${index} : ${workspace.name}`);
    })
    rl.question(`which workspace you need to DL ?\n`, (answer) => {
      selectedWorkspace = workspaces.filter((ws)=>{return ws.name == listWorkspace[answer]})[0];
      resolve(selectedWorkspace)
      rl.close();
    });
  });
}

function getWorkSpaces(conversation){
  return new Promise(function(resolve, reject) {
    conversation.listWorkspaces({},(err, response)=>{
      if(err){
        console.log(`getWorkSpaces error : ${err}`);
        reject(err)
      }else {
        console.log(`getWorkSpaces success: ${JSON.stringify(response)}`);
        resolve(response.workspaces)
      }
    })
  });
}
function pingWorkSpaces(username,password,gateway){
  console.log(gateway);
  return new Promise(function(resolve, reject) {
    try {
      let conversation =watson.conversation({
        username: username,
        password: password,
        url : gateway,
        version: 'v1',
        version_date: '2017-04-21'
      })
      conversation.listWorkspaces({},(err, response)=>{
        if(err){
          console.log(`pingWorkSpaces error : ${err}`);
          setTimeout(reject,10000,err)
        }else {
          console.log(`pingWorkSpaces success: username:${username} password:${password} gateway:${gateway}`);
          resolve(conversation)
        }
      })
    } catch (err) {
      setTimeout(reject,10000,err)
    }
  });
}
function exportWorspace(conversation, workspace_id){
  return new Promise(function(resolve, reject) {
    conversation.getWorkspace({
      workspace_id:workspace_id,
      export:true
    },function(err,response){
      if(err){
        console.log(err);
        reject(new Error (err))
      }
      console.log('export Success');
      resolve(response)
    })
  });
}
module.exports.init = function () {
  console.log('in init');
  fs.stat(path.join(__dirname,'..','public','tmp'),function(err,resultat){
    if(err || !resultat.isDirectory ){
      console.log('folder do not exist we have to create it');
      fs.mkdir(path.join(__dirname,'..','public','tmp'),function(err,res){
        if(err)console.log('fail to create the folder tmp');
        else console.log('Success to create folder tmp');
      })
    }else {
      console.log('folder already exist');
    }
  })
}
