const fs = require('fs')


class Helpers {
    static log(path, data) {
        fs.appendFile(path, data, err => {
            if (err) throw err
            console.info(`File ${path} created`)
        })
    }
}

module.exports = Helpers
