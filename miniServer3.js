"use strict"
// http://server162.site:53509/

const express = require('express'); // for server
const APIrequest = require('request'); // for google translate API
const http = require('http'); // for google translate API
const sqlite3 = require("sqlite3").verbose(); // for database
const fs = require("fs"); // for database
const passport = require('passport'); // for login, "Passport.js is authentication middleware for Node.js"
const cookieSession = require('cookie-session'); // for login
const GoogleStrategy = require('passport-google-oauth20'); // for login

const port = 53509;
const APIkey = "AIzaSyAlXyqrOQeBQtVkfvu8jFB-wuCAP30U7I0";
const url = "https://translation.googleapis.com/language/translate/v2?key=" + APIkey;
const flashcardsDB = 'Flashcards.db';
const usersDB = 'Users.db';
const googleLoginData = {
  clientID: '861256240956-2en7bh44hrs5ouetabho08clipig8qq8.apps.googleusercontent.com',
  clientSecret: 'AgKIoP9I1nblM9tLsThyFay4',
  callbackURL: '/auth/redirect'
};

passport.use( new GoogleStrategy(googleLoginData, gotProfile) );
const app = express();
app.use('/', printURL);
app.use(cookieSession({
  maxAge: 6 * 60 * 60 * 1000, // Six hours in milliseconds
  keys: ['bear crossed the road with a chicken in its hand']
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/*', express.static('public'));
app.get('/auth/google', passport.authenticate('google',{ scope: ['profile'] }) );
app.get('/auth/redirect',
  function(req, res, next) {
    console.log("at auth/redirect");
    next();
  },
  passport.authenticate('google'),
  function(req, res) {
    console.log('Logged in and using cookies!')
    res.redirect('/user/lango.html');
  }
);
app.get('/user/*', isAuthenticated, express.static('.'));
app.get('/user/sync', synchronize);
app.get('/user/translate', translateHandler);
app.get('/user/store', storeHandler);
app.get('/user/flashcard', sendFlashcard); // /user/flashcard or /user/flashcard?last=X
app.get('/user/update', updateDB); // /user/update?fid=X&correct=X
app.use(fileNotFound);
app.listen(port, function() {
  console.log('Listening...');
})


/*
 *  Authentication (Google Login) Stuff:
 */

function printURL(req, res, next) {
  console.log(req.url);
  next();
}

function isAuthenticated(req, res, next) {
  if (req.user) {
    console.log("Req.session:", req.session);
    console.log("Req.user:", req.user);
    next();
  } else {
    res.redirect('/login.html'); // send response telling
    // Browser to go to login page
  }
}

function gotProfile(accessToken, refreshToken, profile, done) {
  console.log("Google profile", profile);
  const db = new sqlite3.Database(usersDB);
  const cmdStr = 'INSERT or IGNORE into Users VALUES(@0, @1)'; // add user if not in DB
  db.run(cmdStr, profile.id, profile.displayName, function(err) {
    if (err)
      console.log("ERROR: @UsersDB INSERT.", err);
  });
  db.get('SELECT rowid, * from Users WHERE googleID=' + profile.id, function(err, rowData) { // find googleID in DB
    if (err)
      console.log("ERROR: @UsersDB SELECT.", err);
    else {
      console.log("got: ", rowData, "\n");
      done(null, rowData.rowid);
    }

    db.close();
  });
}

passport.serializeUser((dbRowID, done) => {
  console.log("SerializeUser. Input is", dbRowID);
  done(null, dbRowID);
});

passport.deserializeUser((dbRowID, done) => {
  console.log("deserializeUser. Input is:", dbRowID);
  const db = new sqlite3.Database(usersDB);
  db.get('SELECT rowid, name from Users WHERE rowid=' + dbRowID, function(err, rowData) {
    if (err)
      console.log("ERROR: @UsersDB SELECT.", err);
    else {
      console.log("got: ", rowData.name, "\n");
      let userData = {
        id: rowData.rowid,
        name: rowData.name
      };
      done(null, userData);
    }

    db.close();
  });
});


/*
 *  Query Handlers
 */

function translateHandler(req, res, next) { //translate?english=example%20phrase
  let qObj = req.query;

  if (qObj.english != undefined) {
    let requestObject = {
      "source": "en",
      "target": "ja",
      "q": [qObj.english]
    }

    console.log("English phrase: ", requestObject.q[0]);

    APIrequest({ // HTTP header stuff
      url: url,
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      // will turn the given object into JSON
      json: requestObject
    }, APIcallback);

    // callback function, called when data is received from API
    function APIcallback(err, APIresHead, APIresBody) {
      if ((err) || (APIresHead.statusCode != 200)) {
        console.log("Got API error");
      } else {
        if (APIresHead.error) { // API worked but is not giving you data
          console.log(APIresHead.error);
        } else {
          console.log(JSON.stringify(APIresBody, undefined, 2));
          res.json({
            "English": requestObject.q[0],
            "Japanese": APIresBody.data.translations[0].translatedText
          });
        }
      }
    } // end callback function
  } else {
    next();
  }
}

function storeHandler(req, res, next) {
  let qObj = req.query;
  console.log(qObj);

  if (qObj.english != undefined) {
    const db = new sqlite3.Database(flashcardsDB);
    const cmdStr = 'INSERT into Flashcards (user, english, japanese, seen, correct) VALUES (@0, @1, @2, 0, 0)';
    db.run(cmdStr, req.user.id, qObj.english, qObj.japanese, insertCallback);

    function insertCallback(err) {
      if (err) {
        console.log("ERROR: @FlashcardsDB INSERT", err);
      } else {
        console.log("Flashcards stored.");
        res.json();
        db.close();
      }
    }
  } else {
    next();
  }
}

function synchronize(req, res, next) {
  const db = new sqlite3.Database(flashcardsDB);
  db.get('SELECT rowid from Flashcards WHERE user=' + req.user.id, function(err, rowData) {
    if (err)
      console.log("ERROR: @FlashcardsDB SELECT.", err);
    else {
      console.log("got: ", rowData, "\n");
      if (rowData)
        res.json({"name": req.user.name, "returning": "1"});
      else
        res.json({"name": req.user.name, "returning": "0"});
    }

    db.close();
  });
}

function sendFlashcard(req, res, next) {
  let qObj = req.query;
  const db = new sqlite3.Database(flashcardsDB);

  db.get('SELECT * from Flashcards WHERE user=' + req.user.id, function(err, rowData) {
    if (err)
      console.log("ERROR @FlashcardsDB SELECT.", err);
    else {
      if (rowData == undefined)
        res.json({"fid": -1});
      else {
        db.all('SELECT rowid, english, japanese from Flashcards WHERE user=' + req.user.id, function(err, rowData) {
          if (err)
            console.log("ERROR @FlashcardsDB SELECT.", err);
          else {
            let randInt = Math.floor(Math.random() * rowData.length);

            if (qObj.last != undefined && rowData.length > 1) {
              while (randInt + 1 == qObj.last) {
                randInt = Math.floor(Math.random() * rowData.length);
              }
            } // so user don't get same flashcard consecutively

            res.json({"fid": rowData[randInt].rowid, "english": rowData[randInt].english,
                        "japanese": rowData[randInt].japanese});
          }

          db.close();
        });
      }
    }
  });
}

function updateDB(req, res, next) {
  let qObj = req.query;
  console.log(qObj);

  if (qObj.fid != undefined && qObj.correct != undefined) {
    const db = new sqlite3.Database(flashcardsDB);
    db.run('UPDATE Flashcards SET seen=seen+1, correct=correct+' + qObj.correct + ' WHERE rowid=' + qObj.fid, function(err, rowData) {
      if (err)
        console.log("ERROR: @FlashcardsDB SELECT.", err);
      else
        res.json();
      db.close();
    });
  } else {
    next();
  }
}

function fileNotFound(req, res) {
  let url = req.url;
  res.type('text/plain');
  res.status(404);
  res.send('Cannot find ' + url);
}
