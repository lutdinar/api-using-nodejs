var express = require('express');
var router = express.Router();
var mysql = require('mysql');

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
    return  mysql.createConnection({
        host: 'sakotji.com',
        user: 'u5269467_lutdinar',
        password: 'root123',
        database: 'u5269467_db_tugas_akhir'
    });

}

/* GET pengguna listing. */
router.get('/', function (req, res, next) {

    res.render('penggunaView', {
        title: 'Pengguna',
        active: 'pengguna',
        page: 'route: pengguna.js',
        locate: 'Find me on routes/pengguna.js and view/penggunaView.ejs'
    });

});

router.post('/', function (req, res) {
    console.log('Inserted a new data pengguna');

    var msg = {
        'status': 500,
        'message': "Internal server error"
    };

    var nama = req.body.nama;
    var alamat = req.body.alamat;
    var no_telepon = req.body.nomor_telepon;
    var tanggal_lahir = req.body.tanggal_lahir;
    var jenis_kelamin_id = req.body.jenis_kelamin_id;
    var user_id = req.body.user_id;
    var created_at = waktu;

    var queryString = "INSERT INTO pengguna (nama, alamat, nomor_telepon, tanggal_lahir, jenis_kelamin_id, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
    var connection = getConnection();

    connection.query(queryString, [nama, alamat, no_telepon, tanggal_lahir, jenis_kelamin_id, user_id, created_at], function (err, results, fields) {

        if (err) {
            res.json(msg)
        }

        if (results.affectedRows != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully inserted a new data pengguna';

            res.json(msg)
        } else {
            msg['status'] = 500;
            msg['message'] = 'Failed inserted a new data pengguna';

            res.json(msg)
        }

    });

});

router.put('/', function (req, res) {
    console.log("Updating data pengguna by id : " + req.query.id);

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };


    var penggunaId = req.query.id;
    var nama = req.body.nama;
    var noTelepon = req.body.nomor_telepon;
    var alamat = req.body.alamat;
    // var tglLahir = req.body.tanggal_lahir;
    var jenisKelamin = req.body.jenis_kelamin_id;
    var avatar = req.body.avatar;

    // if (!!avatar || avatar == "") {
    //     avatar = null;
    // }

    var userId = req.body.user_id;
    var updatedAt = waktu;

    // var connection = getConnection();
    var queryString = "UPDATE pengguna SET nama = ?, nomor_telepon = ?, alamat = ?, jenis_kelamin_id = ?, avatar = ?, user_id = ?, updated_at = ? WHERE id = ?";

    connection.query(queryString, [nama, noTelepon, alamat, jenisKelamin, avatar, userId, updatedAt, penggunaId], function (err, results, fields) {

        if (err) {
            res.json(msg)
        }

        if (results.affectedRows != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully updated data pengguna';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        } else {
            msg['status'] = 500;
            msg['message'] = 'Failed updated data pengguna';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        }

    });

});

router.delete('/', function (req, res) {
    console.log("Deleting pengguna by id : " + req.query.id);

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var penggunaId = req.query.id;
    var deletedAt = waktu;

    var queryString = "UPDATE pengguna SET deleted_at = ? WHERE id = ?";
    // var connection = getConnection();

    connection.query(queryString, [deletedAt, penggunaId], function (err, results, fields) {

        if (err) {
            res.json(msg)
        }

        if (results.affectedRows != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully deleted pengguna by id';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        } else {
            msg['status'] = 500;
            msg['message'] = 'Failed deleted pengguna by id';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        }

    });

});

router.get('/all.json', function (req, res) {
    console.log("Fetching all data pengguna");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var queryString = "SELECT pengguna.id, pengguna.nama, pengguna.alamat, pengguna.nomor_telepon, DATE_FORMAT(pengguna.tanggal_lahir, '%d-%m-%Y') as tanggal_lahir, pengguna.jenis_kelamin_id, jenis_kelamin.nama jenis_kelamin_nama, DATE_FORMAT(jenis_kelamin.created_at, '%d-%m-%Y %T') as jenis_kelamin_created_at, DATE_FORMAT(jenis_kelamin.updated_at, '%d-%m-%Y %T') as jenis_kelamin_updated_at, DATE_FORMAT(jenis_kelamin.deleted_at, '%d-%m-%Y %T') as jenis_kelamin_deleted_at, pengguna.avatar, user.id user_id, user.username user_username, user.password user_password, user.role user_role, DATE_FORMAT(user.created_at, '%d-%m-%Y %T') as user_created_at, DATE_FORMAT(user.updated_at, '%d-%m-%Y %T') user_updated_at, DATE_FORMAT(user.deleted_at, '%d-%m-%Y %T') user_deleted_at, DATE_FORMAT(pengguna.created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(pengguna.updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(pengguna.deleted_at, '%d-%m-%Y %T') as deleted_at FROM pengguna JOIN user ON pengguna.user_id = user.id JOIN jenis_kelamin ON pengguna.jenis_kelamin_id = jenis_kelamin.id WHERE pengguna.deleted_at is null ORDER BY id DESC";
    // var connection = getConnection();

    connection.query(queryString, function (err, rows, fields) {

        if (err) {
            res.json(msg)
        }

        if (rows.length != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully get all data pengguna';
            msg['affectedRows'] = rows.length;
            msg['penggunas'] = rows;

            res.json(msg)
        } else {
            msg['status'] = 404;
            msg['message'] = 'Can\'t get all data pengguna or pengguna is empty';
            msg['affectedRows'] = rows.length;
            msg['penggunas'] = rows;

            res.json(msg)
        }

    });

});

