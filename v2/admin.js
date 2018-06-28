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
      
      firebase.database().ref('/b2data').on('value', function(snapshot) {
        g_b2data = snapshot.val();
      });
      
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
    
    var encrypt = function(data, pw, idx) {
      var key = aesjs.utils.hex.toBytes(sha256(pw));
      var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(idx));
      return aesjs.utils.hex.fromBytes(aesCtr.encrypt(aesjs.utils.utf8.toBytes(data)));
    };
    
    var decrypt = function(str, pw, idx) {
      var key = aesjs.utils.hex.toBytes(sha256(pw));
      var data = aesjs.utils.hex.toBytes(str);
      var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(idx));
      var decryptedBytes = aesCtr.decrypt(data);
      
      return aesjs.utils.utf8.fromBytes(decryptedBytes);
    };
    
    $("#cryptSection > button").on("click", function() {
      $.ajax("https://api.backblazeb2.com/b2api/v1/b2_authorize_account", {
        headers: {
          "Authorization": "Basic " + btoa(g_b2data.account + ":" + g_b2data.appkey),
        },
        success: function(data) {
          credentials = data;
          console.log(credentials);
          
          $.ajax(credentials.apiUrl + '/b2api/v1/b2_list_file_names', {
            headers: {
              "Authorization": credentials.authorizationToken
            },
            data: {
              bucketId: "e3e751d55368470969440917"
            },
            success: function(data) {
              var files = data.files;
              var listOfFilesInBucket = [encrypt(g_b2data.cryptPW, g_b2data.cryptPW, 1)];
              files.forEach(function (element, index) {
                  if(!element.fileName.endsWith(".jpg")) return;
                  var url = credentials.downloadUrl + "/file/bestwedding/" + element.fileName;
                  listOfFilesInBucket.push(encrypt(url, g_b2data.cryptPW, index + 1));
              })
              listOfFilesInBucket.forEach(function (element, index) {
                  console.log(decrypt(element, g_b2data.cryptPW, index + 1));
              })
              $("#cryptSection > textarea").text(listOfFilesInBucket.join("\n"));
            }
          });
        }
      });
    });
}
