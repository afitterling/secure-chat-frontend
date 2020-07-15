class CryptoService {

    constructor(){
        this.isAvailable = !!window.crypto;
        this.pubKeys = {};
        this.exportedKeys = [];
        this.keys = [];
        if (this.isAvailable === false) return;
        this.initCryptoAPI();        
    }

    async initCryptoAPI () {
        this.keys = [...this.keys, await this.generateKey()];
        this.exportedKeys = [ 
            ...this.exportedKeys, 
             await this.exportKey(this.keys[this.keys.length-1].publicKey)
        ];
        console.log(this.exportedKeys[0]);
    }

    addPubKey(user, key) {
        this.pubKeys[user] = key;
        console.log(this.pubKeys);
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
        return window.crypto.subtle.encrypt(
          {
            name: "RSA-OAEP"
          },
          publicKey,
          decoded
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

