function adminInit() {
    var showHistory = function() {
      return true;
      // return new URL(location.href).searchParams.get("hist");
    };
    
    var sanitize = function(unsafestring) {
      return $('<div>').text(unsafestring).html();
    };
    
    var getField = function(data, field) {
      var k = Object.keys(data[field]).sort();
      var arr = [];
      for(var i = 0; i < k.length; i++) {
        arr.push(data[field][k[i]]);
      }
      return arr.reverse();
    };
    
    var getFieldLatest = function(data, field) {
      return getField(data, field)[0];
    };
    
    var fields = [
      ["firstName",  "Vorname"],
      ["lastName",  "Nachname"],
      ["email", "E-Mail"],
      ["rsvp", "RSVP"],
      ["team",  "Team"],
      ["song", "Lied"],
      ["honeymoon",  "Flitterwochen"],
      ["advice",  "Ratschlag"],
      ["hotel", "Hotel"],
      ["transport", "Transport"],
      ["children",  "Kinder?"],
      ["message", "Nachricht"],
    ];
  
    var loadData = function(cb) {
      var mapFields = function(m) { return "<th tablesaw-columntoggle data-tablesaw-sortable-col>" + m[1] + "</th>"; };
      
      var user = firebase.auth().currentUser;
      if(!user) return;
      var email = user.email;
      
      var html =  "<table>" + 
                    "<thead>" +
                      "<th tablesaw-columntoggle data-tablesaw-sortable-col data-tablesaw-sortable-default-col data-tablesaw-sortable-numeric='false'>Geändert</th>" + 
                      fields.map(mapFields).join("") +
                    "</thead>" +
                    "<tbody>" +
                    "</tbody>" +
                  "</table>";
      $("#adminTable").html(html);

      firebase.database().ref('/users').on('value', function(snapshot) {
        var data = snapshot.val();
        if(!data) return;
          
        for(var uid in data) {
          var user = data[uid]
          var row = "<tr title='" + uid + "'>";
          
          var lastChange = null;
          for(var o in user) {
            var field = getFieldLatest(user, o);
            if(lastChange === null || field.timestamp > lastChange) {
              lastChange = field.timestamp;
            }
          }
          
          row += "<td>" + new Date(lastChange).toISOString() + "</td>";           
          
          for(var i=0; i < fields.length; i++) {
            var prop = fields[i][0];
            var value;
            if(user.hasOwnProperty(prop)) {
              if(showHistory()) {
                var fieldValues = getField(user, prop);
                if(fieldValues.length == 1) {
                  value = sanitize(fieldValues[0].value) || "<i style='color:grey'>leer</i>";
                } else {
                  value = "<ol reversed>";
                  for(var x = 0; x < fieldValues.length; x++) {
                    var field = fieldValues[x];
                    value += "<li title='" + new Date(field.timestamp).toISOString() + "'>" + (sanitize(field.value) || "\"\"") + "</li>";
                  }
                  value += "</ol>";
                }
              } else {
                value = sanitize(getFieldLatest(user, prop).value);
              }
            } else {
              value = "&mdash;";
            }
            
            if(prop == "firstName") {
              value = "<a href='/rsvp.html?uid=" + uid + "'>" + value + "</a>";
            }
            
            row += "<td>" + value + "</td>";
          }
          row += "</tr>";
          
          var rowEl = $("[title=" + uid + "]");
          if(rowEl.length) {
            rowEl.replaceWith(row);
          } else {
            $("#adminTable tbody").prepend(row);
          }
        }
        // $("#adminTable").html(html);
        
        if($("#loginDiv:visible")) {
          Tablesaw.Table($("#adminTable"));
          $("th[data-tablesaw-sortable-default-col] > button").trigger("click");
          $("#loginDiv").hide();
        }
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
    // 
    // var pushData = function(formData, user, cb) {
    //   var ref = firebase.database().ref('users/' + user.uid);
    //   var key = ref.push().key;
    //   var updates = {};
    // 
    //   for(var o in formData) {
    //     if(!formData.hasOwnProperty(o)) continue;
    //     if(lastData && lastData.hasOwnProperty(o) && lastData[o] == formData[o]) continue;
    //     if(!lastData) lastData = {};
    //     lastData[o] = formData[o];
    //     updates[o + "/" + key] = {
    //       timestamp: firebase.database.ServerValue.TIMESTAMP,
    //       value: formData[o]
    //     };
    //   }
    //   ref.update(updates);
    // 
    //   var tawkData = {
    //     email: user.email,
    //     hash: sha256.hmac("e96bbf508ea3734b431f55b068c8702161fcc0f7", user.email)
    //   };
    //   if(lastData.firstName || lastData.lastName) {
    //     tawkData.name = (lastData.firstName||"") + " " + (lastData.lastName||"");
    //   } else {
    //     tawkData.name = user.email;
    //   }
    //   Tawk_API.setAttributes(tawkData, function(error){ console.log(error); });
    // };
}
