const { Storage } = require('@google-cloud/storage')
const serviceAccount = require('../credentials/__service_account.json')


class CloudStorage {
    #storage
    #objects

    constructor (projectId = 'm2l.tech') {      
        this.projectId = projectId
    }


    /**
     * @type {Storage.bucket.files[]}
     * @returns {Storage.bucket.files[]} Objects from a given bucket
     */
    get objects() {
        return this.#objects
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
     * @method #getObjectsFromBucket
     * @param {String} bucketName - Bucket name
     */
    async #getObjectsFromBucket(bucketName = 'nerdcastfeeds.m2l.tech') {
        [this.#objects] = await this.#storage.bucket(bucketName).getFiles()
    }


    /**
     * The only public method executes all private ones to create a 
     * valid RSS feed content for each subject and upload them into the 
     * bucket, replacing the old files if exists.
     * 
     * @method execute
     */
    async execute() {
        this.#authentication()
        await this.#getObjectsFromBucket()
    }
}


module.exports = CloudStorage
