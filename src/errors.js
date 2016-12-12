// Indicates we received an invalid number of parameters (too few).
class ParameterCountError extends Error {
    constructor(message) {
        super(message)
        this.name = 'ParameterCountError'
    }
}
// Indicates we should be returning content, but all we have is something blank.
class NoContentError extends Error {
    constructor(message) {
        super(message)
        this.name = 'NoContentError'
    }
}

module.exports.ParameterCountError = ParameterCountError
module.exports.NoContentError = NoContentError