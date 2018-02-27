function adminInit() {
    var getField = function(data, field) {
      var k = Object.keys(data[field]).sort();
      return data[field][k[k.length - 1]];
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
      var user = firebase.auth().currentUser;
      if(!user) return;
      var email = user.email;
      firebase.database().ref('/users').on('value', function(snapshot) {
        var mapFields = function(m) { return "<th tablesaw-columntoggle data-tablesaw-sortable-col>" + m[1] + "</th>"; };
        
        var data = snapshot.val();
        if(!data) return;
        
        var html = "<table><thead><th tablesaw-columntoggle data-tablesaw-sortable-col data-tablesaw-sortable-numeric='false'>Geändert</th>" + fields.map(mapFields).join("") + "</thead>";
          
        for(var uid in data) {
          var user = data[uid]
          html += "<tr title='" + uid + "'>";
          
          var lastChange = null;
          for(var o in user) {
            var field = getField(user, o);
            if(lastChange === null || field.timestamp > lastChange) {
              lastChange = field.timestamp;
            }
          }
          
          html += "<td>" + new Date(lastChange).toISOString() + "</td>";           
          
          for(var i=0; i < fields.length; i++) {
            var prop = fields[i][0];
            if(user.hasOwnProperty(prop)) {
              html += "<td>" + getField(user, prop).value + "</td>";
            } else {
              html += "<td>&mdash;</td>";
            }
            
          }
          html += "</tr>";
        }
        html += "</tbody></table>";
        $("#adminTable").html(html);
        Tablesaw.init();
        
        $("#loginDiv").hide();
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
