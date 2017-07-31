var delayCount = 0
function setDelay(delay) {
    return new Promise(function (resolve, reject) {
        delayCount ++
        setTimeout(function() {
            delayCount --
            delayCount <= 0 ? resolve() : reject()
        }, delay);
    })
}

module.exports = setDelay