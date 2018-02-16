function mainInit() {
  var lastId,
    topMenu = $("#wedding-details-panels"),
    topMenuHeight = 0,
    menuItems = topMenu.find("[data-scrolltarget]"),
    scrollItems = menuItems.map(function(){
      var item = $("#"+$(this).attr("data-scrolltarget"));
      if (item.length) { return item; }
    });
    
    // Bind to scroll
    $(window).scroll(function() {
      // Get container scroll position
      var fromTop = $(this).scrollTop()+topMenuHeight;

      // Get id of current scroll item
      var last = menuItems[menuItems.length - 1];
      for(var i = 0; i < menuItems.length; i++) {
        var cur = menuItems[i];
        var offs = cur.getBoundingClientRect().top;
        if(offs < 0) last = cur;
      }
      // Get the id of the current element
      var id = last.getAttribute("data-scrollTarget");

      if (lastId !== id) {
        console.log(id);
        lastId = id;
        // Set/remove active class
        
        for(var i = 0; i < scrollItems.length; i++) {
          var cur = scrollItems[i];
          if(cur[0].id == id) {
            $(cur).removeClass("invisible");
          } else {
            $(cur).addClass("invisible");
          }
        }
      }
    });
    
    
    // Set the date we're counting down to
    var countDownDate = new Date("May 26, 2018 13:00:00").getTime();

    // Update the count down every 1 second
    var x = setInterval(function() {

      // Get todays date and time
      var now = new Date().getTime();

      // Find the distance between now an the count down date
      var distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Display the result in the element with id="demo"
      $(".counter > .time-unit:nth-child(1) > h1:first-child").text(days);
      $(".counter > .time-unit:nth-child(1) > h1:nth-child(2)").text(days == 1 ? "Tag" : "Tage");
      $(".counter > .time-unit:nth-child(2) > h1:first-child").text(hours);
      $(".counter > .time-unit:nth-child(3) > h1:first-child").text(minutes);
      $(".counter > .time-unit:nth-child(4) > h1:first-child").text(seconds);

      // If the count down is finished, write some text
      // if (distance < 0) {
      //   clearInterval(x);
      //   document.getElementById("demo").innerHTML = "EXPIRED";
      // }
    }, 1000); 
}
