
const ParameterCountError = require('./errors').ParameterCountError,
      NoContentError = require('./errors').NoContentError,
      Tumblr = require ('tumblr.js'),
      TokenManager = require('./token-manager')

var Models = require('../models')

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
                (post) => {
                    let url = post.url // actually, do I need this? can I just return url?
                    return this.save(payload.id, post.id).then(
                        () => {
                            return u
                        }
                    ).catch(
                        (err) => {
                            return 'Sorry, sorry, I\'m sorry...I\'ve failed. Someone should probably let @milieu#5270 know.\nError:\n' + err
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
            // ask database for post that matches all tags
            // that no user with ID id has seen
            
            Models.Post.findAll(
                { 
                    include: [
                        { 
                            model: Models.Tag, 
                            attributes: ['name'], 
                            where: { 
                                name: { 
                                    $in: tags
                                } 
                            } 
                        }
                    ], 
                    group: ['Post.id'], 
                    having: ['COUNT(?) >= ?', 'Tag.name', tags.length] 
                })
                .then((posts) => { resolve(posts[0].dataValues.url) })
                .catch(reject)
        })
    }
    static save (id, post) {
        return models.sequelize.transaction((t) => {
            return models.View.create(
                {
                    UserId: id,
                    post: post
                }, 
                { 
                    include: [ { association: models.View.Post } ], 
                    transaction: t 
                }
            )
        })
    }
    static fetchFromTumblr() {
        let tm = new TokenManager('./tokens')
        tm.parseTokens().then(() => {
            let client = Tumblr.createClient({
                consumer_key: tm.tokens['tumblr'],
                returnPromises: true
            })

            let posts = client.taggedPosts('overwatch').then((posts) => {
                posts.filter((e, i) => {
                    return e.type === 'photo'
                })
                
                for(let p in posts)
                    posts[p] = { id: posts[p].id, url: posts[p].post_url, tags: posts[p].tags }

                console.log(posts)
                return posts
            }).then((posts) => {
                for(let post of posts) 
                    Models.Post.create(post,
                        { 
                            include: [{
                                association: Models.Post.Tag
                            }]
                        }
                    ).then(() => {
                        Models.Post.sync()
                    })
             })

        }, (err) => {

        })
    }
}

module.exports = Core