router.get('/findByAttribute.json', function (req, res) {
    console.log("Fetching all data pengguna by attributes");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var nama = req.query.nama;
    var alamat = req.query.alamat;
    var noTelepon = req.query.nomorTelepon;
    var tglLahir = req.query.tanggalLahir;
    var jenisKelamin = req.query.jenisKelaminId;
    var userId = req.query.userId;

    var whereString = "pengguna.deleted_at is null ";
    var param = [];

    if (nama != null) {
        whereString += "AND pengguna.nama = ? ";
        param.push(nama);
    } else {
        whereString += "AND 1=1 ";
    }

    if (alamat != null) {
        whereString += "AND pengguna.alamat = ? ";
        param.push(alamat)
    } else {
        whereString += "AND 1=1 ";
    }

    if (noTelepon != null) {
        whereString += "AND pengguna.nomor_telepon = ? ";
        param.push(noTelepon)
    } else {
        whereString += "AND 1=1 ";
    }

    if (tglLahir != null) {
        whereString += "AND pengguna.tanggal_lahir = ? ";
        param.push(tglLahir)
    } else {
        whereString += "AND 1=1 ";
    }

    if (jenisKelamin != null) {
        whereString += "AND pengguna.jenis_kelamin_id = ? ";
        param.push(jenisKelamin)
    } else {
        whereString += "AND 1=1 ";
    }

    if (userId != null) {
        whereString += "AND pengguna.user_id = ? ";
        param.push(userId)
    } else {
        whereString += "AND 1=1 ";
    }

    var queryString = "SELECT pengguna.id, pengguna.nama, pengguna.alamat, pengguna.nomor_telepon, DATE_FORMAT(pengguna.tanggal_lahir, '%d-%m-%Y') as tanggal_lahir, pengguna.jenis_kelamin_id, jenis_kelamin.nama jenis_kelamin_nama, DATE_FORMAT(jenis_kelamin.created_at, '%d-%m-%Y %T') as jenis_kelamin_created_at, DATE_FORMAT(jenis_kelamin.updated_at, '%d-%m-%Y %T') as jenis_kelamin_updated_at, DATE_FORMAT(jenis_kelamin.deleted_at, '%d-%m-%Y %T') as jenis_kelamin_deleted_at, pengguna.avatar, user.id user_id, user.username user_username, user.password user_password, user.role user_role, DATE_FORMAT(user.created_at, '%d-%m-%Y %T') as user_created_at, DATE_FORMAT(user.updated_at, '%d-%m-%Y %T') user_updated_at, DATE_FORMAT(user.deleted_at, '%d-%m-%Y %T') user_deleted_at, DATE_FORMAT(pengguna.created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(pengguna.updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(pengguna.deleted_at, '%d-%m-%Y %T') as deleted_at FROM pengguna JOIN user ON pengguna.user_id = user.id JOIN jenis_kelamin ON pengguna.jenis_kelamin_id = jenis_kelamin.id WHERE " + whereString + " ORDER BY id ASC";
    // var connection = getConnection();

    connection.query(queryString, param, function (err, rows, fields) {

        if (err) {
            res.json(msg)
        }

        if (rows.length != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully get all data pengguna by attribute';
            msg['affectedRows'] = rows.length;
            msg['pengguna'] = rows;

            res.json(msg)
        } else {
            msg['status'] = 404;
            msg['message'] = 'Can\'t find all data pengguna by attribute';
            msg['affectedRows'] = rows.length;
            msg['pengguna'] = rows;

            res.json(msg)
        }

    });

});

router.get('/findById.json', function (req, res) {
    console.log("Fetching data pengguna by penggunaId");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var penggunaId = req.query.id;

    var queryString = "SELECT pengguna.id, pengguna.nama, pengguna.alamat, pengguna.nomor_telepon, DATE_FORMAT(pengguna.tanggal_lahir, '%d-%m-%Y') as tanggal_lahir, pengguna.jenis_kelamin_id, jenis_kelamin.nama jenis_kelamin_nama, DATE_FORMAT(jenis_kelamin.created_at, '%d-%m-%Y %T') as jenis_kelamin_created_at, DATE_FORMAT(jenis_kelamin.updated_at, '%d-%m-%Y %T') as jenis_kelamin_updated_at, DATE_FORMAT(jenis_kelamin.deleted_at, '%d-%m-%Y %T') as jenis_kelamin_deleted_at, pengguna.avatar, user.id user_id, user.username user_username, user.password user_password, user.role user_role, DATE_FORMAT(user.created_at, '%d-%m-%Y %T') as user_created_at, DATE_FORMAT(user.updated_at, '%d-%m-%Y %T') user_updated_at, DATE_FORMAT(user.deleted_at, '%d-%m-%Y %T') user_deleted_at, DATE_FORMAT(pengguna.created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(pengguna.updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(pengguna.deleted_at, '%d-%m-%Y %T') as deleted_at FROM pengguna JOIN user ON pengguna.user_id = user.id JOIN jenis_kelamin ON pengguna.jenis_kelamin_id = jenis_kelamin.id WHERE pengguna.deleted_at is null AND pengguna.id = ? ORDER BY id ASC";
    // var connection = getConnection();

    connection.query(queryString, [penggunaId], function (err, rows, fields) {

        if (err) {
            res.json(msg)
        }

        if (rows.length != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully get pengguna by penggunaId';
            msg['affectedRows'] = rows.length;
            msg['pengguna'] = rows;

            res.json(msg)
        } else {
            msg['status'] = 404;
            msg['message'] = 'Can\'t find pengguna by penggunaId or pengguna is empty';
            msg['affectedRows'] = rows.length;
            msg['pengguna'] = rows;

            res.json(msg)
        }

    });

});

module.exports = router;