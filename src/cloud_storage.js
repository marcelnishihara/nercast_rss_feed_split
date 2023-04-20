const { Storage } = require('@google-cloud/storage')
const serviceAccount = require('../credentials/cloud_storage.json')


class CloudStorage {
    #storage
    #files = new Array()

    constructor (projectId = 'nerdcast-feeds') {
        this.projectId = projectId
    }


    /**
     * @type {Storage.bucket.files[]}
     * @returns {Storage.bucket.files[]} Objects from a given bucket
     */
    get files() {
        return this.#files
    }


    /**
     * Google Cloud Storage authentication proccess stores a new 
     * Storage session into the private property ``this.#storage``.
     * 
     * @method #authentication
     */
    #authentication() {
        this.#storage = new Storage({
            projectId: this.projectId,
            credentials: {
                client_email: serviceAccount.client_email,
                private_key: serviceAccount.private_key
            }
        })
    }


    /**
     * Gets the all objects from a bucket named in the parameter and 
     * populate the private property ``#files``
     * 
     * @method #getFilesFromBucket
     * @param {String} bucketName - Bucket name
     */
    async #getFilesFromBucket(bucketName = 'nerdcast-feeds') {
        [this.#files] = await this.#storage.bucket(bucketName).getFiles()
    }


    /**
     * The only public method executes all private ones to create a 
     * valid RSS feed content for each subject and upload them into the 
     * bucket, replacing the old files if exists.
     * 
     * @method run
     */
    async run() {
        this.#authentication()
        await this.#getFilesFromBucket()
    }
}


module.exports = CloudStorage
