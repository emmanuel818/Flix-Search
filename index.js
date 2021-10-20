const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;


//mongoose.connect('mongodb://localhost:27017/flixSearchDB', {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.connect( process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true})

const bodyParser = require('body-parser');
const express = require('express');

//Imports Morgan locally
const morgan = require('morgan');

const {check, validationResult} = require('express-validator');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

const cors = require('cors');

let allowedOrigins = ['http:localhost8080', 'http:/testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){// If a specific origin isn't found on the list of allowed origins
        let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
        return callback(new Error(message). false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app); // app argument ensures that Express is available in auth.js file


const passport = require('passport');
require('./passport');


//logs content using preexisting library Morgan by passing it into the app.use function
// common parameter specifies that requests should be logged using Morgans common format
app.use(morgan('common'));

//app.use function is how to invoke middelware functions
app.use(express.static('public'));


app.get ('/', (req, res) => {
  res.send('Welcome to the Search Flix APP!');
});

// return a list of ALL movies to users
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
  //grabs data on all documents within a collection
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Gets data about a single movie, by title
app.get('/movies/:title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ Title: req.params.title })
  .then((movieTitle) => {
    res.json(movieTitle);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


// Returns data about a genre by name
app.get('/genres/:name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({'Genre.Name':req.params.name})
  .then((movie) => {
    res.json(movie.Genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
}); 

// Returns data about a director by name
app.get('/directors/:name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({'Director.Name': req.params.name})
  .then((movie) => {
    res.json(movie.Director);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


// Adds data for a new user 
app.post('/users', 
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - notallowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req,res) => {
    
  let errors = validationResult(req);

    if(!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array() });
    }

   // Checks if the user already exists 
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username})
  .then((user) => {
    //If username does exists then you send back appropiate response
    if (user) {
      return res.status(400).send(req.body.Username + 'already exisits');
    // If it doesnt exists, then it creates a new user
    } else {
      Users
      .create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
      .then((user) =>{res.status(201).json(user)})
    .catch((error)=> {
      console.error(error);
      res.status(500).send('Error: ' + error);
      })
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', {session: false}),
 (req, res) => {
  Users.findOne({ Username: req.params.Username })
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Updates user information by username
app.put('/users/:Username', passport.authenticate('jwt', {session: false}),
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - notallowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  let errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.Password)
  Users.findOneAndUpdate({ Username: req.params.Username}, {$set: 
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true}, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username}, {
    $push: { FavoriteMovies: req.params.MovieID}
  },
  { new: true}, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Remove Favorite Movie from user's list
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username}, {
    $pull: { FavoriteMovies: req.params.MovieID}
  },
  { new: true}, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res)=> {
  Users.findOneAndRemove({ Username: req.params.Username})
  .then ((user) => {
    if (!user) {
      res.status(400).send(req.params.Username + ' was not found');
    } else {
      res.status(200).send(req.params.Username + ' was deleted.');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
})

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});

