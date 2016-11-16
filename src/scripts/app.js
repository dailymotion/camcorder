import Controller from './controller'
import Template from './template'
import Store from './store'
import View from './view'


export const App = {
  run() {
    const store = new Store('Dailymotion Recorder')

    const template = new Template()
    const view = new View(template)

    new Controller(store, view)
  }
}