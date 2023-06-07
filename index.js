const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

const accountSid = "AC66cc6e075a23c0f6d5bd1e8a37e22a18";
const authToken = "ee3decb9aa339985c32105b1c1a064fb";
const client = require("twilio")(accountSid, authToken);

app.get("/", (req, res) => {
  let url = req.protocol + "s://" + req.get("host");
  res.json({ message: "server working", url });
});

app.post("/make-call", (req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber ;
    let url = "https://" + req.get("host") + + "/handle-input";
    // Make a call and play the IVRS message
    client.calls
      .create({
        twiml: `<Response><Gather numDigits="1"><Say>You have a visitor. Press 1 to approve, press 2 to deny.</Say></Gather></Response>`,
        to: phoneNumber,
        from: "+13203825643",
        method: "POST",
        action: url,
      })
      .then((call) => {
        console.log("Call performed!\n");
        console.log(call.sid, url);
        res.sendStatus(200);
      });
  } catch (err) {
    res.sendStatus(400);
  }
});

// Endpoint for receiving user input from the IVRS call

app.post("/handle-input", (req, res) => {
  try {
    const userInput = req.body.Digits;

    // Process user input
    let response;
    switch (userInput) {
      case "1":
        response = "<Response><Say>You approved the request.</Say></Response>";
        break;
      case "2":
        response = "<Response><Say>You denied the request.</Say></Response>";
        break;
      default:
        response = "<Response><Say>Invalid input.</Say></Response>";
        break;
    }
    res.type("text/xml");
    console.log(response);
    res.send(response);
  } catch (err) {
    res.sendStatus(400);
  }
});

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
