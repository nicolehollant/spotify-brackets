import { useEffect, useState } from 'react'

function generateRandomString(length: number) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const useSpotifyApi = () => {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const client_id = '968806d4e93344a783676a817d59750a'
    const redirect_uri = 'http://localhost:3000/auth'
    const state = generateRandomString(16)
    localStorage.setItem('stateKey', state)
    const scope = 'user-read-private user-read-email'

    let _url = 'https://accounts.spotify.com/authorize'
    _url += '?response_type=token'
    _url += '&client_id=' + encodeURIComponent(client_id)
    _url += '&scope=' + encodeURIComponent(scope)
    _url += '&redirect_uri=' + encodeURIComponent(redirect_uri)
    _url += '&state=' + encodeURIComponent(state)
    setUrl(_url)
  }, [])

  return {
    url,
  }
}

export const spotifyFetch = () => {
  const SPOTIFY_BASE = 'https://api.spotify.com/v1'
  const get = async (path: string) => {
    const auth = localStorage.getItem('accessToken')
    if (!auth) {
      throw new Error('unauthorized')
    }
    const data = await fetch(SPOTIFY_BASE + path, {
      headers: {
        Authorization: `Bearer ${auth}`,
      },
    })
    const json = await data.json()
    return json
  }
  return { get }
}
