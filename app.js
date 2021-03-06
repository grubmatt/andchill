'use strict';
const Plan = require('./models/plan.js');
const Event = require('./models/event.js');
// const ENV = require('./env.js')
const 
  express = require('express'),
  body_parser = require('body-parser'),
  webhook_processor = require('./webhook_processing.js'),
  app = express().use(body_parser.json());

// Allow in-line style
const csp = require('content-security-policy');
const cspPolicy = {
  "content_security_policy": "default-src 'self' style-src 'self' 'unsafe-inline';" 
};
const localCSP = csp.getCSP(cspPolicy);

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));
app.set('views', __dirname + '/views');
// Define the view (templating) engine
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Index
app.get('/', (req, res) => {
  res.render('location')
});

// Webhook Routes
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN
  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

app.post('/webhook', (req, res) => {  
  let body = req.body;
  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender ID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        webhook_processor.handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        webhook_processor.handlePostback(sender_psid, webhook_event.postback);
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Plan Routes
app.get('/plan/:planId', (req, res) => {
  var planId = req.params.planId;
  var rests = Event.find(planId, (events)=> {
    console.log(events);
    res.render('category', { events: events});
  });
});

app.post('/event/:id', (req, res) => {
  Event.delete(req.params.id, () => {
    console.log("deleted");
    res.send(202);
  })
})

app.put('/new/plan/:ownerId/:lat/:lng/:price/:rating/:date', (req,res) => {
  Plan.create(req.params.ownerId, req.params.lat, req.params.lng, req.params.price, req.params.rating, req.params.date, (plan) => {
    res.send(plan);
  });
});

app.get('/restaurants/:planId', (req, res) => {
  var planId = req.params.planId;
  var rests = Event.find(planId, (events)=> {
    console.log(events);
    res.render('category', { events: events});
  });
});