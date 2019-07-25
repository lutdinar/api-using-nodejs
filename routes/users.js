var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var md5 = require('md5');

var dateNow = new Date();
var tahun = dateNow.getFullYear();
var bulan = dateNow.getMonth() + 1;
var tanggal = dateNow.getDate();
var jam = dateNow.getHours();
var menit = dateNow.getMinutes();
var detik = dateNow.getSeconds();

var waktu = tahun + "-" + bulan + "-" + tanggal + " " + jam + ":" + menit + ":" + detik;

function getConnection() {
    // return mysql.createConnection({
    //     host: 'localhost',
    //     user: 'root',
    //     database: 'db_tugas_akhir'
    // });
    return mysql.createConnection({
      host: 'sakotji.com',
      user: 'u5269467_lutdinar',
      password: 'root123',
      database: 'u5269467_db_tugas_akhir'
    });
}

var connect = getConnection();
connect.connect(function (err) {
    if (err) {
        console.log('users.js a Error connection to database');
        setTimeout(() => {
            getConnection();
        }, 200);
    } else {
        console.log('users.js a Connected to database');
    }
});

connect.on('error', function (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        getConnection();
    } else {
        throw err;
    }
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  // res.send('respond with a resource');
    res.render('userView', {
        title: 'User',
        active: 'user',
        page: 'route: users.js',
        locate: 'Find me on routes/users.js and view/userView.ejs'
    });
});

router.post('/', function (req, res) {
    var msg = {
      'status': 500,
      'message': 'Internal server error'
    };

    var username = req.body.username;
    var password = req.body.password;
    var role = req.body.role;
    var createdAt = waktu;

    var queryString = "INSERT INTO user (username, password, role, created_at) VALUES (?, ?, ?, ?)";
    var connection = getConnection();

    connection.query(queryString, [username, md5(password), role, createdAt], function (err, results, fields) {

        if (err) {
          res.json(msg);
        }

        if (results.affectedRows != 0) {
          console.log('Inserted a new user with id : ' + results.insertId);
          msg['status'] = 200;
          msg['message'] = 'Successfully created new user';
          msg['userId'] = results.insertId;

          res.json(msg);
        } else {
          msg['status'] = 500;
          msg['message'] = 'Failed to inserted a new user';
          msg['userId'] = null;

          res.json(msg)
        }

    });

});

router.put('/', function (req, res) {

    console.log("Updating account user by id : " + req.query.id)

    var msg = {
      'status': 500,
      'message': 'Internal server error'
    };

    var userId = req.query.id;
    var username = req.query.username;
    var password = req.query.password;
    var updatedAt = waktu;

    var queryString = "UPDATE user SET username = ?, password = ?, updated_at = ? WHERE id = ?";
    var connection = getConnection();

    if (!!userId && !!username && !!password && !!updatedAt) {
        console.log("Updated user");

        connection.query(queryString, [username, md5(password), updatedAt, userId], function (err, results, fields) {

          if (err) {
            res.json(msg)
          }

          if (results.affectedRows != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully updated user';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
          } else {
            msg['status'] = 500;
            msg['message'] = 'Failed updated user';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
          }

        });

    } else {
        console.log("Failed updating user")
        msg['status'] = 500;
        msg['message'] = 'Input berdasarkan i.e';
        res.json(msg);
    }

});

router.delete('/', function (req, res) {
    console.log("Deleting user by id : " + req.query.id);

    var msg = {
      'status': 500,
      'message': 'Internal server error'
    };

    var userId = req.query.id;
    var deletedAt = waktu;
    var queryString = "UPDATE user SET deleted_at = ? WHERE id = ?";
    var connection = getConnection()

    connection.query(queryString, [deletedAt, userId], function (err, results, fields) {

        if (err) {
            res.json(msg);
        }

        if (results.affectedRows != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully deleted user by id';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        } else {
            msg['status'] = 500;
            msg['message'] = 'Failed deleted user by id';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg);
        }

    });

});

