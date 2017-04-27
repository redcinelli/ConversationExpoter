const fs = require('fs');

const pathToTmp = './public/tmp/';
const sizeTriggerDelete = 250000;

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

function totSize(path){
  return new Promise(function(resolve, reject) {
    fs.readdir(path,function(err,files){
      if(err) reject(new Error(err));
      if(files==undefined) reject(new Error(`No files in this following directory : ${path}`));
      console.log(`files in tmp directory :${files}`);
      else {
        var arrPromFile = [];
        for (file of files) {
          var P = new Promise(function(resStat, rejStat) {
            var newPath = path+file;
            // console.log(newPath);
            fs.stat(newPath,function(err,stat){
              if(err){
                rejStat(new Error(err))
              }else {
                resStat(stat.size);
              }
            });
          });
          arrPromFile.push(P)
        }
        Promise.all(arrPromFile)
                .then((arrSize)=>{resolve(arrSize.reduce((a,b)=>{return a+b;}))})
                .catch((err)=>{reject(err)});
      }
    })
  });
}

function deleteOldest(){
  return new Promise(function(resolve, reject) {
    fs.readdir(pathToTmp,function(err,files){
      if(err)reject(new Error(err));
      if(files==undefined)reject(new Error(`No files in this following directory : ${pathToTmp}`));
      else {
        file = files.map((file)=>{return file.split('.')[0]}).min()
        var pathFileDelete = pathToTmp+file+'.xlsx'
        fs.unlink(pathFileDelete,function(err){
          if(err)reject(new Error(err))
          else resolve()
        })
      }
    })
  });
}

module.exports.manageSize = function () {
  totSize(pathToTmp).then((size)=>{
    console.log(`actual size :${size}, maz size ${sizeTriggerDelete}`);
    if(size > sizeTriggerDelete){
      console.log('need to delete');
      deleteOldest().then(()=>{
        module.exports.manageSize();
      }).catch((err)=>{
        console.error(err);
      })
    }
  })
};
