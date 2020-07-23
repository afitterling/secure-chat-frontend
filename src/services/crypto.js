class CryptoService {

    constructor(){
        this.pubKeys = {};
        this.exportedKeys = [];
        this.keys = [];
        this.initCryptoAPI = this.initCryptoAPI.bind(this);
    }

    async initCryptoAPI () {
        if (!window.crypto) return false;
        this.keys = [...this.keys, await this.generateKey()];
        this.exportedKeys = [ 
            ...this.exportedKeys, 
             await this.exportKey(this.keys[this.keys.length-1].publicKey)
        ];
        return !!this.keys.length
    }

    importPubKey = (msg) => {
        console.log(msg.user, JSON.parse(window.atob(msg.content.key)));
        const rawKey = JSON.parse(window.atob(msg.content.key));
        Crypto.importKey(rawKey).then((key)=>{
          console.log('imported', key);
          Crypto.addPubKey(msg.user, key);
        })
      }
    
    addPubKey(user, key) {
        this.pubKeys[user] = key;
    }

    //  "wrapKey", or "unwrapKey"
    async generateKey(extractable = true, fns = ["encrypt", "decrypt"]){
        return await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048, // can be 1024, 2048 or 4096
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: {name: "SHA-256"} // or SHA-512
            },
            extractable, //whether the key is extractable (i.e. can be used in exportKey)
            fns //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
        )
        .then(function(key){
            //returns a key object
            return key;
        })
        .catch(function(err){
            console.error(err);
        });
    }

    async decryptMessage({privateKey}, ciphertext) {
        return window.crypto.subtle.decrypt(
          {
            name: "RSA-OAEP"
          },
          privateKey,
          ciphertext
        );
      }

    async exportKey(key){
        return await window.crypto.subtle.exportKey(
            'jwk', //can be "jwk" or "raw"
            key //extractable must be true
        )
        .then(function(keydata){
            //returns the exported key data
            return keydata;
        })
        .catch(function(err){
            console.error(err);
        });   
    }

    async encryptMessage(publicKey, decoded) {
        const enc = new TextEncoder();
        return window.crypto.subtle.encrypt(
          {
            name: "RSA-OAEP"
          },
          publicKey,
          enc.encode(decoded)
        );
    }

    async importKey(key){
        console.log('key to import', key)
        return await window.crypto.subtle.importKey(
            "jwk",
            key,
            {
                name: "RSA-OAEP",
                // Consider using a 4096-bit key for systems that require long-term security
                // modulusLength: 2048,
                // publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt"]
          );    
    }
}

const Crypto = new CryptoService()
export default Crypto;

