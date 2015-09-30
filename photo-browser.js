var closeAndCallback;

var photo = new ReactiveVar(null);
var error = new ReactiveVar(null);
var waitingForPermission = new ReactiveVar(null);

var canvasWidth = 0;
var canvasHeight = 0;

var quality = 80;

Template.viewfinder.rendered = function() {
  var template = this;

  waitingForPermission.set(true);

  Webcam.on('error', function(err) {
    console.log(err);
  });

  Webcam.on( 'live', function() {
    waitingForPermission.set(false);
  } );

  Webcam.setSWFLocation("/packages/benjick_webcam/webcamjs/webcam.swf");

  Webcam.set({
    width: 320,
    height: 240,
    dest_width: 640,
    dest_height: 480,
    image_format: 'jpeg',
    jpeg_quality: 90
  });

  Webcam.attach('#webcam');

};

// is the current error a permission denied error?
var permissionDeniedError = function () {
  return error.get() && (
    error.get().name === "PermissionDeniedError" || // Chrome and Opera
    error.get() === "PERMISSION_DENIED" // Firefox
  );
};

// is the current error a browser not supported error?
var browserNotSupportedError = function () {
  return error.get() && error.get() === "BROWSER_NOT_SUPPORTED";
};

Template.camera.helpers({
  collection: function() {
   return this.collection;
  },
  schemaKey: function() {
   return this.schemaKey;
  },
  photo: function () {
    return photo.get();
  },
  error: function () {
    return error.get();
  },
  permissionDeniedError: permissionDeniedError,
  browserNotSupportedError: browserNotSupportedError
});

Template.camera.events({
  "click .use-photo": function () {
    closeAndCallback(null, photo.get());
  },
  "click .new-photo": function () {
    photo.set(null);
  },
  "click .cancel": function () {
    if (permissionDeniedError()) {
      closeAndCallback(new Meteor.Error("permissionDenied", "Camera permissions were denied."));
    } else if (browserNotSupportedError()) {
      closeAndCallback(new Meteor.Error("browserNotSupported", "This browser isn't supported."));
    } else if (error.get()) {
      closeAndCallback(new Meteor.Error("unknownError", "There was an error while accessing the camera."));
    } else {
      closeAndCallback(new Meteor.Error("cancel", "Photo taking was cancelled."));
    }
  }
});

Template.viewfinder.events({
  'click .shutter': function (event, template) {

    Webcam.snap( function(data_uri) {
     console.log(data_uri);
     photo.set(data_uri);
    } );

  }
});

Template.viewfinder.helpers({
  "waitingForPermission": function () {
    return waitingForPermission.get();
  }
});

/**
 * @summary Get a picture from the device's default camera.
 * @param  {Object}   options  Options
 * @param {Number} options.height The minimum height of the image
 * @param {Number} options.width The minimum width of the image
 * @param {Number} options.quality [description]
 * @param  {Function} callback A callback that is called with two arguments:
 * 1. error, an object that contains error.message and possibly other properties
 * depending on platform
 * 2. data, a Data URI string with the image encoded in JPEG format, ready to
 * use as the `src` attribute on an `<img />` tag.
 */
MeteorCamera.getPicture = function (options, callback) {
  // if options are not passed
  if (! callback) {
    callback = options;
    options = {};
  }

  desiredHeight = options.height || 640;
  desiredWidth = options.width || 480;

  // Canvas#toDataURL takes the quality as a 0-1 value, not a percentage
  quality = (options.quality || 49) / 100;

  if (desiredHeight * 4 / 3 > desiredWidth) {
    canvasWidth = desiredHeight * 4 / 3;
    canvasHeight = desiredHeight;
  } else {
    canvasHeight = desiredWidth * 3 / 4;
    canvasWidth = desiredWidth;
  }

  canvasWidth = Math.round(canvasWidth);
  canvasHeight = Math.round(canvasHeight);

  var view;

  closeAndCallback = function () {
    var originalArgs = arguments;
    UI.remove(view);
    photo.set(null);
    callback.apply(null, originalArgs);
    Webcam.reset();
  };

  view = UI.renderWithData(Template.camera, options);
  UI.insert(view, document.body);
};
