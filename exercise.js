var express = require('express');
var mysql = require('./dbcon.js');
var CORS = require('cors');

var app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(CORS());
app.set('port', 4256);

// MYSQL Query Request strings
const getAllQuery = 'SELECT id, name, reps, weight, unit, DATE_FORMAT(date, "%Y-%m-%d") AS date FROM workouts';
const insertQuery = 'INSERT INTO workouts (`name`, `reps`, `weight`, `unit`, `date`) VALUES (?,?,?,?,?)';
const updateQuery = 'UPDATE workouts SET name=?, reps=?, weight=?, unit=?, date=? WHERE id=?';
const deleteQuery = 'DELETE FROM workouts WHERE id=?';
const dropTableQuery = 'DROP TABLE IF EXISTS workouts';
const makeTableQuery = `CREATE TABLE workouts(
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        name VARCHAR(255) NOT NULL,
                        reps INT,
                        weight INT,
                        unit BOOLEAN,
                        date DATE)`;

// Get data from database (get date in specific format)
const getAllData = (res) =>{
  context = {};
  mysql.pool.query(getAllQuery, (err, rows, fields) => {
    if(err) {
      next(err);
      return;
    }
    context.results = JSON.stringify(rows);
    context.rows = rows;
    res.send(context);
  });
};

// Get data for workout table when page is visited
app.get('/',function(req,res,next){
    getAllData(res);
});

// Update database when user adds exercise/entry, then send back updated data
app.post('/', function(req,res,next){
    var { name, reps, weight, unit, date } = req.body;
    mysql.pool.query(insertQuery, [name, reps, weight, unit, date], (err, result) =>{
      if(err){
        next(err);
        return;
      } 
      getAllData(res);
    });
});

// Update database when user deletes exercise/entry, then send back updated data
app.delete('/',function(req,res,next){
  var { id } = req.body
  mysql.pool.query(deleteQuery, [id], (err, result)=> {
    if(err){
      next(err);
      return;
    }
    getAllData(res)
  });
});

// Update database when user edits exercise/entry, then sends back updated data
app.put('/',function(req,res,next){
  var { name, reps, weight, unit, date, id } = req.body;
  mysql.pool.query(updateQuery, [name, reps, weight, unit, date, id], (err, result) =>{
    if(err){
      next(err);
      return;
    }
    getAllData(res);
  });
});

// Update database/delete table when user resets table
app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query(dropTableQuery, function(err){ //replace your connection pool with the your variable containing the connection pool
    mysql.pool.query(makeTableQuery, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});

// 404 Error
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

// 500 Error
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://flip2.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
});
