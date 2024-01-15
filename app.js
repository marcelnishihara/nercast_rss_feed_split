const express = require('express')
const querystring = require('querystring')
const Helpers = require('./src/helpers')

const client = {
  id: process.env['CLIENT_ID'],
  token: process.env['CLIENT_TOKEN']
}

const clientIDAndToken = [
  `${process.env['CLIENT_ID']}:`,
  `${process.env['CLIENT_TOKEN']}`
].join('')

const basic_token = Buffer.from(clientIDAndToken).toString('base64')

const app = express()
const port = 8888
const localhost = `http://localhost:${port}`
const endpoints = { login: '/login', callback: '/callback' }
const redirectUri = `${localhost}${endpoints.callback}`

console.info(`${localhost}${endpoints.login}`)


app.get(endpoints.login, (req, res) => {
  const query = querystring.stringify({
    response_type: 'code',
    client_id: client.id,
    scope: [
      'playlist-read-private ',
      'playlist-modify-private ',
      'playlist-modify-public'
    ].join(''),
    redirect_uri: redirectUri,
    state: process.env['APP_STATE']
  })

  res.redirect(`https://accounts.spotify.com/authorize?${query}`)

})


app.get(endpoints.callback, async (req, res) => {
  const code = req.query.code || null
  const state = req.query.state || null
  let response = new Object()

  if (state === null) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    let options = {
      url: 'GET',
      form: {
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': `Basic ${basic_token}`,
        'content-type': 'application/x-www-form-urlencoded'
      },
      json: true
    }

    response = await fetch(
      'https://accounts.spotify.com/api/token',
      options)

  }
  
  if (response.status === 200) {
    res.status(response.status).send('OK')
    
    const path = './credentials/__spotify_user_credentials.json'
    Helpers.log(path, JSON.stringify(await response.json(), null, 4))
  } else {
    res.status(response.status).send('Not Good')
  }

})


app.listen(port, _ => {
    console.info(`Server running on port ${port}`)
} )
