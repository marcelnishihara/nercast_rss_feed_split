const CloudStorage = require('./src/cloud_storage.js')


const main = async _ => {
    let cs = new CloudStorage()
    await cs.execute()
    
    cs.objects.forEach(object => {
        console.info(object.name)
    })

}


main()