router.get('/all.json', function (req, res) {

    console.log("Fetching all data users");

    var msg = {
      'status': 500,
      'message': 'Internal server error'
    };

    var queryString = "SELECT id, username, password, role, DATE_FORMAT(created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(deleted_at, '%d-%m-%Y %T') as deleted_at FROM user WHERE deleted_at is null ORDER BY id DESC";
    var connection = getConnection()

    connection.query(queryString, function (err, rows, fields) {

        if (err) {
          res.json(msg)
        }

        if (rows.length != 0) {
          msg['status'] = 200;
          msg['message'] = "Successfully get all data users";
          msg['affectedRows'] = rows.length;

          for (var i = 0; i < rows.length; i++) {
            var dao = rows[i];
            dao.password = 'SECRET';
          }

          msg['users'] = rows;

          res.json(msg)
        } else {
          msg['status'] = 404;
          msg['message'] = "Can\'t get all data users or users is empty";
          msg['affectedRows'] = rows.affectedRows;
          msg['users'] = rows;

          res.json(msg)
        }

    })
});

router.get('/findById.json', function (req, res) {
    console.log("Fetching users by id : " + req.query.id)

    var msg = {
      'status': 500,
      'message': 'Internal server error'
    };

    var userId = req.query.id;
    var connection = getConnection();
    var queryString = "SELECT id, username, password, role, DATE_FORMAT(created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(deleted_at, '%d-%m-%Y %T') as deleted_at FROM user WHERE id = ? AND deleted_at is null ORDER BY id ASC";

    connection.query(queryString, [userId], function (err, rows, fields) {

        if (err) {
          res.json(msg)
        }

        if (rows.length != 0) {
          msg['status'] = 200;
          msg['message'] = 'Succesfully fetch data user by id';
          msg['affectedRows'] = rows.length;
          msg['users'] = rows;

          res.json(msg)
        } else {
          msg['status'] = 404;
          msg['message'] = 'Can\'t find user by id or user is empty';
          msg['affectedRows'] = rows.length;
          msg['users'] = rows;

          res.json(msg)
        }

    });
});

router.get('/findByAttributes.json', function (req, res) {
    console.log('Fetching data user by attribute');

    var msg = {
      'status': 500,
      'message': 'Internal server error'
    };

    var username = req.query.username;
    var password = req.query.password;
    var role = req.query.role;
    var param = [];

    var whereString = "deleted_at is null ";

    if (username != null) {
      whereString += "AND username = ? ";
      param.push(username);
    } else {
      whereString += "AND 1=1 ";
    }

    if (password != null) {
      whereString += "AND password = ? ";
      password = md5(password);
      param.push(password)
    } else {
      whereString += "AND 1=1 ";
    }

    if (role != null) {
      whereString += "AND role = ? ";
      param.push(role)
    } else {
      whereString += "AND 1=1 ";
    }

    var queryString = "SELECT id, username, password, role, DATE_FORMAT(created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(deleted_at, '%d-%m-%Y %T') as deleted_at FROM user WHERE " + whereString + " ORDER BY id ASC";
    var connection = getConnection();

    connection.query(queryString, param, function (err, rows, fields) {

        if (err) {
          res.json()
        }

        if (rows.length != 0) {
          msg['status'] = 200;
          msg['message'] = 'Successfully get all data user by attribute';
          msg['affectedRows'] = rows.length;
          msg['user'] = rows;

          res.json(msg)
        } else {
          msg['status'] = 404;
          msg['message'] = 'Can\'t find data user by attribute or users is empty';
          msg['affectedRows'] = rows.length;
          msg['user'] = rows;

          res.json(msg)
        }

    });
})

router.post('/auth.json', function (req, res) {
    var msg = {
      'status': 500,
      'message': 'Internal server error'
    };

    var username = req.body.username;
    var password = req.body.password;

    var queryString = "SELECT id, username, password, role, DATE_FORMAT(created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(deleted_at, '%d-%m-%Y %T') as deleted_at FROM user WHERE username = ? AND password = ? AND deleted_at is null ORDER BY id ASC";
    var connection = getConnection();

    connection.query(queryString, [username, md5(password)], function (err, rows, fields) {

        if (err) {
          res.json(msg);
        }

        if (rows.length != 0) {
          msg['status'] = 200;
          msg['message'] = 'Successfully get data user by username and password';
          msg['affectedRows'] = rows.length;

          for (var i = 0; i < rows.length; i++) {
            rows[i].password = 'SECRET'
          }

          msg['user'] = rows;

          res.json(msg);
        } else {
          msg['status'] = 404;
          msg['message'] = 'Can\'t find user by username and password or user is empty';
          msg['affectedRows'] = rows.length;
          msg['user'] = rows;

          res.json(msg)
        }

    });

})

module.exports = router;
