function logout() {
  firebase.auth().signOut().then(function() {
    location.href = location.href;
  });
}

function rsvpInit() {
    var lastData = null;
  
    window.setActiveStep = function(next) {
      var previous = $(".active-item");
      if(previous) previous.addClass("saving-item").removeClass("active-item");
    
      next.removeClass("ng-hide").addClass("active-item");
      next[0].scrollIntoView({behavior: "smooth", block: "center"})
    };
    
    var setData = function(data) {
      lastData = data;
      
      var showPrev = function(elem) {
        elem.closest('.form-item').prevAll(".form-item")
          .removeClass("ng-hide").addClass("saving-item");
      };
      
      /* Get text fields */
      var textFields = $(".form-item textarea, " +
                         ".form-item input[type=text], " +
                         ".form-item input[type*=name], " +
                         ".form-item input[type=email]");
      
      /* Update text fields */
      for(i = 0; i < textFields.length; i++) {
        var name = $(textFields[i]).attr('name');
        if(!data.hasOwnProperty(name)) continue;
        
        var elem = $("[name=" + name + "]");
        elem.val(data[name]);
        showPrev(elem);
      }
      
      /* Update radios */
      var radios = $(".form-item .choices-container > label:first-child > input[type=radio]:first-child");
      for(i = 0; i < radios.length; i++) {
        var name = $(radios[i]).attr('name');
        if(!data.hasOwnProperty(name)) continue;
        
        var elem = $("[name*=" + name + "][value=" + data[name] + "]");
        elem.attr("checked", "checked");
        showPrev(elem);
      }
      
      /* Show final element if all steps were completed */
      if($(".form-item.ng-hide:not(#saveAndContinue)").length == 0) {
        $("#saveAndContinue").removeClass("ng-hide").addClass("saving-item");
      }
      
      /* Update question texts & show/hide filtered questions */
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
        var data;
        if(!snapshot.val()) {
          data = { email: email };
        } else {
          var rawData = snapshot.val();
          data = {};
          for(var o in rawData) {
            if(!rawData.hasOwnProperty(o)) continue;
            var k = Object.keys(rawData[o]).sort();
            data[o] = rawData[o][k[k.length - 1]].value;
          }
          setData(data);
        }
        
        if(data.firstName || data.lastName) {
          $(".fullName").text((data.firstName || "") + " " + (data.lastName || ""));
          $(".email").text("("+data.email+")");
        } else {
          $(".fullName").text("");
          $(".email").text(data.email);
        }
        
        $("#loggedIn").removeClass("ng-hide");
        if(cb) cb();
      });
    };
    
    var unsubscribeFn = firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log(user.email + " signed in!");
        loadData(function() {
          pushData({email: user.email}, user, function() {
            loadData();
          });
        });
        unsubscribeFn();
      } else {
        console.log("Signed out!");
      }
    }); 
    
    var pushData = function(formData, user, cb) {
      var ref = firebase.database().ref('users/' + user.uid);
      var key = ref.push().key;
      var updates = {};
      
      for(var o in formData) {
        if(!formData.hasOwnProperty(o)) continue;
        if(lastData && lastData.hasOwnProperty(o) && lastData[o] == formData[o]) continue;
        if(!lastData) lastData = {};
        lastData[o] = formData[o];
        updates[o + "/" + key] = {
          timestamp: firebase.database.ServerValue.TIMESTAMP,
          value: formData[o]
        };
      }
      ref.update(updates);
      
      var tawkData = {
        email: user.email,
        hash: sha256.hmac("e96bbf508ea3734b431f55b068c8702161fcc0f7", user.email)
      };
      if(lastData.firstName || lastData.lastName) {
        tawkData.name = (lastData.firstName||"") + " " + (lastData.lastName||"");
      } else {
        tawkData.name = user.email;
      }
      Tawk_API.setAttributes(tawkData, function(error){ console.log(error); });
    };
    
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
            
      if(current[0].id == "nameAndEmail" && !firebase.auth().currentUser) {
        var email = $("#email").val();
        if(email.trim().length == 0) {
          var sanitize = function(s) { return $(s).val().replace(/[^a-z0-9]/gi, '_').toLowerCase(); };
          email = "autouser-" + sanitize("#firstName") + "." + sanitize("#lastName") + "@niko-carina.wedding";
        }
        
        /* Log In or create new user */
        firebase.auth().signInWithEmailAndPassword(email, sha256("niko-carina.wedding"))
          .catch(function(error) {
            if(error.code == "auth/user-not-found") {
              console.log("Creating new user...");
              firebase.auth().createUserWithEmailAndPassword(email, sha256("niko-carina.wedding"))
                .catch(function(error) {
                  console.log(error.code + " - " + error.message);
                  alert(error.message);
                }).then(function() {
                  data.email = email;
                  pushData(data, firebase.auth().currentUser);
                  if(next) setActiveStep(next);
                });
            } else {
              console.log(error.code + " - " + error.message);
              alert(error.message);
            }
          }).then(function() {
            var user = firebase.auth().currentUser;
            loadData(function() {
              pushData(data, firebase.auth().currentUser);
              if(next) setActiveStep(next);
            });
          });
          
          return;
      } else {
        var user = firebase.auth().currentUser;
        if(current[0].id == "nameAndEmail" && user.email != data.email) {
          user.updateEmail(data.email);
        }
        pushData(data, user);
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
      ev.preventDefault();
    }

    function formClicked(ev) {
      var el = $(ev.target);
      var form = el.closest(".form-item");
      
      if($(form).hasClass("active-item")) {
        if(el.is("input[type=radio]") && el[0].checked) {
          el.trigger("change");
        }
      } else {
        setActiveStep($(form));
        ev.preventDefault();
      }
    }

    $(".form-item form").submit(onSubmit);
    $(".form-item input[type=radio]").change(radioClicked);
    $(document).on("click", ".form-item", formClicked);
    
    
    window.requestAnimationFrame(function() {
      window.Tawk_API=Tawk_API||{}, window.Tawk_LoadStart=new Date();
      (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/5a847c74d7591465c707abcf/default';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
      })();
    });
}
