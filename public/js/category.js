$(document).ready(function(){
  $(".bars").hide();
  $("#bar-icon").click(function(){
    $(".bars").show();
    $(".restaurants").hide();
  });
  $("#restaurant-icon").click(function(){
    $(".bars").hide();
    $(".restaurants").show();
  });
  $(".veto-button").click(function(){
    let eventId = "#"+$(this).val();
    console.log(eventId)
    $.ajax({
    type: "POST",
    url: "/event/"+$(this).val(),
    success: function(doc)
      {
          $(eventId).remove();
          location.reload();
       }
     });
  })
});