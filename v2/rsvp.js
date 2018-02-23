function logout() {
  firebase.auth().signOut().then(function() {
    location.href = location.href;
  });
}

function rsvpInit() {
    var lastData = null;
  
    window.setActiveStep = function(next) {
      var previous = $(".active-item");
      
      if(previous) {
        previous.addClass("saving-item").removeClass("active-item");
      }
    
      next.removeClass("ng-hide").addClass("active-item");
      next[0].scrollIntoView({behavior: "smooth", block: "center"})
    };
    
    var setData = function(data) {
      lastData = data;
      
      var textFields = $(
        ".form-item textarea, " +
        ".form-item input[type=text], " +
        ".form-item input[type*=name], " +
        ".form-item input[type=email]" +
      "");
      
      for(i = 0; i < textFields.length; i++) {
        var name = $(textFields[i]).attr('name');
        if(!data.hasOwnProperty(name)) continue;
        
        var elem = $("[name=" + name + "]");
        elem.val(data[name]);
        elem.closest('.form-item').removeClass("ng-hide").addClass("saving-item");
      }
      
      var radios = $(".form-item .choices-container > label:first-child > input[type=radio]:first-child");
      for(i = 0; i < radios.length; i++) {
        var name = $(radios[i]).attr('name');
        if(!data.hasOwnProperty(name)) continue;
        
        var elem = $("[name*=" + name + "][value=" + data[name] + "]");
        elem.attr("checked", "checked");
        elem.closest('.form-item').removeClass("ng-hide").addClass("saving-item");
      }
      
      if($(".form-item.ng-hide:not(#saveAndContinue)").length == 0) {
        $("#saveAndContinue").removeClass("ng-hide").addClass("saving-item");
      }
      
      updateQuestions();
    };
    
    function updateQuestions() {
      if(!lastData) return;
      var notAttending = $("input[value=notAttending]")[0].checked;
      $(".attending-only").toggleClass("force-hide", notAttending);
      $("#thanks").html(notAttending ? 
                            "Schade, wir hätten dich wirklich gern dabei gehabt :'(<br>Wenn du es dir doch noch einrichten kannst, würden wir uns sehr freuen!" : 
                            "<b>Schön, dass du kommen wirst - wir freuen uns schon auf dich :D</b>");
    };
    
    var loadData = function(cb) {
      var user = firebase.auth().currentUser;
      if(!user) return;
      var email = user.email;
      firebase.database().ref('/users/' + user.uid).once('value').then(function(snapshot) {
        var data = snapshot.val();
        if(!data) {
          data = {
            firstName: "?",
            lastName: "",
            email: email
          };
          setData({email: email});
        } else {
          setData(data);
        }
        
        $(".fullName").text(data.firstName + " " + data.lastName);
        $(".email").text(data.email);
        $("#loggedIn").removeClass("ng-hide");
        if(cb) cb();
      });
    };
    
    var unsubscribeFn = firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log(user.email + " signed in!");
        loadData();
        unsubscribeFn();
      } else {
        console.log("Signed out!");
      }
    }); 

    function onSubmit(ev) {
      var current = $(this).closest('.form-item');
      var form = $(this).closest('form');
      var notAttending = $("input[value=notAttending]")[0].checked;
      var data = form.serializeArray().reduce(function(acc,cur) {
        acc[cur.name] = cur.value; return acc;
      }, {});
      var next = current;
      
      ev.preventDefault();
      
      do {
         next = next.next();
         if(!next || !notAttending || !next.hasClass("attending-only")) break;
      } while(next);
            
      if(current[0].id == "nameAndEmail") {
        var email = $("#email").val();
        
        /* Log In or create new user */
        firebase.auth().signInWithEmailAndPassword(email, md5(email))
          .catch(function(error) {
            if(error.code == "auth/user-not-found") {
              console.log("Creating new user...");
              firebase.auth().createUserWithEmailAndPassword(email, md5(email))
                .catch(function(error) {
                  console.log(error.code + " - " + error.message);
                  alert(error.message);
                }).then(function() {
                  var user = firebase.auth().currentUser;
                  firebase.database().ref('users/' + user.uid).set(data);
                  if(next) setActiveStep(next);
                });
            } else {
              console.log(error.code + " - " + error.message);
              alert(error.message);
            }
          }).then(function() {
            var user = firebase.auth().currentUser;
            loadData(function() {
              firebase.database().ref('users/' + user.uid).update(data);
              if(next) setActiveStep(next);
            });
          });
          
          return;
      } else {
        var user = firebase.auth().currentUser;
        firebase.database().ref('users/' + user.uid).update(data);
        if(next) setActiveStep(next);
      }
    }
    
    function activateStep(ev) {
      var item = $(this).closest('.form-item');
      if(!item || item.hasClass("active-item")) return;
      
      ev.preventDefault();
      setActiveStep(item);
    }
    
    function radioClicked(ev) {
      updateQuestions();
      $.proxy(onSubmit, this)(ev);
    }

    $(".form-item form").submit(onSubmit);
    $(".form-item").click(activateStep);
    $(".form-item input[type=radio]").change(radioClicked);

    setTimeout(function() {
      var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
      (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/5a847c74d7591465c707abcf/default';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
      })();
    }, 500);
}
