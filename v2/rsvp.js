function rsvpInit() {
    window.setActiveStep = function(next) {
      var previous = $(".active-item");
      
      if(previous) {
        previous.addClass("saving-item").removeClass("active-item");
        // previous.find('input, textarea, button, select').attr('disabled','disabled');
      }
    
      next.removeClass("ng-hide").addClass("active-item");
      next[0].scrollIntoView({behavior: "smooth", block: "center"})
      // next.find('input, textarea, button, select').removeAttr('disabled');
    };
    
    var setData = function(data) {
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
    };
    
    // firebase.auth().signOut(); //XXX
    
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log(user.email + " signed in!");
        firebase.database().ref('/users/' + user.uid).once('value').then(function(snapshot) {
          var data = snapshot.val();
          setData(data);
        });
        
      } else {
        console.log("Signed out!");
        //TODO reload page?
      }
    }); 

    function onSubmit(ev) {
      var current = $(this).closest('.form-item');
      var form = $(this).closest('form');
      var data = form.serializeArray().reduce(function(acc,cur) { acc[cur.name] = cur.value; return acc; }, {});
      
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
                });
            } else {
              console.log(error.code + " - " + error.message);
              alert(error.message);
            }
          }).then(function() {
            var user = firebase.auth().currentUser;
            firebase.database().ref('users/' + user.uid).update(data);
          });
      } else {
        var user = firebase.auth().currentUser;
        firebase.database().ref('users/' + user.uid).update(data);
      }
      
      var next = current.next();
      if(!next || next.hasClass("active-item")) return;
      
      ev.preventDefault();
      setActiveStep(next);
    }
    
    function activateStep(ev) {
      var item = $(this).closest('.form-item');
      if(!item || item.hasClass("active-item")) return;
      
      ev.preventDefault();
      setActiveStep(item);
    }

    $(".form-item form").submit(onSubmit);
    $(".form-item").click(activateStep);
}
