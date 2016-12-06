class ParameterCountError extends Error {
    constructor(message) {
        super(message)
    }
}

module.exports = ParameterCountError