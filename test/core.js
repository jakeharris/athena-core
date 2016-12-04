var assert = require('assert'),
    sinon  = require('sinon'),

    Core   = require('../src/core')

describe('Core', () => {
    context('onRequest', () => {
        it('throws a ParameterCountError if we don\'t receive a payload', () => {
            assert.throws(() => {
                Core.onRequest()
            }, ParameterCountError)
        })
        it('throws a TypeError if we don\'t receive a JSON object', () => {
            assert.throws(() => {
                Core.onRequest(4)
            }, TypeError)
        })
        it('throws a TypeError if the object we receive has no tags array', () => {
            assert.throws(() => {
                Core.onRequest({'foo': 'bar'})
            }, TypeError)
        })
        it('throws a TypeError if we get a tags property, but it\'s not an array', () => {
            assert.throws(() => {
                Core.onRequest({'tags': 5})
            }, TypeError)
        })
        it('throws a TypeError if the object we receive has no user id snowflake', () => {
            assert.throws(() => {
                Core.onRequest({'tags': ['mei', 'zarya', 'polar bear']})
            }, TypeError)
        })
        it('throws a TypeError if we get a user id snowflake, but it\'s not a number', () => {
            assert.throws(() => {
                Core.onRequest({ 'id': ['dumb', 'array'] })
            }, TypeError)
        })

        it('requests a valid URL from the database', () => {
            sinon.spy(Core, 'getValidImageURL')

            Core.onRequest({ 'tags': ['mei', 'zarya', 'polar bear'], 'id': 8675309999 })
            assert(Core.getValidImageURL.calledOnce)

            Core.getValidImageURL.restore()
        })
        // requires some database configuration
        it('returns a sorry, sorry message if there is no new matching content to show')

        // requires some database asking
        it('saves this view to the database')
        // requires some investigation
        it('returns a different sorry, sorry message if there was a database issue')

        it('returns a Promise of a URL to an image that the user has never seen before, matching the requested tags', (done) => {
            var p = Core.onRequest({ 'tags': ['mei', 'zarya', 'polar bear'], 'id': 8675309999 }).then(() => {
                assert.notEqual(p.indexOf('http'), -1)
                done()
            })
            assert(p instanceof Promise)
        })
    })

    context('getValidImageURL', () => {
        it('throws a ParameterCountError if we don\'t receive a tags array', () => {
            assert.throws(() => {
                Core.getValidImageURL()
            }, ParameterCountError)
            assert.throws(() => {
                Core.getValidImageURL(id = 8675309999)
            }, ParameterCountError)
        })
        it('throws a ParameterCountError if we don\'t receive a user id snowflake', () => {
            assert.throws(() => {
                Core.getValidImageURL(['mei', 'zarya', 'polar bear'])
            }, ParameterCountError)
        })

        it('throws a NoContentError if no valid URL can be found')

        it('returns a Promise of a URL to an image that the user has never seen before, matching the requested tags', (done) => {
            var p = Core.getValidImageURL(['mei', 'zarya', 'polar bear'], 8675309999).then(() => {
                assert.notEqual(p.indexOf('http'), -1)
                done()
            })
            assert(p instanceof Promise)
        })
    })

    context('save', () => {
        it('throws a DatabaseError if saving fails (unsure if I can test this)')

        it('does not throw if it succeeds')
    })
})