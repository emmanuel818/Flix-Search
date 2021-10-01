const bodyParser = require('body-parser');
const express = require('express');
//Imports Morgan locally
  morgan = require('morgan');
  uuid = require('uuid');

const app = express();

//const http = require('http');

//logs content using preexisting library Morgan by passing it into the app.use function
// common parameter specifies that requests should be logged using Morgans common format
app.use(morgan('common'));

//app.use function is how to invoke middelware functions
app.use(express.static('public'));

app.use(bodyParser.json());


let topMovies = [
    {
      title: 'School of Rock',
      genre: 'Comedy',
      year: 2003
    },
    {
      title: 'Space Jam',
      genre: 'Comedy',
      year: 1996
    },
    {
      title: 'Space Jam',
      genre: 'Comedy',
      year: 1997
    },
    {
      title: 'Nacho Libre',
      genre: 'Comedy',
      year: 2006
    },
    {
      title: 'Napolean Dynamite',
      genre: 'Comedy',
      year: 2004
    },
    {
      title: 'Blue Streak',
      genre: 'Action',
      year: 1999
    },
    {
      title: 'The Parent Trap',
      genre: 'Adventure',
      year: 1998
    },
    {
      title: 'The Avengers',
      genre: 'Action',
      year: 2012
    },
    {
      title: 'Star Wars Episode III',
      genre: 'Action',
      year: 2005
    },
    {
      title: 'Star Trek',
      genre: 'Action',
      year: 2009
    },
    {
      title: 'Star Wars Episode VI',
      genre: 'Action',
      year: 1983
    }
  ];
    

  // GET requests
  // return a list of ALL movies to users
  app.get('/movies', (req, res) => {
    res.json(topMovies);
  });

  // Gets data about a single movie, by title
  app.get('/movies/:title', (req, res) => {
    res.json(topMovies.find((movie) => 
    { return movie.title === req.params.title}));
  });
  
  app.get('/movies/:genre', (req, res) => { 
    res.json(topMovies.find((movie) => 
    { return movie.genre === req.params.director}));
  }); 

  app.get('/movies/:director', (req, res) => {
    res.json(topMovies.find((movie) => 
    { return movie.director === req.params.director}));
  });


  // Adds data for a new user 
  app.post('/users', (req,res) => {
    res.send ('Succesfully post data for new user');
  });

  // Updates user information by username
  app.put('/users/:username', (req, res) => {
    res.send('Succesfully updates user information');
  });


  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  })
  
  // listen for requests
  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });

