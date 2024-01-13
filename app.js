const Spotify = require('./src/spotify')
const Helpers = require('./src/helpers')

const main = async _ => {
    let nerdcastId = '22Wgt4ASeaw8mmoqAWNUn1'
    let spotify = new Spotify(nerdcastId)
    await spotify.run()
    
    Helpers.log(
        './databases/__nerdcast.json',
        JSON.stringify(spotify.nerdcast, null, 4)
    )
}


main()
