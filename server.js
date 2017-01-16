const Express = require('express'),
      BodyParser = require('body-parser'),
      Core = require('./src/core').Core,
      Models = require('./src/core').Models

let server = Express()

server.use(BodyParser.json())

server.post('/post', (request, response) => {

    console.log(request.body)

    Core.onRequest(request.body).then((url) => {
        // url will be a string that is EITHER
        // a post URL like we expect, or an
        // error message string if things went
        // sour
        response.send(url)
    }).then(() => {
        Core.fetchFromTumblr()
    })
})

Models.sequelize.sync().then(() => {
    console.log('listening on port 3000...')
    server.listen(3000)
    setInterval(Core.fetchFromTumblr, 1000 * 60 * 1) // every 10 min, grab some more
})

