var username = '';
var password = '';
$(document).on('click','#triggerGW',function(e){
  username = document.getElementById('username').value
  password = document.getElementById('password').value
  console.log(username,password);
  $.get( "/api/listWorkspace", { username: username, password: password })
  .done(function(data){
    console.log(data);
    cleanResult()
    for (var ws in data) {
      console.log(data[ws]);
      $( "#result" ).append( `<button id="${data[ws]}" class="trigger btn btn-primary">${ws}</button>` );
    }
  })
  .fail(function(data){
    console.log(data);
    alert(JSON.stringify(data));
  });
});

$(document).on('click','.trigger',function(){
  console.log(this.id);
  $.get( "/api/exportworkspace", { username: username, password: password, workspace_id:this.id})
  .done(function(data){
    console.log(data);
    cleanResult()
    $( "#result" ).append( `<a href="${data}" download>Click here to download</a>` );

  })
  .fail(function(data){
    console.log(data);
    alert(JSON.stringify(data));
  });
})

function cleanResult(){
  $( "#result" ).empty();
}

function loadFile() {
    console.log('plop');
    var input, file, fr;

    if (typeof window.FileReader !== 'function') {
      alert("The file API isn't supported on this browser yet.");
      return;
    }

    input = document.getElementById('fileinput');
    if (!input) {
      alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");
    }
    else {
      file = input.files[0];
      fr = new FileReader();
      fr.onload = receivedText;
      fr.readAsText(file);
      console.log(fr);
      fr.onloadend = function(){
        $.post( "/api/exportworkspace", { data : JSON.stringify(fr.result)})
        .done(function(data){
          console.log(data);
          cleanResult()
          $( "#result" ).append( `<a href="${data}" download>Click here to download</a>` );

        })
        .fail(function(data){
          console.log(data);
          alert(JSON.stringify(data));
        });
      }
    }


    function receivedText(e) {
      lines = e.target.result;
      var newArr = JSON.parse(lines);
    }
  }
