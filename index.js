const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;


mongoose.connect('mongodb://localhost:27017/flixSearchDB', {useNewUrlParser: true, useUnifiedTopology: true})



const bodyParser = require('body-parser');
const express = require('express');

//Imports Morgan locally
const morgan = require('morgan');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));


//const http = require('http');

//logs content using preexisting library Morgan by passing it into the app.use function
// common parameter specifies that requests should be logged using Morgans common format
app.use(morgan('common'));

//app.use function is how to invoke middelware functions
app.use(express.static('public'));



    

// GET requests
// return a list of ALL movies to users
app.get('/movies', (req, res) => {
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
app.get('/movies/:title', (req, res) => {
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
app.get('/genres/:name', (req, res) => {
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
app.get('/directors/:name', (req, res) => {
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
app.post('/users', (req,res) => {
  // Checks if the user already exists
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
        Password: req.body.Password,
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

// Get all users
app.get('/users', (req, res) => {
  //grabs data on all documents within a collection
  Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Get a user by username
app.get('/users/:Username', (req, res) => {
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
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username}, {$set: 
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Eamil: req.body.Email,
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
app.post('/users/:Username/movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username', (req, res)=> {
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
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

