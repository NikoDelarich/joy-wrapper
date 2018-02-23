function adminInit() {
    var getField = function(data, field) {
      var k = Object.keys(data[field]).sort();
      return data[field][k[k.length - 1]].value;
    };
    
    var fields = [
      "firstName", 
      "lastName", 
      "email",
      "rsvp",
      "team", 
      "song",
      "hotel",
      "transport",
      "honeymoon", 
      "advice", 
      "children", 
      "message",
    ];
  
    var loadData = function(cb) {
      var html = "<table><thead><th>" + fields.join("</th><th>") + "</th></thead>";
      var user = firebase.auth().currentUser;
      if(!user) return;
      var email = user.email;
      firebase.database().ref('/users').once('value').then(function(snapshot) {
        var data = snapshot.val();
        if(!data) return;
          
        for(var uid in data) {
          var user = data[uid]
          for(var i=0; i < fields.length; i++) {
            var prop = fields[i];
            if(user.hasOwnProperty(prop)) {
              html += "<td>" + getField(user, prop) + "</td>";
            } else {
              html += "<td>???</td>";
            }
          }
          
          html += "</tbody></table>";
          $("#adminTable").html(html);
        }
          
        // data = {};
        // for(var o in rawData) {
        //   if(!rawData.hasOwnProperty(o)) continue;
        //   var k = Object.keys(rawData[o]).sort();
        //   data[o] = rawData[o][k[k.length - 1]].value;
        // }
        // setData(data);
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
