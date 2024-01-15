const CloudStorage = require('./src/cloud_storage')
const Spotify = require('./src/spotify')
const NerdCast = require('./src/nerdcast')
const Helpers = require('./src/helpers')


const main = async _ => {
    let nerdcast = new NerdCast()
    await nerdcast.execute(false)

    let spotify = new Spotify()
    await spotify.requestToken()
    await spotify.extract()

    nerdcast.feeds.forEach(async feed => {
        if (feed.spotifyPlaylistId === null) {
            await spotify.createPlaylist(feed)
        } else {
            /*
                insert code to update playlist
            */
        }
    })
}


main()
