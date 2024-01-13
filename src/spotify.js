class Spotify {
    #apiToken
    #nerdcast

    constructor (showID) {
        this.showID = showID

        this.urlBase = {
            accounts: 'https://accounts.spotify.com/api/',
            api: 'https://api.spotify.com/v1/'
        }
    }


    get nerdcast() {
        return this.#nerdcast
    }


    #composeObject(source, destination) {
        const mergeObjects = [
            destination.constructor === Object,
            source.constructor === Object,
            Object.keys(source).length > 0,
        ].every(element => element === true)

        if (mergeObjects) { destination = { ...destination, ...source } }
        return destination

    }


    async #request(
        method, 
        endpoint, 
        headers = new Object(), 
        body = new String(),
        requestToken = false) {
        let base = new String()
        requestToken ? base = this.urlBase.accounts : base = this.urlBase.api

        const options = {
            method: method,            
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }

        if (body.length > 0 && body.constructor === String) options.body = body
        options.headers = this.#composeObject(options.headers, headers)
        const response = await fetch(`${base}${endpoint}`, options)

        if (response.status == 200) {
            const responseJson = await response.json()

            if (requestToken) {
                this.#apiToken = responseJson.access_token
            } else {
                this.#nerdcast = responseJson
            }
        } else {
            const errorMsg = [
                `Request status code is ${response.status}, `,
                `meaning ${response.statusText}`
            ].join('')

            throw new Error(errorMsg)

        }
    }


    async #requestToken() {
        const clientIDAndToken = [
            `${process.env['CLIENT_ID']}:`,
            `${process.env['CLIENT_TOKEN']}`
        ].join('')

        const basic_token = Buffer.from(clientIDAndToken).toString('base64')

        await this.#request(
            'POST', 
            'token',
            { Authorization: `Basic ${basic_token}` },
            'grant_type=client_credentials',
            true
        )
    }

    async #requestNerdCast() {
        await this.#request(
            'GET', 
            `shows/${this.showID}`,
            { Authorization: `Bearer ${this.#apiToken}` },
        )
    }


    async run() {
        await this.#requestToken()
        await this.#requestNerdCast()
    }
}


module.exports = Spotify
