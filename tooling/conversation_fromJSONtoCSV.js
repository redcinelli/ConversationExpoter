const XLSX = require('xlsx');

module.exports.formatXLSX = function (data,pathToCSV) {
  var wb = {}
  wb.Sheets = {};
  wb.Props = {};
  wb.SSF = {};
  wb.SheetNames = [];
  var dataInJson = data
  var autoIncrement = 0;
  console.log("Parsing Data from workspace : ",dataInJson.name);

  var dataToCsv = {}
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
      // we make sure they are some exemples ... if not we push it empty
      if(val.exemples && val.exemples.length != 0){
        val.examples.forEach(function(exVal,exIndex,exArray){
          //  autoIncrement+=1;
          var newRow = [exVal.text,val.intent]
          dataToCsv.intents.push(newRow);
        })
      }else {
        // ex val do not exist but the intent do
        var newRow = ['',val.intent]
        dataToCsv.intents.push(newRow);
      }
    })
  }

  //extracting entities
  if(dataInJson.entities){
    dataInJson.entities.forEach(function(val,index,array){
      console.log("\textracting data from entities :",val.entity);
      if(val.values.length != 0){
        val.values.forEach(function(exVal,exIndex,exArray){
          //same as above for the entities, if there is no synonym we still want to extract the entity
          if(exVal.synonyms && exVal.synonyms.length != 0){
            exVal.synonyms.forEach(function(synonym, synonymIndex, synonymsArray){
              var newRow = [val.entity, exVal.value, synonym]
              dataToCsv.entities.push(newRow);
            })
          }else {
            var newRow = [val.entity, exVal.value, '']
            dataToCsv.entities.push(newRow);
          }
        })
      }else {
        var newRow = [val.entity, '', '']
        dataToCsv.entities.push(newRow);
      }
    })
  }
  return dataToCsv;
}

function formatToxlxs (wb,nameSheet, data) {
  var ws_name = nameSheet;
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
