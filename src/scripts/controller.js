/* global MediaRecorder */
/* eslint-disable no-console */
import DM from './dailymotion-helper.js'

export default class Controller {

  constructor(store, view) {
    this.store = store
    this.view = view
    this.mediaStream = null

    // Record View
    this.view.bindShowItemList(this.showItemList.bind(this))
    this.view.bindToggleRecording(this.toggleRecording.bind(this))

    // List View
    this.view.bindListViewBack(this.listViewBack.bind(this))
    this.view.bindItemActions({
      watchItem    : this.watchItem.bind(this),
      removeItem   : this.removeItem.bind(this),
      downloadItem : this.downloadItem.bind(this),
      uploadItem   : this.uploadItem.bind(this),
    })

    DM.init()
      .then(DM.getLoginStatus.bind(DM))
      .then(this.view.updateSession.bind(this.view))
      .catch(this.view.updateSession.bind(this.view))

    this.view.bindLoginActions({
      login  : this.login.bind(this),
      logout : this.logout.bind(this),
    })

    // Watch View
    this.view.bindWatchViewBack(this.watchViewBack.bind(this))

    this.getUserMedia()
      .then(this.createMediaRecorder.bind(this))
  }

  getUserMedia() {
    console.log('getting userMedia stream')
    return navigator.mediaDevices.enumerateDevices()
      .then(devices => devices.filter(d => d.kind === 'videoinput'))
      .then(devices => {
        return navigator.mediaDevices.getUserMedia({
          audio : true,
          video : {
            // width: 1280,
            // height: 1024,
            optional: [{ sourceId: devices[devices.length - 1].deviceId }],
          },
        })
        .then((mediaStream) => {
          console.log('got userMedia stream')
          this.mediaStream = mediaStream
          this.view.setMediaStream(this.mediaStream)
          return this.mediaStream
        })
      })
  }

  createMediaRecorder(mediaStream) {
    const options = (function getMediaRecorderOptions() {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        return {mimeType: 'video/webm; codecs=vp9'}
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
         return {mimeType: 'video/webm; codecs=vp8'}
      } else {
        return {}
      }
    })()

    this.mediaRecorder = new MediaRecorder(mediaStream, options)
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data)
      }
    }
  }

  toggleRecording() {
    switch(this.mediaRecorder.state) {
      case 'inactive':
        console.log('Recording starts...')
        this.recordedChunks = []
        this.mediaRecorder.start()

        this.view.setRecordingStarted()
        break

      case 'recording':
        console.log('Recording stopped', this.recordedChunks.length)
        this.mediaRecorder.stop()

        this.store.addRecording({
          id   : Date.now(),
          blob : new Blob(this.recordedChunks, {
            type: 'video/webm'
          }),
        })
        .then((recordings) => {
          console.log('Recording saved:', recordings)
          this.showItemList()
        })
        .catch(this.handleError.bind(this))

        this.view.setRecordingStopped()
        break
      // case 'paused':
      //   break;
    }
  }

  showItemList() {
    this.view.unsetMediaStream()

    // stop recording
    if (this.mediaStream) {
      console.log('releasing userMedia stream')
      this.mediaStream.getTracks().forEach((t) => t.stop())
      this.mediaStream = null
    }

    this.store.getRecordings()
      .then((recordings) => {
        this.view.showItemList(recordings)
      })
      .catch(this.handleError.bind(this))
  }

  listViewBack() {
    this.view.listViewBack()
    this.getUserMedia()
      .then(this.createMediaRecorder.bind(this))
      .catch(this.handleError.bind(this))
  }

  removeItem(itemId) {
    this.store.removeRecording(itemId)
      .then(() => {
        this.showItemList()
      })
      .catch(this.handleError.bind(this))
  }

  downloadItem(itemId) {
    this.store.getRecording(itemId)
    .then((item) => {
      this.view.downloadItem(item)
    })
    .catch(this.handleError.bind(this))
  }

  uploadItem(itemId) {
    this.store.getRecording(itemId)
    .then((item) => {
      return DM.upload(item)
    })
    .then((response) => {
      console.log('Upload done:', response)
      return this.store.updateRecording(itemId, {
        dailymotion_id: response.id
      })
    })
    .then(() => {
      this.showItemList()
    })
    .catch(this.handleError.bind(this))
  }

  watchItem(itemId) {
    this.store.getRecording(itemId)
      .then((item) => {
        this.view.watchRecording(item)
      })
      .catch(this.handleError.bind(this))
  }

  watchViewBack() {
    this.view.clearVideoWatch()
    this.showItemList()
  }

  login() {
    DM.login()
      .then(this.view.updateSession.bind(this.view))
      .catch(this.view.updateSession.bind(this.view))
  }

  logout() {
    DM.logout()
      .then(this.view.updateSession.bind(this.view))
      .catch(this.view.updateSession.bind(this.view))
  }

  handleError(err) {
    console.error('Something went wrong:', err)
  }
}
