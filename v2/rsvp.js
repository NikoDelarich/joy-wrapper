function rsvpInit() {

    window.activateStep = function(id) {
      var previous = $(".active-item");
      var next = $("#" + id);
      
      if(previous) {
        previous.addClass("saving-item").removeClass("active-item");
        previous.find('input, textarea, button, select').attr('disabled','disabled');
      }
    
      next.removeClass("ng-hide").addClass("active-item");
      next[0].scrollIntoView({behavior: "smooth", block: "center"})
      next.find('input, textarea, button, select').removeAttr('disabled');
    };

    function nextStep(ev) {
      ev.preventDefault();
      var next = $(this).closest('.form-item').next();
      if(next) activateStep(next[0].id);
    };

    $(".form-item form").submit(nextStep);
}
