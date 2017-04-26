const readline = require('readline');
const watson = require('watson-developer-cloud');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var conversation = watson.conversation({
  username: "a4e27669-e8af-4e09-9f4e-580fd0ef103d",
  password: "zgPYHw5cKm1c",
  version: 'v1',
  version_date: '2017-04-21'
});



getWorkSpaces(conversation).then((workspaces)=>{
  return chooseWorkspace(workspaces)
}).then((selectedWorkspace)=>{
  console.log(selectedWorkspace);
  return exportWorspace(conversation,selectedWorkspace.workspace_id)
}).then((exportWorspace)=>{
  fs.writeFileSync('exportWorspace.json',JSON.stringify(exportWorspace));
  console.log('done');

}).catch((err)=>{
  console.error(err);
  process.exit(1);
})


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
        reject(new Error(err))
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
