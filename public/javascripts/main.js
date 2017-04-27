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
    alert(data);
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
    alert(data);
  });
})

function cleanResult(){
  $( "#result" ).empty();
}
