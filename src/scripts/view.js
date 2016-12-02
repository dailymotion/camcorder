import delegate from 'delegate'

export default class View {
  constructor(template) {
    this.template         = template

    // Views
    this.recordView       = document.querySelector('.record-view')
    this.listView         = document.querySelector('.list-view')
    this.watchView        = document.querySelector('.watch-view')

    // Record View
    this.recordBtn        = document.getElementById('recordBtn')
    this.showListBtn      = document.getElementById('showListBtn')
    this.videoRecElem     = document.querySelector('.record-view video')

    // List View
    this.listViewBackBtn  = document.getElementById('listViewBackBtn')
    this.loginBtn         = document.getElementById('loginBtn')
    this.logoutBtn        = document.getElementById('logoutBtn')
    this.listViewList     = this.listView.querySelector('ul')

    // Watch View
    this.watchViewBackBtn = document.getElementById('watchViewBackBtn')
    this.videoWatchElem   = document.querySelector('.watch-view video')
  }

  showItemList(items) {
    this.recordView.classList.toggle('hidden', true)
    this.listView.classList.toggle('hidden', false)
    this.watchView.classList.toggle('hidden', true)
    this.listViewList.innerHTML = this.template.itemList(items)
  }

  listViewBack() {
    this.recordView.classList.toggle('hidden', false)
    this.listView.classList.toggle('hidden', true)
    this.watchView.classList.toggle('hidden', true)
  }

  setMediaStream(mediaStream) {
    /* use the stream */
    this.videoRecElem.srcObject = mediaStream
    this.videoRecElem.onloadedmetadata = () => {
      this.videoRecElem.play()
      this._scaleVideoElem(this.videoRecElem)
      this.recordBtn.removeAttribute('disabled')
    }
  }

  unsetMediaStream() {
    this.videoRecElem.pause()
    this.videoRecElem.srcObject = null
    this.recordBtn.setAttribute('disabled', 'disabled')
  }

  setRecordingStarted() {
    this.showListBtn.setAttribute('disabled', 'disabled')
    this.recordBtn.classList.add('recording')
  }

  setRecordingStopped() {
    this.showListBtn.removeAttribute('disabled')
    this.recordBtn.classList.remove('recording')
  }

  watchRecording(item) {
    this.recordView.classList.toggle('hidden', true)
    this.listView.classList.toggle('hidden', true)
    this.watchView.classList.toggle('hidden', false)


    this.videoWatchElem.src = URL.createObjectURL(item.blob)
    this.videoWatchElem.onloadedmetadata = () => {
      this._scaleVideoElem(this.videoWatchElem)
      this.videoWatchElem.play()
    }
  }

  clearVideoWatch() {
    this.videoWatchElem.pause()
    URL.revokeObjectURL(this.videoWatchElem.src)
    this.videoWatchElem.removeAttribute('src')
  }

  downloadItem(item) {
    const a = document.createElement('a')
    document.body.appendChild(a)
    a.style = 'display: none'
    a.href = URL.createObjectURL(item.blob)
    a.download = `VID-${item.id}.webm`
    a.click()
    window.URL.revokeObjectURL(a.href)
    document.body.removeChild(a)
  }

  updateSession(session) {
    if (session.message) {
      this.loginBtn.classList.remove('hidden')
      this.logoutBtn.classList.add('hidden')
    }
    else {
      this.loginBtn.classList.add('hidden')
      this.logoutBtn.classList.remove('hidden')
    }
  }

  _scaleVideoElem(videoElement) {
    const elemAspectRatio  = videoElement.offsetHeight / videoElement.offsetWidth
    const videoAspectRatio = videoElement.videoHeight / videoElement.videoWidth
    videoElement.style.transform = `scale(${elemAspectRatio / (videoAspectRatio)})`
  }

  _catchUserAction(videoElement) {
    videoElement.play().catch(() => {})
    videoElement.pause()
  }

  bindShowItemList(handler) {
    this.showListBtn.addEventListener('click', () => {
      handler()
    })
  }

  bindListViewBack(handler) {
    this.listViewBackBtn.addEventListener('click', () => {
      handler()
    })
  }

  bindToggleRecording(handler) {
    this.recordBtn.addEventListener('click', () => {
      handler()
    })
  }

  bindItemActions(handlers) {
    const { watchItem, removeItem, downloadItem, uploadItem } = handlers
    const getItemIdFromDelegateTarget = (target) => parseInt(target.parentElement.dataset.id, 10)

    delegate(this.listViewList, '.remove-btn', 'click', (e) => {
      const itemId = getItemIdFromDelegateTarget(e.delegateTarget)
      removeItem(itemId)
    })

    delegate(this.listViewList, '.download-btn', 'click', (e) => {
      const itemId = getItemIdFromDelegateTarget(e.delegateTarget)
      downloadItem(itemId)
    })

    delegate(this.listViewList, '.dailymotion-btn', 'click', (e) => {
      const itemId = getItemIdFromDelegateTarget(e.delegateTarget)
      uploadItem(itemId)
    })

    delegate(this.listViewList, 'label', 'click', (e) => {
      const itemId = getItemIdFromDelegateTarget(e.delegateTarget)
      // Catch user action right away, so watchItem will be free to call play() on the video element asynchronously
      this._catchUserAction(this.videoWatchElem)
      watchItem(itemId)
    })
  }

  bindWatchViewBack(handler) {
    this.watchViewBackBtn.addEventListener('click', () => {
      handler()
    })
  }

  bindLoginActions(handlers) {
    const {login, logout} = handlers
    this.loginBtn.addEventListener('click', () => {
      login()
    })
    this.logoutBtn.addEventListener('click', () => {
      logout()
    })
  }
}
