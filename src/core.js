
const ParameterCountError = require('./errors').ParameterCountError,
      NoContentError = require('./errors').NoContentError

var models = require('../models')

class Core {
    static onRequest (payload) {
        if(typeof payload === 'undefined') throw new ParameterCountError('We can\'t do anything without a payload!')
        if(typeof payload !== 'object') throw new TypeError('The payload needs to be an object. (Received: ' + typeof payload + '.)')
        if(typeof payload.tags === 'undefined') throw new TypeError('The payload must contain a tags array. (Received: ' + payload + '.)')
        if(!Array.isArray(payload.tags)) throw new TypeError('The payload\'s tags property must be an array. (Received: ' + payload.tags + '.)')
        if(typeof payload.id === 'undefined') throw new TypeError('The payload must contain a user id snowflake. (Received: ' + payload + '.)')
        if(typeof payload.id !== 'number') throw new TypeError('The payload\'s user id snowflake property must be a number. (Received: ' + typeof payload.id + '.)')

        return this.getValidImageURL(payload.tags, payload.id)
            .then(
                (url) => {
                    let u = url // actually, do I need this? can I just return url?
                    return this.save(payload.id).then(
                        () => {
                            return u
                        }
                    ).catch(
                        (err) => {
                            return 'Sorry, sorry, I\'m sorry...I\'ve failed. Someone should probably let @milieu know.\nError:\n' + err
                        }
                    )
                }
            ).catch(
                (err) => {
                    return 'Sorry, sorry, I\'m sorry...It seems there\'s nothing new to show. I\'ll get on that.\nError:\n' + err
                }
            )

    }  
    static getValidImageURL (tags, id) {
        if(typeof tags === 'undefined') throw new ParameterCountError('We must receive an array of tags, but received nothing.')
        if(tags.length === 0) throw new ParameterCountError('The tags array must not be empty, but it was.')
        if(!Array.isArray(tags)) throw new TypeError('The tags array must be a proper javascript array.')
        if(typeof id === 'undefined') throw new ParameterCountError('We must receive a user id snowflake, but received nothing.')
        if(typeof id !== 'number') throw new TypeError('The user id snowflake must be a number. (Received: ' + typeof id + ')')
        if(id <= 0) throw new TypeError('The user id snowflake will always be a positive integer. (Received:' + id + ')')

        return new Promise((resolve, reject) => { 
            // ask database for url that matches all tags
            // that no user with ID id has seen

            // if that works, resolve with that value
            // if that fails, reject with the error 
            resolve(true)
        })
    }
    static save (id, post) {
        return models.sequelize.transaction((t) => {
            return View.create({
                UserId: id
            }, { transaction: t})
        })
    }
}

module.exports = Core
