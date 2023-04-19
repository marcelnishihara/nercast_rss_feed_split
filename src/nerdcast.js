const fs = require('fs')
const convert = require('xml-js')


class NerdCast {
    #nerdcastRSSAsJSON = new Object()
    #episodes = new Object()
    #arrayOfFeedsStrings = new Array()
    #rssFilesInfo = new Object()

    /**
     * "Jovem Nerd" is a Brazilian weblog created in 2002 by Alexandre 
     * Ottoni, formerly called by the exact name of the blog, and Deive 
     * Pazos, a.k.a. Azaghâl or Azaghal, as it's more commonly written, 
     * a reference to the character created by J. R. R. Tolkien.
     * 
     * As part of the content produced by the weblog, they released 
     * back on April 2, 2006, the first episode of their podcast 
     * (NerdCast), which is still published weekly on Fridays and 
     * contains over 1000 episodes and a billion downloads.
     * 
     * As a result of this long-term journey, they creatively addressed 
     * several topics, which created a polluted and hard-to-manage feed. 
     * To solve this problem, this class intends to split the official 
     * NerdCast feed into new ones separated by topics based on podcast 
     * episodes name patterns.
     * 
     * @class Nerdcast
     * @author Marcel Nishihara <marcelnishihara+github@gmail.com>
     * @param {String} [feedRSS] - Official NerdCast RSS Feed URL
    */
    constructor (feedRSS = 'https://jovemnerd.com.br/feed-nerdcast/') {
        this.nerdcastRSSUrl = feedRSS
    }


    /**
     * @type {Object}
     * @returns {Object} Official NerdCast RSS Feed as JSON
     */
    get nerdcastRSSAsJSON() {
        return this.#nerdcastRSSAsJSON
    }


    /**
     * @type {Object}
     * @returns {Object} NerdCast episodes separated by topics based on 
     * its name patterns
     */
    get episodes() {
        return this.#episodes
    }


    /**
     * @type {Array}
     * @returns {Array} An array of the new RSS feeds separated by 
     * topics based on the podcast epidodes name patterns
     */
    get arrayOfFeedsStrings() {
        return this.#arrayOfFeedsStrings
    }


    /**
     * @type {Object}
     * @returns {Object} JSON loaded from 
     * ``./databases/rssFilesInfo.json`` file.
     */
    get rssFilesInfo() {
        return this.#rssFilesInfo
    }


