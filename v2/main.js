function domReadyFn() {
  // Set the date we're counting down to
  var countDownDate = new Date("May 26, 2018 13:00:00").getTime();
  var updateCountdown = function() {

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
  };
  
  // Update the count down every 1 second
  updateCountdown();
  setInterval(updateCountdown, 1000);
  
  window.Tawk_API = (typeof Tawk_API != "undefined") ? Tawk_API : {};
  window.Tawk_LoadStart = new Date();
  (function(){
    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
    s1.async=true;
    s1.src='https://embed.tawk.to/5a847c74d7591465c707abcf/default';
    s1.charset='UTF-8';
    s1.setAttribute('crossorigin','*');
    s0.parentNode.insertBefore(s1,s0);
  })();
  
  var getField = function(data, field) {
    var k = Object.keys(data[field]).sort();
    return data[field][k[k.length - 1]].value;
  };
  
  firebase.auth().onAuthStateChanged(function(user) {
    var cta = $("cta-prompt");
    if (user) {
      var tawkData = {
        email: user.email,
        hash: sha256.hmac("e96bbf508ea3734b431f55b068c8702161fcc0f7", user.email)
      };
      firebase.database().ref('/users/' + user.uid).once('value').then(function(snapshot) {
        var data = snapshot.val();
        if(data) {
          if(data.hasOwnProperty("firstName")) {
            var firstName = getField(data, "firstName");
            var lastName = getField(data, "lastName");
            if( (firstName && firstName.length > 0) || 
                (lastName && lastName.length > 0) )
            {
              tawkData.name = (firstName||"") + " " + (lastName||"");
            } else {
              tawkData.name = user.email;
            }
            cta.find("div").text("Hallo " + firstName + "!");
            cta.removeClass("invisible");
          }
          
          $(".rsvp-button.btn > span").text(data.hasOwnProperty("rsvp") ? "Antwort ändern" : "Antworten");
          
          Tawk_API.setAttributes(tawkData, function(error){ console.log(error); });
        }
      }, function(error) {
        Tawk_API.setAttributes(tawkData, function(error){ console.log(error); });
      });
    } else {
      cta.addClass("invisible");
      $(".rsvp-button.btn > span").text("Antworten");
    }
  }); 
}

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
    
    window.requestAnimationFrame(function() {
      $(".fadeInOnLoad").removeClass("invisible");
    });
    
    if($(window).width() >= 770) {
      var page = $("html, body");
      if(page[0].scrollTop < 100) {
        var scrollEnabled = true;
        page.on("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", function(){
          scrollEnabled = false;
          page.stop();
        });

        var autoscroll = function() {
          if(scrollEnabled) {
            page.delay(1500).animate({scrollTop: 200 }, 500);
            page.delay(750).animate({scrollTop: 0 }, 1000, function(){
              page.off("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove");
            });
          }
          var vidDefer = document.getElementsByTagName('iframe');
          for(var i = 0; i < vidDefer.length; i++) {
            if(vidDefer[i].getAttribute('data-src')) {
              vidDefer[i].setAttribute('src',vidDefer[i].getAttribute('data-src'));
            }
          }
        };
        if(typeof Pace != "undefined") {
          Pace.on("hide", autoscroll);
        } else {
          autoscroll();
        }
      }
    }
    
    $(".scrollarrow").click(function() {
        $(".schedule")[0].scrollIntoView({behavior: "smooth", block: "center"})
    });
    
}

function goToRSVP() {
  location.href = "/rsvp.html";
}
