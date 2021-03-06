const request = require('request');

var facebook = {
  callSendAPI: function(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN,
              "whitelisted_domains":[
                process.env.BASE_URL
              ]
            },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!');
      } else {
        console.error("Unable to send message:" + err);
      }
    })
  },

  beginShareFlow: function(message) {
    window.MessengerExtensions.beginShareFlow(function(share_response) {
      // User dismissed without error, but did they share the message?
      if(share_response.is_sent){
        // The user actually did share. 
        // Perhaps close the window w/ requestCloseBrowser().
      }
    }, 
    function(errorCode, errorMessage) {      
    // An error occurred in the process

    },
    message,
    "broadcast");
  }
}

module.exports = facebook;