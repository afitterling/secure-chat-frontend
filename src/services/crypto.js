class Crypto {

    constructor(){
        this.available = !!window.crypto;
        this.errors = [];        
    }

    //  "wrapKey", or "unwrapKey"
    async generateKey(cipher="AES-CTR", length=256, extractable = true, fns = ["encrypt", "decrypt"]){
        await window.crypto.subtle.generateKey(
            {
                name: cipher,
                length: length, //can be  128, 192, or 256
            },
            extractable, //whether the key is extractable (i.e. can be used in exportKey)
            fns //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
        )
        .then(function(key){
            //returns a key object
            console.log(key);
            return key;
        })
        .catch(function(err){
            console.error(err);
        });
    }

    async exportKey(key){
        await window.crypto.subtle.exportKey(
            "jwk", //can be "jwk" or "raw"
            key //extractable must be true
        )
        .then(function(keydata){
            //returns the exported key data
            console.log(keydata);
            return keydata;
        })
        .catch(function(err){
            console.error(err);
        });
    
    }
}

export const crypto = new Crypto();

