var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs290_vangemed',
  password        : 'PASSWORD',
  database        : 'cs290_vangemed'
});

module.exports.pool = pool;
