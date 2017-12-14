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
    let eventId = $(this).val();
    $("#"+eventId).remove();
  })
});