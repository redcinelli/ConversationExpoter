const fs = require('fs');
const child_process =  require("child_process");

try {
  const XLSX = require('xlsx')
} catch (e) {
  try {
    console.log("package xlsx is not installed ! : trying to install it! \n This may take a minute please keep calm");
    child_process.execSync("npm install xlsx");
    child_process.execSync("npm install watson-developer-cloud");
    console.log("Success ! : programm exiting now, please restart it");
    console.log(require.cache);
    Object.keys(require.cache).forEach(function(key) { console.log(key); })
    //process.exit();
  } catch (e) {
    console.log("Missing Package! : Aborting now ");
    console.log("To correct please type : npm install xlsx");
  }
}

XLSX = require('xlsx');
watson = require('watson-developer-cloud');

let pathToJson = "data.json";
let pathToCSV = "output.xlsx"
let genCSV = false;
let dataInJson;
let dataToCsv = {}
dataToCsv.intents = [["Question","Intention"]]
dataToCsv.entities = [["entity","value","synonym"]]

/* set up workbook objects -- some of these will not be required in the future */
let wb = {}
wb.Sheets = {};
wb.Props = {};
wb.SSF = {};
wb.SheetNames = [];

process.argv.forEach(function (val, index, array) {
  if(index > 1){
    if(val === "--path"){
      // the next val should be a path
      pathToJson = array[index+1];
      if(testPath(pathToJson))
        console.log("path correct ! : proceeding now");
      else{
        console.log("path incorrect !: aborting now");
        process.exit();
      }
    }
    if(val === "--out"){
      console.log("--out detected :", array[index+1]);
      // the next val should be a path
      pathToCSV = array[index+1] + '.xlsx';
    }
    if(val === "--csv"){
      genCSV = true;
    }
  }
});
console.log("pathToJson : ", pathToJson);
dataInJson = fs.readFileSync(pathToJson, {encoding :"utf8"});
try {
  dataInJson = JSON.parse(dataInJson);
} catch (e) {
  console.log("data incorrect ! : arborting now");
  console.log(e);
  process.exit();
}
let autoIncrement = 0;
console.log("Parsing Data from workspace : ",dataInJson.name);

// extracting Intents
if(dataInJson.intents){
  dataInJson.intents.forEach(function(val,index,array){
    console.log("\textracting data from intent :",val.intent);
    val.examples.forEach(function(exVal,exIndex,exArray){
      //  autoIncrement+=1;
      let newRow = [exVal.text,val.intent]
      dataToCsv.intents.push(newRow);
    })
  })
}

//extracting entities
if(dataInJson.entities){
  dataInJson.entities.forEach(function(val,index,array){
    console.log("\textracting data from entities :",val.entity);
    val.values.forEach(function(exVal,exIndex,exArray){
      exVal.synonyms.forEach(function(synonym, synonymIndex, synonymsArray){
        let newRow = [val.entity, exVal.value, synonym]
        dataToCsv.entities.push(newRow);
      })
    })
  })
}

console.log("writting to file : ",pathToCSV);

formatToxlxs("Set apprentissage", dataToCsv.intents);
formatToxlxs("entity",dataToCsv.entities);
if(genCSV){
  toCSV("intents",dataToCsv.intents);
  toCSV("entities",dataToCsv.entities);
}

/* write file */
XLSX.writeFile(wb, pathToCSV);

                        ///////////////
                        // FUNCTIONS //
                        ///////////////
function testPath (path){
  return fs.existsSync(path)
}
function toCSV (name, data){
  let newPath = pathToCSV.replace(/.xlxs/,'+'+name+'.csv')
  fs.writeFileSync(newPath,data.join('\n'));
}
function formatToxlxs (nameSheet, data) {
  let ws_name = nameSheet;
  /* create worksheet: */
  var ws = {}

  /* the range object is used to keep track of the range of the sheet */
  var range = {s: {c:0, r:0}, e: {c:0, r:0 }};

  /* Iterate through each element in the structure */
  for(var R = 0; R != data.length; ++R) {
    if(range.e.r < R) range.e.r = R;
    for(var C = 0; C != data[R].length; ++C) {
      if(range.e.c < C) range.e.c = C;

      /* create cell object: .v is the actual data */
      var cell = { v: data[R][C] };
      if(cell.v == null) continue;

      /* create the correct cell reference */
      var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

      /* determine the cell type */
      if(typeof cell.v === 'number') cell.t = 'n';
      else if(typeof cell.v === 'boolean') cell.t = 'b';
      else cell.t = 's';

      /* add to structure */
      ws[cell_ref] = cell;
    }
  }
  ws['!ref'] = XLSX.utils.encode_range(range);

  /* add worksheet to workbook */
  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;
}
