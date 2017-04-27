const readline = require('readline');
const watson = require('watson-developer-cloud');
const xlsxParser = require('./conversation_fromJSONtoCSV');
const cleanner = require('../tooling/cleanner');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


module.exports.listingWorkspace = function (username,password) {
  let conversation = watson.conversation({
    username: username,
    password: password,
    version: 'v1',
    version_date: '2017-04-21'
  });
  return new Promise(function(resolve, reject) {
    getWorkSpaces(conversation)
    .then((infoWorkspaces)=>{
      let wsNameID = {}
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
  let conversation = watson.conversation({
    username: username,
    password: password,
    version: 'v1',
    version_date: '2017-04-21'
  });
  return new Promise(function(resolve, reject) {
    exportWorspace(conversation,workspace_id)
    .then((fullworkspace)=>{
      let nameFile = Date.now()+`.xlsx`;
      let pathFile = `./public/tmp/${nameFile}`;
      console.log("writting tmp file :",pathFile);
      xlsxParser.formatXLSX(fullworkspace,pathFile)
      resolve(pathFile.slice(8));
    })
    .catch((err)=>{reject(err)});
  });
};


function chooseWorkspace(workspaces){
  return new Promise(function(resolve, reject) {
    let listWorkspace = []
    let selectedWorkspace = {}
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
        reject(err)
      }else {
        resolve(response.workspaces)
      }
    })
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
