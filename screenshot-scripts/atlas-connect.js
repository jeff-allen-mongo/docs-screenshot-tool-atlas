var fs = require('fs');
var Nightmare = require('nightmare');
var screenshotSelector = require('nightmare-screenshot-selector');
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('/Users/jeffreyallen/nightmare/atlas_login.prop/.properties.ini');
var resemble = require('node-resemble-js');
var vo = require('vo');

Nightmare.action('screenshotSelector', screenshotSelector);

const login_user_selector = '.login-form-group-control[name=username]';
const login_pass_selector = '.login-form-group-control[name=password]';

const username = properties.get('jeff.login.username');
const password = properties.get('jeff.login.password');

var orig_image_path = '/Users/jeffreyallen/github/cloud-docs/cloud-docs/cloud-screenshots/atlas-connect/atlas-connect.png';
var screenshot_path = '/Users/jeffreyallen/github/cloud-docs/cloud-docs/cloud-screenshots-temp/atlas-connect/atlas-connect.png';

function * run() {
  // start Nightmare
  var nightmare = Nightmare({
    show: true,
    typeInterval: 20,
    width: 1024,
    height: 768
  });

  // go to atlas login page
  yield nightmare.goto('https://cloud.mongodb.com/user#/atlas/login')
    .wait(login_user_selector)
    .type(login_user_selector, username)
    .type(login_pass_selector, password)
    .click('.login-form-submit-button')
    .wait('button.js-connect')
    .wait(500)
    .click('button.js-connect')
    .wait(500)
    /*
    .evaluate(function() {
      var body = document.querySelector('body');
      return {
        height: body.scrollHeight,
        width: body.scrollWidth
      }
    */
    //.screenshot(screenshot_path)

    // take screenshot
    .screenshotSelector({selector: '.view-modal-content', path: screenshot_path})
    .then(function() {
      console.log('Took screenshot!');
      // compare images to see if they need to be replaced
      var image_diff = resemble(screenshot_path).compareTo(orig_image_path).onComplete(function(data) {
        console.log('Mismatch percentage is: ' + data.misMatchPercentage);
        if (data.misMatchPercentage > .05) {
          console.log('Replacing image...');
          fs.rename(screenshot_path, orig_image_path, function(err) {
            if (err) {
              if (err.code === 'EXDEV') {
                copy();
              } else {
                  console.log(err);
              }
              return;
            }
          });
        }
        else {
          console.log('Images are the same. No update needed.');
        }
      });
      // close nightmare
      nightmare.end(function() {
        console.log('Closing Nightmare');
      });
    });
  }

vo(run)(function() {
    console.log('done');
});