    #composeRssFilesInfo() {
        this.#rssFilesInfo = JSON.parse(
            fs.readFileSync('./databases/rssFilesInfo.json')
        )
    }


    async #requestNerdCastOfficialRSS() {
        await fetch(this.nerdcastRSSUrl)
        .then(response => response.text())
        .then(nerdcastRSSText => {
            this.#nerdcastRSSAsJSON = JSON.parse(
                convert.xml2json(nerdcastRSSText, { compact: true })
            )
        })
    }


    #filterEpisodes() {
        for (let feedName in this.#rssFilesInfo) {
            this.#episodes[feedName] = new Array()
        }

        for (let ep of this.#nerdcastRSSAsJSON.rss.channel.item) {
            for (let feedName in this.#rssFilesInfo) {
                const currentRegExp = new RegExp(
                    this.#rssFilesInfo[feedName].regExp, 
                    'i'
                )

                if (currentRegExp.exec(ep.title._text)) {
                    this.#episodes[feedName].push(ep)
                }
            }
        }
    }


    static #startFeed(feed, subject, subjectDescription) {
        const feedDeclarationAndRSSAtributes = [
            `<?xml version="${feed._declaration._attributes.version}" `,
            `encoding="${feed._declaration._attributes.encoding}"?>\n`,
            `<rss `,
            `xmlns:googleplay="${feed.rss._attributes['xmlns:googleplay']}" `,
            `xmlns:itunes="${feed.rss._attributes['xmlns:itunes']}" `,
            `version="${feed.rss._attributes['version']}" `,
            `xmlns:atom="${feed.rss._attributes['xmlns:atom']}">\n`,
        ].join('')

        const ch = feed.rss.channel
        const googlePlayCategory = ch['googleplay:category']
        ._attributes
        .text
        .replace('&', '&amp;')

        const feedChannel = [
            `<channel>\n`,
            `\t<title>"[${ch['title']._text}] ${subject}"</title>\n`,
            `\t<googleplay:author>`,
            `${ch['googleplay:author']._text}`,
            `</googleplay:author>\n`,
            `\t<description>`,
            `${ch['description']._text}. ${subjectDescription}`,
            `</description>\n`,
            `\t<googleplay:image href="`,
            `${ch['googleplay:image']._attributes.href}"/>\n`,
            `\t<language>${ch['language']._text}</language>\n`,
            `\t<link>${ch['link']._text}</link>\n`,
            `\t<atom:link `,
            `href="${ch['atom:link']._attributes.href}" `,
            `rel="${ch['atom:link']._attributes.rel}" `,
            `type="${ch['atom:link']._attributes.type}"/>\n`,
            `\t<copyright>${ch['copyright']._text}</copyright>\n`,
            `\t<lastBuildDate>${ch['lastBuildDate']._text}</lastBuildDate>\n`,
            `\t<itunes:author>${ch['itunes:author']._text}</itunes:author>\n`,
            `\t<itunes:subtitle>`,
            `[${ch['itunes:subtitle']._text}] ${subject}`,
            `</itunes:subtitle>\n`,
            `\t<itunes:summary>`,
            `${ch['itunes:summary']._text}. ${subjectDescription}`,
            `</itunes:summary>`,
            `\n`,
            `\t<itunes:category text=`,
            `"${ch['itunes:category']._attributes.text.replace('&', '&amp;')}`,
            `" />\n`,
            `\t<itunes:owner>\n`,
            `\t\t<itunes:name>`,
            `${ch['itunes:owner']['itunes:name']._text}`,
            `</itunes:name>\n`,
            `\t\t<itunes:email>`,
            `${ch['itunes:owner']['itunes:email']._text}`,
            `</itunes:email>\n`,
            `\t</itunes:owner>\n`,
            `\t<itunes:block>${ch['itunes:block']._text}</itunes:block>\n`,
            `\t<itunes:explicit>`,
            `${ch['itunes:explicit']._text}`,
            `</itunes:explicit>\n`,
            `\t<itunes:image href="${ch['itunes:image']._attributes.href}"`,
            ` />\n`,
            `\t<googleplay:category text="${googlePlayCategory}"/>\n`,
            `\t<image>\n`,
            `\t\t<url>${ch['image'].url._text}</url>\n`,
            `\t\t<title>${ch['image'].title._text}</title>\n`,
            `\t\t<link>${ch['image'].link._text}</link>\n`,
            `\t</image>\n`,
            `\t<managingEditor>`,
            `${ch['managingEditor']._text}`,
            `</managingEditor>\n`
        ].join('')

        return [
            feedDeclarationAndRSSAtributes, 
            feedChannel
        ].join('')
    }


    static #getEpisodes(episodes) {
        let listOfEpisodes = new Array()

        episodes.forEach(ep => {
            listOfEpisodes.push([
                '\t<item>\n',
                `\t\t<title>${ep.title._text}</title>\n`,
                `\t\t<link>${ep.link._text}</link>\n`,
                `\t\t<itunes:summary>`,
                `${ep['itunes:summary']._text}`,
                `</itunes:summary>\n`,
                `\t\t<itunes:image href="`,
                `${ep['itunes:image']._attributes.href}"/>\n`,
                `\t\t<itunes:duration>`,
                `${ep['itunes:duration']._text}`,
                `</itunes:duration>\n`,
                `\t\t<enclosure url="${ep.enclosure._attributes.url}" `,
                `length="${ep.enclosure._attributes.length}" `,
                `type="${ep.enclosure._attributes.type}"/>\n`,
                `\t\t<pubDate>${ep.pubDate._text}</pubDate>\n`,
                `\t\t<guid>${ep.guid._text}</guid>\n`,
                `\t\t<description>`,
                `<![CDATA[${ep.description._cdata}]]>`,
                `</description>\n`,
                '\t</item>\n'
            ].join(''))
        })

        return listOfEpisodes.join('')

    }


    #createRSSFileContent(subject, subjectDescription, episodes) {
        return new Promise(resolve => {
            const feed = NerdCast.#startFeed(
                this.#nerdcastRSSAsJSON,
                subject,
                subjectDescription
            )

            const listOfEpisodes = NerdCast.#getEpisodes(episodes)

            resolve([
                feed, 
                listOfEpisodes, 
                '</channel>\n', 
                '</rss>\n'
                ].join('')
            )
        })
    }


    #composeArrayOfFeedStrings() {
        for (let feed in this.#episodes) {
            let createRSSPromise = this.#createRSSFileContent(
                this.#rssFilesInfo[feed].name,
                this.#rssFilesInfo[feed].description,
                this.#episodes[feed]
            )

            this.#arrayOfFeedsStrings.push(createRSSPromise)

        }
    }


    async run() {
        this.#composeRssFilesInfo()
        await this.#requestNerdCastOfficialRSS()
        this.#filterEpisodes()        
        this.#composeArrayOfFeedStrings()
        this.#arrayOfFeedsStrings = await Promise.all(this.#arrayOfFeedsStrings)
    }
}


module.exports = NerdCast
