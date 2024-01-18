const Helpers = require('./helpers')


class Spotify {
    #apiToken = new String()
    #playlists = new Object()
    #nerdCastEpisodes = new Array()

    constructor (
        showID = '22Wgt4ASeaw8mmoqAWNUn1', 
        userId = '316zf222zilo7yddtmmi3zqa6v7m') {
        this.showID = showID
        this.userId = userId

        this.urlBase = {
            accounts: 'https://accounts.spotify.com/api/',
            api: 'https://api.spotify.com/v1/'
        }
    }


    get nerdCastEpisodes() {
        return this.#nerdCastEpisodes
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
        let options = { method: method }
        if (body.length > 0 && body.constructor === String) options.body = body
        options.headers = this.#composeObject(new Object(), headers)
        
        const response = await fetch(`${base}${endpoint}`, options)

        if (response.status >= 200 && response.status <= 299) {
            console.info(`Request Status Code: ${response.status}`)
            return await response.json()
        } else {
            const errorMsg = [
                `Request status code is ${response.status}, `,
                `meaning ${response.statusText}. Response text: `,
                await response.text()
            ].join('')
            throw new Error(errorMsg)
        }
    }


    async #getNerdCastEpisodes(endpoint) {
        return await this.#request(
            'GET', 
            endpoint,
            {
                Authorization: [
                    `${this.#apiToken.token_type} `,
                    `${this.#apiToken.access_token}`
                ].join(''),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        )
    }


    async #getPlaylists(limit = 50, offset = 0) {
        this.#playlists = await this.#request(
            'GET',
            `users/${this.userId}/playlists?limit=${limit}&offset=${offset}`,
            { 
                Authorization: [
                    `${this.#apiToken.token_type} `,
                    `${this.#apiToken.access_token}`
                ].join(''),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        )
    }


    #matchPlaylists(feed) {
        const episodesUri = new Array()

        feed.episodes.forEach(episodeFromRSS => {
            this.#nerdCastEpisodes.forEach(episodeFromSpotify => {
                const isSameEpisode = (
                    episodeFromRSS.title._text === 
                    episodeFromSpotify.name
                )

                if (isSameEpisode) {
                    episodesUri.push(episodeFromSpotify.uri)
                    episodeFromRSS.spotifyUri = episodeFromSpotify.uri
                }

            })
        })

        return episodesUri

    }


    async requestToken() {
        const clientIDAndToken = [
            `${process.env['CLIENT_ID']}:`,
            `${process.env['CLIENT_TOKEN']}`
        ].join('')

        const basic_token = Buffer.from(clientIDAndToken).toString('base64')

        this.#apiToken = await this.#request(
            'POST', 
            'token',
            { 
                Authorization: `Basic ${basic_token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'grant_type=client_credentials',
            true
        )
    }


    async extract() {
        /*
        let offset = {
            number: 0,
            regex: /offset=([0-9]{1,})/
        }

        const limit = 50
        let response = new Object()
        
        do {
            response = await this.#getNerdCastEpisodes(
                [
                    `shows/${this.showID}/episodes?`,
                    `offset=${offset.number}&limit=${limit}`
                ].join('')
            )

            this.#nerdCastEpisodes = [ 
                ...this.#nerdCastEpisodes, 
                ...response.items
            ]

            if (response.next != null) {
                offset.number = offset.regex.exec(response.next)[1]
            }
            
            console.info(`Offset: ${offset.number} | Total: ${response.total}`)

        } while (response.next != null)
        */

        this.#nerdCastEpisodes = Helpers.readFile('databases/__nerdcastEpisodes.json')

    }


    async createPlaylist(feed) {
        const spotifyUserCredentials = Helpers.readFile(
            './credentials/__spotify_user_credentials.json'
        )

        await this.#request(
            'POST',
            `users/${this.userId}/playlists`,
            {
                Authorization: `Bearer ${spotifyUserCredentials.access_token}`,
                'Content-Type': 'application/json'
            },
            JSON.stringify({
                name: feed.spotifyPlaylistName,
                description: feed.spotifyPlaylistDescription
            })
        )
    }


    async insertEpisodes(feed) {
        const episodesUri = this.#matchPlaylists(feed)

        const episodesArrays = episodesUri
        .reverse()
        .reduce((result, item, index) => { 
            const chunkIndex = Math.floor(index/100)
            if (!result[chunkIndex]) result[chunkIndex] = new Array()
            result[chunkIndex].push(item)
            return result
          }, new Array())

        const spotifyUserCredentials = Helpers.readFile(
            './credentials/__spotify_user_credentials.json'
        )

        for (let index in episodesArrays) {
            let position = 0
            index = parseInt(index)
            if (index > 0) position = episodesArrays[index-1].length

            await this.#request(
                'POST',
                `playlists/${feed.spotifyPlaylistId}/tracks`,
                {
                    Authorization: (
                        `Bearer ${spotifyUserCredentials.access_token}`
                    ),
                    'Content-Type': 'application/json'
                },
                JSON.stringify({
                    uris: episodesArrays[index],
                    position: position
                })
            )

            Helpers.sleep(2000)

        }
    }


    async load() {
        await this.#getPlaylists()
    }
}


module.exports = Spotify
