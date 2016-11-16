/* global DM, DM_API_KEY */
/* eslint-disable no-console */

const ERR_NOT_LOGGED_IN = 'Not logged in'
const ERR_MISSING_PERMISSIONS = 'Missing permissions'

class dmAPI {
  constructor() {
    this._dmAsyncInit = null
  }

  _handleSessionUpdate(resolve, reject, resp) {
    if (!resp.session)
    {
      // user is not logged in
      console.warn(ERR_NOT_LOGGED_IN)
      reject(new Error(ERR_NOT_LOGGED_IN))
    }
    else if (!resp.session.scope)
    {
      // user is logged in, but did not grant any permissions
      console.warn(ERR_MISSING_PERMISSIONS)
      reject(new Error(ERR_MISSING_PERMISSIONS))
    }
    else
    {
      // user is logged in and granted some permissions.
      // perms is a comma separated list of granted permissions
      console.log('[SDK] DM session available:', resp.session)
      resolve(resp.session)
    }
  }

  getLoginStatus() {
    return new Promise((resolve, reject) => {
      console.log('[SDK] DM.getLoginStatus()')
      DM.getLoginStatus(this._handleSessionUpdate.bind(this, resolve, reject))
    })
  }

  init() {
    if (!this._dmAsyncInit) {
      console.log('[SDK] Injecting DM SDK')
      this._dmAsyncInit = new Promise((resolve, reject) => {
        window.dmAsyncInit = () => {
          console.log('[SDK] DM SDK loaded')
          delete window.dmAsyncInit
          resolve()
        }

        const sdk = document.createElement('script')
        sdk.id = 'dm-sdk'
        sdk.async = true
        sdk.src = 'https://api.dmcdn.net/all.js'
        sdk.onerror = err => {
          // Cleanup so we can try to inject the script again later
          const sdk = document.getElementById('dm-sdk')
          sdk.parentElement.removeChild(sdk)
          this._dmAsyncInit = null
          delete window.dmAsyncInit
          reject(err)
        }
        const firstScript = document.getElementsByTagName('script')[0]
        firstScript.parentNode.insertBefore(sdk, firstScript)
      })
      // Initialize as soon as the SDK is ready.
      // As `this._dmAsyncInit` promise is cached, initialization will run only once.
      .then(() => {
        console.log('[SDK] Initializing DM SDK')
        DM.init({
          apiKey: DM_API_KEY, // DM_API_KEY must be defined as an environment variable
          status: true,       // check login status
          cookie: true,       // enable cookies to allow the server to access the session
        })
      })
    }
    return this._dmAsyncInit
  }

  login() {
    return new Promise((resolve, reject) => {
      console.log('[SDK] DM.login()')
      DM.login(
        this._handleSessionUpdate.bind(this, resolve, reject),
        {
          scope   : 'read write',
          // display : 'page',
        }
      )
    })
  }

  logout() {
    return new Promise((resolve, reject) => {
      console.log('[SDK] DM.logout()')
      DM.logout(this._handleSessionUpdate.bind(this, resolve, reject))
    })
  }

  getUploadURL() {
    return this.api({
      path: '/file/upload'
    })
  }

  _uploadFile(item, resp) {
    console.log('[SDK] Uploading file', resp)
    const {upload_url} = resp
    const formData  = new FormData()
    formData.append('file', item.blob, `vid-${item.id}.webm`)

    return fetch(upload_url, {
      method: 'POST',
      body: formData
    })
    .then((resp) => resp.json())
  }

  api({path, method = 'get', params = {}}) {
    return new Promise((resolve, reject) => {
      console.log('[SDK] DM.api()', path, method, params)
      DM.api(path, method, params, (response) => {
        if (!response) {
          reject('No response')
        }
        else if (response.error)
        {
          reject(response.error)
        }
        else
        {
          resolve(response)
        }
      })
    })
  }

  publishVideo(title, upload_response) {
    console.log('[SDK] Create Video', upload_response)
    return this.api({
      path   : '/me/videos',
      method : 'post',
      params : {
        title,
        url : upload_response.url,
        channel   : 'webcam',
        language  : 'en',
        published : false,
      }
    })
  }

  upload(item) {
    return this.init()                            // initialize SDK
      .then(this.getLoginStatus.bind(this))       // Check login status
      .catch((err) => {
        if (err.message === ERR_NOT_LOGGED_IN) {  // Warn if not logged in
          alert('No upload without login... 😰')
        }
        throw err                                 // Forward any other error
      })
      .then(this.getUploadURL.bind(this))         // Get an URL to upload the file
      .then(this._uploadFile.bind(this, item))    // Upload the file
                                                  // Publish a video with the uploaded file
      .then(this.publishVideo.bind(this, `Dailymotion Camera - VID-${item.id}`))
  }
}
export default new dmAPI()