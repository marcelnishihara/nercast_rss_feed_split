const CloudStorage = require('./src/cloud_storage.js')


const main = async _ => {
    let cs = new CloudStorage()
    await cs.run()
    
    cs.files.forEach(file => {
        console.info(file.name)
    })
}


main()
