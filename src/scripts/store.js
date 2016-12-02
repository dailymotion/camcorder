import localforage from 'localforage'

export default class Store {
  constructor(name) {
    // TODO : check for localforage.supports(localforage.INDEXEDDB)
    localforage.config({
      driver: localforage.INDEXEDDB,
      name,
    })
  }

  getRecordings() {
    return localforage.getItem('recordings')
  }

  getRecording(id) {
    return this.getRecordings()
      .then((recordings) => {
        return recordings.find((recording) => recording.id === id)
      })
  }

  addRecording({id, blob, dailymotion_id = null}) {
    return this.getRecordings()
      .then((recordings) => {
        if (recordings === null) {
          recordings = []
        }
        recordings.unshift({id, blob, dailymotion_id})
        return localforage.setItem('recordings', recordings)
      })
  }

  updateRecording(id, {blob = null, dailymotion_id = null}) {
    return this.getRecordings()
      .then((recordings) => {
        return localforage.setItem('recordings', recordings.map((recording) => {
          if (recording.id === id) {
            recording.blob = blob || recording.blob
            recording.dailymotion_id = dailymotion_id || recording.dailymotion_id
          }
          return recording
        }))
      })
  }

  removeRecording(id) {
    return this.getRecordings()
      .then((recordings) => {
        recordings = recordings.filter((recording) => recording.id !== id)
        return localforage.setItem('recordings', recordings)
      })
  }
}
