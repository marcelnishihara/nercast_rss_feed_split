const fs = require('fs')
const { resolve } = require('path')


class Helpers {
    /**
     * @method readFile
     */
    static readFile(filePath, asJson = true) {
        let fileData = fs.readFileSync(filePath)
        if (asJson) fileData = JSON.parse(fileData)
        return fileData
    }

    /**
     * @method log
     */
    static log(filePath, data) {
        fs.appendFile(filePath, data, err => {
            if (err) throw err
            console.info(`File ${filePath} created`)
        })
    }

    static sleep(milliseconds ) {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
}


module.exports = Helpers
