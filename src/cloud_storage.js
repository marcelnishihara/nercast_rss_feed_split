const { Storage } = require('@google-cloud/storage')
const NerdCast = require('../src/nerdcast.js')
const serviceAccount = require('../credentials/cloud_storage.json')


class CloudStorage {
    #files = new Array()

    constructor (projectId = 'nercast-rss-feed-split') {
        this.storage = new Storage({
            projectId: projectId,
            credentials: {
                client_email: serviceAccount.client_email,
                private_key: serviceAccount.private_key
            }
        })
    }


    get files() {
        return this.#files
    }


    async #listFiles(bucketName = 'nercast-rss-feed-split') {
        [this.#files] = await this.storage.bucket(bucketName).getFiles()
    }


    async run() {
        await this.#listFiles()
    }
}


module.exports = CloudStorage
