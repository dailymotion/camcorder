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
    this.view.bindListViewBack(this.showRecordView.bind(this))
    this.view.bindItemActions({
      watchItem    : this.watchItem.bind(this),
      removeItem   : this.removeItem.bind(this),
      downloadItem : this.downloadItem.bind(this),
      uploadItem   : this.uploadItem.bind(this),
    })
    this.view.bindLoginActions({
      login  : this.login.bind(this),
      logout : this.logout.bind(this),
    })

    // Watch View
    this.view.bindWatchViewBack(this.watchViewBack.bind(this))

    // Initialize Dailymotion SDK
    DM.init()
      .then(DM.getLoginStatus.bind(DM))
      .then(this.view.updateSession.bind(this.view))
      .catch(this.view.updateSession.bind(this.view))

    this.showRecordView()
  }

  // Display Record View and get the video stream from the camera
  showRecordView() {
    this.view.showRecordView()

    this.getUserMedia()                           // Get the stream from the device camera
      .then(this.createMediaRecorder.bind(this))  // Use it to create a MediaRecorder
      .catch(this.handleError.bind(this))         // Handle
  }

  // Select an appropriate recording device
  getMediaDevice() {
    return navigator.mediaDevices.enumerateDevices()
      // We're only interested in video inputs
      .then(devices => devices.filter(d => d.kind === 'videoinput'))
      // Get the last device as it seems to match the back camera on most devices
      .then(devices => {
        if (!devices.length) {
          throw new Error("Your device doesn't have any camera.")
        }
        return devices[devices.length - 1]
      })
  }

  // Get the video stream from the device's camera
  getUserMedia() {
    console.log('getting userMedia stream')
    return this.getMediaDevice()
      .then(device => {
        return navigator.mediaDevices.getUserMedia({
          audio : true,
          video : {
            // width: 1280,
            // height: 1024,
            optional: [{ sourceId: device.deviceId }],
          },
        })
      })
      .then((mediaStream) => {
        console.log('got userMedia stream')
        this.mediaStream = mediaStream
        this.view.setMediaStream(this.mediaStream)
        return this.mediaStream
      })
  }

  // Release the video stream
  releaseUserMedia() {
    if (this.mediaStream) {
      console.log('releasing userMedia stream')
      this.mediaStream.getTracks().forEach((t) => t.stop())
      this.mediaStream = null
    }
  }

  // Create a new mediaRecorder instance and collect the recorded media
  createMediaRecorder(mediaStream) {
    let options = {}
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      options = {
        mimeType: 'video/webm; codecs=vp9'
      }
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
       options = {
        mimeType: 'video/webm; codecs=vp8'
      }
    }

    this.mediaRecorder = new MediaRecorder(mediaStream, options)
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data)
      }
    }
  }

  // Starts the a new recording
  startRecording() {
    console.log('Recording starts...')
    this.recordedChunks = []
    this.mediaRecorder.start()
  }

  // Stop the current recording and return a record item
  stopRecording() {
    console.log('Recording stopped', this.recordedChunks.length)
    this.mediaRecorder.stop()
    return {
      id   : Date.now(),
      blob : new Blob(this.recordedChunks, { type: 'video/webm' }),
    }
  }

  toggleRecording() {
    switch(this.mediaRecorder.state) {
      case 'inactive': {
        this.startRecording()
        this.view.setRecordingStarted()
        break
      }
      case 'recording': {
        const recordedItem = this.stopRecording()

        // Add recording to the local store and display the item list once done
        this.store.addRecording(recordedItem)
          .then((recordings) => {
            console.log('Recording saved:', recordings)
            this.showItemList()
          })
          .catch(this.handleError.bind(this))

        this.view.setRecordingStopped()
        break
      }
      // case 'paused':
      //   break;
    }
  }

  showItemList() {
    this.view.unsetMediaStream()

    // UserMedia is not required anymore, release it
    this.releaseUserMedia()

    this.store.getRecordings()
      .then((recordings) => {
        this.view.showItemList(recordings)
      })
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
    alert(`Sorry\n${err.message ? err.message : 'Something went wrong'}`)
  }
}
