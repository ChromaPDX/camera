Package.describe({
  name: "chroma:camera",
  summary: "Photos with one function call on desktop and mobile.",
  version: "1.1.5",
  git: "https://github.com/ChromaPDX/camera"
});

Cordova.depends({
  "org.apache.cordova.camera":"0.3.2"
});

Package.onUse(function(api) {
  api.export('MeteorCamera');
  api.use(["templating", "session", "ui", "blaze", 'less@2.0.0', "reactive-var", "benjick:webcam"]);
  api.versionsFrom("METEOR@0.9.2");

  api.addFiles('photo.html');
  api.addFiles('photo.js');
  api.addFiles("camera.less", ["web.browser"]);
  api.addFiles('photo-browser.js', ['web.browser']);
  api.addFiles('photo-cordova.js', ['web.cordova']);
});
