const time = {
    getLocalTime: () => {
        let now = new Date();
        let year = now.getFullYear()
        let month = now.getMonth() + 1
        let date = now.getDate()
        let hour = now.getHours()
        let minute = now.getMinutes()
        let seconds = now.getSeconds()
        return year + (month >= 10 ? '-' : '-0') + month + (date >= 10 ? "-" : "-0") + date + (hour >= 10 ? " " : " 0") + hour + (minute >= 10 ? ":" : ":0") + minute + (seconds >= 10 ? ":" : ":0") + seconds
    }
}

function CircularQueue(queueSize) {
    if (!queueSize) throw ("bad queue size")
    let end = -1
    let queue = new Array(queueSize)

    function getSize() {
        return end + 1 <= queueSize ? (end + 1) : queueSize
    }

    function push(elem) {
        queue[++end % queueSize] = elem
    }

    function iter(f) {
        let size = getSize()
        let index = end + 1 - size
        while (size != 0) {
            f(queue[index % queueSize])
            size--
            index++
        }
    }

    return {
        getSize: getSize,
        push: push,
        iter: iter
    }
}

function test() {
    const cq = CircularQueue(20)
    for (let i = 0; i < 25; i++) {
        cq.push(i)
    }
    cq.iter(console.log)
}

module.exports = { time, CircularQueue }

if (require.main === module) {
    test()
}