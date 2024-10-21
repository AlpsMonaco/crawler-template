const { CircularQueue } = require("./util")

const maxLogLines = 10

function Log() {
    let queue = CircularQueue(maxLogLines)

    function appendLog(s) {
        queue.push(s)
    }

    return {
        write: function (s) {
            appendLog(s)
        },
        
        iter: function (f) {
            queue.iter(f)
        }
    }
}

module.exports = { Log }