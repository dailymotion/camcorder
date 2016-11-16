# Camcorder

A simple Web Application to record, watch and upload videos to dailymotion.

The goal is to showcase [`getUserMedia()`][2] & [`MediaRecorder`][3] APIs, and how they can be used to record and upload a video to Dailymotion, directly from the browser.

[Give it a try][1]

## What do you get?

 - A Mobile app. It also works on desktop but the UI is kind of broken...
 - An Android app. Unfortunately Safari iOS doesn't support `getUserMedia()`/`MediaRecorder` yet. So it will only work on Android devices
 - Features :
   - Record a video from the phone camera
   - List recorded videos
   - Watch (in-app), download (on the device) or remove recorded videos
   - Login to dailymotion, upload a recorded video to your account

 - Works _**Offline!**_ :
   - Recordings are save in [IndexedDB][4] thanks to [localForage][5] library
   - Service Workers are enabled thanks to [offline-plugin][6] for webpack + a `manifest.json` file
   - Upload to Dailymotion is obviously *not* available when offline 😉


## Local setup

1. Clone the repository
2. Run `npm install` in the newly created folder.
3. Run `npm start` to start the [webpack dev server][7]
4. Open `http://localhost:8080/webpack-dev-server/` or `http://localhost:8080/` to test the application.

## NPM Scripts

### `npm run clean`

Clean all files in the `dist` folder.

### `npm run build`

Build the sources files for production

### `npm start`

Run the local server for development. Once the server is started, you should be able

### `npm run deploy`

Build the application for production and deploys it to github pages.

[1]: https://dailymotion.github.io/camcorder
[2]: https://w3c.github.io/mediacapture-main/getusermedia.html#dom-mediadevices-getusermedia "[W3C] getUserMedia()"
[3]: https://developers.google.com/web/updates/2016/01/mediarecorder "Record Audio and Video with MediaRecorder"
[4]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API "[MDN] IndexedDB API"
[5]: https://localforage.github.io/localForage/ "localForage"
[6]: https://github.com/NekR/offline-plugin "offline-plugin"
[7]: https://webpack.github.io/docs/webpack-dev-server.html "webpack dev server"