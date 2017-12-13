$(document).ready(function(){
    $('#selectedPrice').on('change', function() {
      if ( this.value < 3)
      {
        $("#fancy").hide();
        $("#cheap").show();
      }
      else
      {
        $("#cheap").hide();
        $("#fancy").show();
      }
    });
});