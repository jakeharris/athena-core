var readline = require('readline'),
    fs = require('fs')

// Manages API tokens for the app.
class TokenManager {

    constructor(filePath = '../tokens') {
        this.filePath = filePath
        this.tokens = {}
    }

    // create an object mapping API names
    // to token details. 
    parseTokens () {
        return new Promise((resolve, reject) => {
            let rl = readline.createInterface({
                input: fs.createReadStream(this.filePath),
                terminal: false
            })
                .on('line', (line) => {
                    let words = line.split(' ')
                    if(words.length !== 2)
                        reject(new Error('Improper formatting. (Name-token pairs are space-delimited, and separate from the next pair by newline.)'))
                    this.tokens[words[0]] = words[1]
                })
                .on('error', (err) => {
                    reject(err)
                })
                .on('close', () => {
                    resolve()
                })
        })
    }

}


module.exports = TokenManager