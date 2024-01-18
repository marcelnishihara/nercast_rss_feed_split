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

    for (const feed of nerdcast.feeds) {
        if (feed.spotifyPlaylistId === null) {
            console.info(feed.spotifyPlaylistName)
            await spotify.createPlaylist(feed)
        } else if (feed.spotifyPlaylistName) {
            console.info(feed.spotifyPlaylistName)
            await spotify.insertEpisodes(feed)
        }
        await Helpers.sleep(5000)
    }
}


main()
