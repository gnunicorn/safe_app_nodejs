const should = require('should');
const h = require('./helpers');
const l = require('../src/native/lib');

describe('Crypto Smoke Test', () => {

  it("properly sha3 hashes strings", () => {
    return l.sha3_hash("test").then((resp) => {
      should(resp.toString())
        .equal(Buffer("36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80", 'hex').toString());
    })
  });

  it("properly sha3 hashes buffers", () => {
    return l.sha3_hash(new Buffer("test a different value in a buffer")).then((resp) => {
      should(resp.toString())
        .equal(Buffer("bc262d37858c674b3a8950bed94f642f6e52b32fe7ac5725f287cb311d9d9d27", 'hex').toString());
    })
  });
});


describe.only('App Crypto Tests', () => {

  let app = h.createAuthenticatedTestApp();

  it("can hash nicely", () => {
    return app.crypto.sha3Hash("testing input").then( resp => {
      should(resp.toString())
        .equal(Buffer("97bc11468af46662f6df912b8d47edb7652e5209062c1588046bccfc7ac2dd7d", 'hex').toString());
    })
  });

  it("can hash nicely unauthorised", () => {
    return h.createTestApp().crypto.sha3Hash("testing input").then( resp => {
      should(resp.toString())
        .equal(Buffer("97bc11468af46662f6df912b8d47edb7652e5209062c1588046bccfc7ac2dd7d", 'hex').toString());
    })
  });

  it("can get sign key", () => {
    return app.crypto.getAppPubSignKey().then(key => {
      should(key).not.be.undefined();
      return key.getRaw().then( (raw) => {
        should(raw).not.be.undefined();
      })
    })
  }); 

  it("can get public key", () => {
    return app.crypto.getAppPubEncKey().then(key => {
      should(key).not.be.undefined()
      return key.getRaw().then( (raw) => {
        should(raw).not.be.undefined();
      })
    })
  });

  describe("new key pair", () => {

    let keyPair;

    before(() => app.crypto.generateEncKeyPair()
          .then(kp => {
            keyPair = kp;
            should(keyPair).not.be.undefined;
          }));

    it("generation creates appropriate keys", () => Promise.all([
          keyPair.pubEncKey.getRaw().then(r => {
            should(r).not.be.undefined();
            return r;
          }),
          keyPair.secEncKey.getRaw().then(r => {
            should(r).not.be.undefined();
            return r
          })
        ]).then( r => should(r[0]).not.equal(r[1])));

    it("encrypts and decrypts", () => {
      const INPT = `all teh ${Math.random()} times where I've been`;
      return keyPair.encrypt(INPT)
        .then( cipher => {
          should(cipher.toString()).not.equal(INPT);
          return keyPair.decrypt(cipher)
            .then( (raw) => {
              should(INPT).equal(raw.toString());
            });
        });
    });
  });
});