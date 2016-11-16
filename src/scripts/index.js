import '../styles/index.scss';

import { App } from './app.js'

// SW plugin
import offline from 'offline-plugin/runtime.js'
offline.install()

App.run()