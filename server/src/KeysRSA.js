const fs = require('fs');
const path = require('path');
const { KEYUTIL } = require('jsrsasign');
const secrets = require('../secrets');

const keyPath = path.join(__dirname, '..', 'keys');
const privPath = path.join(keyPath, 'jwt_rsa');
const pubPath = path.join(keyPath, 'jwt_rsa.pub');
let PRIV_KEY;
let PUB_KEY;

if (fs.existsSync(privPath) && fs.existsSync(pubPath)) {
  console.log('keys exist');
  PRIV_KEY = KEYUTIL.getKey(fs.readFileSync(privPath, 'utf8'), secrets.keyPassphrase);
  PUB_KEY = KEYUTIL.getKey(fs.readFileSync(pubPath, 'utf8'));
} else {
  if (fs.existsSync(privPath)) {
    console.log('delete priv');
    fs.unlinkSync(privPath);
  }
  if (fs.existsSync(pubPath)) {
    console.log('delete pub');
    fs.unlinkSync(pubPath);
  }
  const kp = KEYUTIL.generateKeypair('RSA', 2048);
  PRIV_KEY = kp.prvKeyObj;
  PUB_KEY = kp.pubKeyObj;
  fs.writeFileSync(privPath, KEYUTIL.getPEM(PRIV_KEY, 'PKCS8PRV', secrets.keyPassphrase), 'utf8');
  fs.writeFileSync(pubPath, KEYUTIL.getPEM(PUB_KEY), 'utf8');
}

module.exports = {
  PRIV_KEY,
  PUB_KEY,
  alg: 'RS512'
};
