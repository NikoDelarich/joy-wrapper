function rsvpInit() {
    var rsvpSteps = $(".form-item");

    window.activateStep = function(idx) {
      var previous = $(".active-item");
      var next = $("#" + rsvpSteps[idx].id);
      
      if(previous) {
        previous.addClass("saving-item").removeClass("active-item");
        previous.find('input, textarea, button, select').attr('disabled','disabled');
      }
    
      next.removeClass("ng-hide").addClass("active-item");
      next.find('input, textarea, button, select').removeAttr('disabled');
    };

    activateStep(0);
}
