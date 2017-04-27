const XLSX = require('xlsx');

module.exports.formatXLSX = function (data,pathToCSV) {
  let wb = {}
  wb.Sheets = {};
  wb.Props = {};
  wb.SSF = {};
  wb.SheetNames = [];
  let dataInJson = data
  let autoIncrement = 0;
  console.log("Parsing Data from workspace : ",dataInJson.name);

  let dataToCsv = {}
  dataToCsv.intents = [["Question","Intention"]]
  dataToCsv.entities = [["entity","value","synonym"]]

  dataToCsv = extractIintent(dataToCsv,dataInJson);
  wb = formatToxlxs(wb,"Set apprentissage", dataToCsv.intents);
  wb = formatToxlxs(wb,"entity",dataToCsv.entities);

  /* write file */
  XLSX.writeFile(wb, pathToCSV);

 };


function extractIintent(dataToCsv,dataInJson){
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
  return dataToCsv;
}

function formatToxlxs (wb,nameSheet, data) {
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

  return wb;
}
