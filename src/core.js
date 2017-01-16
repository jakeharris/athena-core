
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
                            return url
                        }
                    ).catch(
                        (err) => {
                            throw err 
                        }
                    )
                }
            ).catch(
                (err) => {
                    if(err instanceof TypeError && err.message === 'Cannot read property \'dataValues\' of undefined') {
                        return 'What you seek cannot be found. Perhaps that skull girl would know...?\n\n_Try again in a bit; I don\'t have any with that set of tags yet that you haven\'t seen._'
                    }
                    if(err instanceof SequelizeUniqueConstraintError) {
                        return 'If at first you don\'t succeed, please don\'t blow it up again! This hurts. :(\n\n' 
                            + '_I was gonna show you something you had seen before, but I know better, so I blew up. 💣_\n\n'
                            + '*UserId:* ' + payload.id + '\n'
                            + '*Tags:* [' + payload.tags.join(', ') + ']\n\n'
                            + '_If this is still happening, let <@milieu#5270> know._'
                    }
                    return 'Sorry, sorry, I\'m sorry...I\'ve failed. Someone should probably let <@milieu#5270> know.\n' + err + '\n'
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

            Models.sequelize.query(
                'SELECT Post.* '
                    + 'FROM ( '
                        + 'SELECT Posts.* FROM Posts, Tags, PostTags '
                        + 'WHERE Posts.id = PostTags.PostId '
                            + 'AND PostTags.TagId = Tags.id '
                            + 'AND Tags.name in ("' + tags.join('","') + '") '
                        + 'GROUP BY Posts.id '
                        + 'HAVING COUNT(Tags.name) >= ' + tags.length
                    + ') as Post, Views '
                    + 'WHERE (' 
                        + '(Views.PostId = Post.id AND Views.UserId != ' + id + ') '
                        + 'OR NOT EXISTS (SELECT * FROM Posts,Views WHERE Post.id = Views.PostId)'
                    + ')',
                { model: Models.Post }
            )
                .then((posts) => { 
                    console.log('%%%%% PRIMARY QUERY RESULTS %%%%%')
                    console.log(posts)
                    if(typeof (posts[0].dataValues) === 'undefined' )
                        reject(posts[0])
                    resolve(posts[0].dataValues)
                })
                .catch(reject)
        })
    }
    static save (id, post) {

        console.log('%%%%% ATTEMPTING TO SAVE A VIEW %%%%%')
        console.log(id)
        console.log(post)

        return Models.View.create({
            UserId: id,
            PostId: post
        }, {
            include: [ Models.Post ]
        })
    }
    static fetchFromTumblr() {
        
        let tm = new TokenManager('./tokens')
        tm.parseTokens().then(() => {
            let tumblr = Tumblr.createClient({
                consumer_key: tm.tokens['tumblr'],
                returnPromises: true
            })

            let posts = [],
                tags = []
            
            tumblr.taggedPosts('overwatch')
                .then((postsFromTumblr) => {
                    // filter out all non-image posts
                    posts = postsFromTumblr.filter((e, i) => {
                        return e.type === 'photo'
                    })

                    for(let p in posts) {

                        // trim off all the stuff we're not using
                        let post = posts[p]
                        posts[p] = { id: post.id, url: post.post_url, tags: post.tags }

                        // create tags as tag objects that
                        // the Tag model can pass to the DB,
                        // and group them into an array for
                        // bulkCreate()
                        for(let t in post.tags) {
                            let tag = post.tags[t]
                            tag = { name: tag.toLowerCase() } 
                            posts[p].tags[t] = tag
                            tags.push(tag)
                        }
                    }

                    return Models.Tag.bulkCreate(tags, { fields: ['name'], ignoreDuplicates: true })
                        .then((tagModels) => {

                            for (let post of posts)
                                Models.Post.create(post)
                                    .then((postModel) => {

                                        let tagNames = []
                                        for(let tag of post.tags) {
                                            tagNames.push(tag.name)
                                        }

                                        Models.Tag.findAll({ 
                                            where: {
                                                name: {
                                                    in: tagNames
                                                }
                                            }
                                        }).then((tagModels) => {
                                            postModel.setTags(tagModels, {
                                                include: [ {
                                                    model: Models.Tag
                                                } ]
                                            }, (err) => {
                                                console.log ('Setting the tags didn\'t work, somehow...') 
                                                console.log(err)
                                            }).catch((err) => { 
                                                console.log('There was an error finding matching tags.') 
                                                console.log(err)
                                            })
                                        })
                                    }).catch((err) => { /* do nothing -- this means it was a duplicate post, which is fine */ })
                        }, (err) => { 
                            console.log('Bulk tag creation failed.')
                            console.log(err) 
                        }).catch((err) => { 
                            throw err
                        })


                }, (err) => { throw err })

            return posts

        }).catch((err) => {
            console.error('Something went wrong fetching from Tumblr. Stack trace: ')
            console.error(err)
        })
    }
}

module.exports = { Core, Models }
