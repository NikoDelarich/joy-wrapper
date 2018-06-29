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
