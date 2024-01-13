const fs = require('fs')


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
}


module.exports = Helpers
