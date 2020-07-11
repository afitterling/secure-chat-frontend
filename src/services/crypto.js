class Crypto {

    constructor(){
        this.isAvailable = !!window.crypto;
        this.exportedKeys = [];
        this.keys = [];
        if (this.isAvailable === false) return;
        this.initCryptoAPI();        
    }

    async initCryptoAPI () {
        this.keys = [...this.keys, await this.generateKey()];
        this.exportedKeys = [ 
            ...this.exportedKeys, 
            await this.exportKey(this.keys[this.keys.length-1])
        ];
    }

    //  "wrapKey", or "unwrapKey"
    async generateKey(cipher="AES-CTR", length=256, extractable = true, fns = ["encrypt", "decrypt"]){
        return await window.crypto.subtle.generateKey(
            {
                name: cipher,
                length: length, //can be  128, 192, or 256
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
            "jwk", //can be "jwk" or "raw"
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
}

const crypto = new Crypto()
export default crypto;

