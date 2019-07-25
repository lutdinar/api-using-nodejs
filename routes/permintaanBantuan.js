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

var connection;
function getConnection() {
    // return mysql.createConnection({
    //     host: 'localhost',
    //     user: 'root',
    //     database: 'db_tugas_akhir'
    // });
    connection = mysql.createConnection({
        host: 'sakotji.com',
        user: 'u5269467_lutdinar',
        password: 'root123',
        database: 'u5269467_db_tugas_akhir'
    });

    connection.connect();

    connection.on('error', getConnection());
}

// connec.connect(function (err) {
//     if (err) {
//         console.log('permintaanBantuan.js a Error connection to database');
//         setTimeout(() => {
//             getConnection();
//         }, 200);
//     } else {
//         console.log('permintaanBantuan.js a Connected to database');
//     }
// });

// connect.on('error', function (err) {
//     if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//         getConnection();
//     } else {
//         throw err;
//     }
// });

/* GET permintaan-bantuan listing. */
router.get('/', function (req, res, next) {
    // res.send('respond with a permintaanBantuan.js');
    res.render('permintaanBantuanView', {
        title: 'Permintaan Bantuan',
        active: 'pb',
        page: 'route: permintaanBantuan.js',
        locate: 'Find me on routes/permintaanBantuan.js and view/permintaanBantuanView.ejs'
    });
});

router.post('/', function (req, res) {
    console.log("Inserting new permintaan bantuan");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var tanggal = req.body.tanggal;
    var jenisLayanan = req.body.jenis_layanan_id;
    var lat = req.body.lat;
    var lon = req.body.lon;
    var alamatTempatKejadian = req.body.alamat_tempat_kejadian;
    var statusPermintaanBantuan = req.body.status_permintaan_bantuan;
    var foto = req.body.foto;
    var penggunaId = req.body.pengguna_id;
    var createdAt = waktu;

    var queryString = "INSERT INTO permintaan_bantuan (tanggal, jenis_layanan_id, lat, lon, alamat_tempat_kejadian, status_permintaan_bantuan, foto, pengguna_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    // var connection = getConnection();

    connection.query(queryString, [tanggal, jenisLayanan, lat, lon, alamatTempatKejadian, statusPermintaanBantuan, foto, penggunaId, createdAt], function (err, results, fields) {

        if (err) {
            res.json(msg);
        }

        if (results.affectedRows != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully created new permintaan bantuan';

            res.json(msg)
        } else {
            msg['status'] = 500;
            msg['message'] = 'Failed created new permintaan bantuan';

            res.json(msg)
        }

    });

});

router.put('/updateStatus.json', function (req, res) {
    console.log("Updating data permintaan bantuan by id : " + req.query.id);

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var permintaanBantuanId = req.query.id;
    var statusPermintaan = req.query.statusPermintaanBantuan;
    var updatedAt = waktu;
    var queryString = "UPDATE permintaan_bantuan SET status_permintaan_bantuan = ?, updated_at = ? WHERE id = ?";
    // var connection = getConnection();

    connection.query(queryString, [statusPermintaan, updatedAt, permintaanBantuanId], function (err, results, fields) {

        if (err) {
            res.json(msg)
        }

        if (results.affectedRows != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully updated status permintaan bantuan';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        } else {
            msg['status'] = 500;
            msg['message'] = 'Failed updated status permintaan bantuan';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        }

    });
    
});

router.delete('/', function (req, res) {
    console.log("Deleting permintaan bantuan by id : " + req.query.id)

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var permintaanBantuanId = req.query.id;
    var deletedAt = waktu;

    var queryString = "UPDATE permintaan_bantuan SET deleted_at = ? WHERE id = ?";
    // var connection = getConnection();

    connection.query(queryString, [deletedAt, permintaanBantuanId], function (err, results, fields) {

        if (err) {
            res.json(msg)
        }

        if (results.affectedRows != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully deleted permintaan bantuan by id';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        } else {
            msg['status'] = 500;
            msg['message'] = 'Failed deleted permintaan bantuan by id';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        }

    });

});

router.get('/all.json', function (req, res) {
    console.log("Fetching all data Permintaan Bantuan");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var queryString = "SELECT permintaan_bantuan.id, DATE_FORMAT(permintaan_bantuan.tanggal, '%d-%m-%Y %T') as tanggal, permintaan_bantuan.jenis_layanan_id, jenis_layanan.nama jenis_layanan_nama, permintaan_bantuan.lat, permintaan_bantuan.lon, permintaan_bantuan.alamat_tempat_kejadian, permintaan_bantuan.status_permintaan_bantuan, permintaan_bantuan.foto, permintaan_bantuan.pengguna_id, pengguna.nama pengguna_nama, DATE_FORMAT(pengguna.tanggal_lahir, '%d-%m-%Y') as pengguna_tanggal_lahir, pengguna.nomor_telepon pengguna_nomor_telepon, pengguna.alamat pengguna_alamat, pengguna.jenis_kelamin_id pengguna_jenis_kelamin_id, jenis_kelamin.nama jenis_kelamin_nama, pengguna.user_id pengguna_user_id, pengguna.created_at pengguna_created_at, pengguna.updated_at pengguna_updated_at, pengguna.deleted_at pengguna_deleted_at, DATE_FORMAT(permintaan_bantuan.created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(permintaan_bantuan.updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(permintaan_bantuan.deleted_at, '%d-%m-%Y %T') as deleted_at FROM permintaan_bantuan JOIN pengguna ON permintaan_bantuan.pengguna_id = pengguna.id JOIN jenis_kelamin ON pengguna.jenis_kelamin_id = jenis_kelamin.id JOIN jenis_layanan ON permintaan_bantuan.jenis_layanan_id = jenis_layanan.id WHERE permintaan_bantuan.deleted_at is null ORDER BY id DESC";
    // var connection = getConnection();

    connection.query(queryString, function (err, rows, fields) {

        if (err) {
            res.json(msg);
        }

        if (rows.length != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully get all permintaan bantuan';
            msg['affectedRows'] = rows.length;
            msg['permintaanBantuans'] = rows;

            res.json(msg);
        } else {
            msg['status'] = 404;
            msg['message'] = 'Can\'t get all permintaan bantuan or permintaan bantuan is empty';
            msg['affectedRows'] = rows.length;
            msg['permintaanBantuans'] = rows;

            res.json(msg);
        }

    });
    
});

router.get('/findById.json', function (req, res) {
    console.log("Fetching data permintaan bantuan by id");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };


    var permintaanBantuanId = req.query.id;

    var queryString = "SELECT permintaan_bantuan.id, DATE_FORMAT(permintaan_bantuan.tanggal, '%d-%m-%Y %T') as tanggal, permintaan_bantuan.jenis_layanan_id, jenis_layanan.nama jenis_layanan_nama, permintaan_bantuan.lat, permintaan_bantuan.lon, permintaan_bantuan.alamat_tempat_kejadian, permintaan_bantuan.status_permintaan_bantuan, permintaan_bantuan.foto, permintaan_bantuan.pengguna_id, pengguna.nama pengguna_nama, DATE_FORMAT(pengguna.tanggal_lahir, '%d-%m-%Y') as pengguna_tanggal_lahir, pengguna.nomor_telepon pengguna_nomor_telepon, pengguna.alamat pengguna_alamat, pengguna.jenis_kelamin_id pengguna_jenis_kelamin_id, jenis_kelamin.nama jenis_kelamin_nama, pengguna.user_id pengguna_user_id, DATE_FORMAT(pengguna.created_at, '%d-%m-%Y %T') as pengguna_created_at, DATE_FORMAT(pengguna.updated_at, '%d-%m-%Y %T') as pengguna_updated_at, DATE_FORMAT(pengguna.deleted_at, '%d-%m-%Y %T') as pengguna_deleted_at, DATE_FORMAT(permintaan_bantuan.created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(permintaan_bantuan.updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(permintaan_bantuan.deleted_at, '%d-%m-%Y %T') as deleted_at FROM permintaan_bantuan JOIN pengguna ON permintaan_bantuan.pengguna_id = pengguna.id JOIN jenis_kelamin ON pengguna.jenis_kelamin_id = jenis_kelamin.id JOIN jenis_layanan ON permintaan_bantuan.jenis_layanan_id = jenis_layanan.id WHERE permintaan_bantuan.deleted_at is null AND permintaan_bantuan.id = ? ORDER BY id ASC";
    // var connection = getConnection();

    connection.query(queryString, [permintaanBantuanId], function (err, rows, fields) {

        if (err) {
            res.json(msg)
        }

        if (rows.length != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully get data permintaan bantuan by id';
            msg['affectedRows'] = rows.length;
            msg['permintaanBantuans'] = rows;

            res.json(msg)
        } else {
            msg['status'] = 404;
            msg['message'] = 'Can\'t get data permintaan bantuan by id or permintaan bantuan is empty';
            msg['affectedRows'] = rows.length;
            msg['permintaanBantuans'] = rows;

            res.json(msg)
        }

    });

});

router.get('/findByAttributes.json', function (req, res) {
    console.log("Fecthing all data Permintaan Bantuan by attribute");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var tanggal = req.query.tanggal;
    var jenisLayanan = req.query.jenisLayananId;
    var lat = req.query.lat;
    var lon = req.query.lon;
    var alamatTempatKejadian = req.query.alamatTempatKejadian;
    var statusPermintaanBantuan = req.query.statusPermintaanBantuan;
    var penggunaId = req.query.penggunaId;

    var whereString = "permintaan_bantuan.deleted_at is null ";
    var param = [];

    if (tanggal != null) {
        whereString += "AND permintaan_bantuan.tanggal = ? ";
        param.push(tanggal)
    } else {
        whereString += "AND 1=1 ";
    }

    if (jenisLayanan != null) {
        whereString += "AND permintaan_bantuan.jenis_layanan_id = ? ";
        param.push(jenisLayanan)
    } else {
        whereString += "AND 1=1 ";
    }

    if (lat != null) {
        whereString += "AND permintaan_bantuan.lat = ? ";
        param.push(lat)
    } else {
        whereString += "AND 1=1 ";
    }

    if (lon != null) {
        whereString += "AND permintaan_bantuan.lon = ? ";
        param.push(lon)
    } else {
        whereString += "AND 1=1 ";
    }

    if (alamatTempatKejadian != null) {
        whereString += "AND permintaan_bantuan.alamat_tempat_kejadian = ? ";
        param.push(alamatTempatKejadian)
    } else {
        whereString += "AND 1=1 ";
    }

    if (statusPermintaanBantuan != null) {
        whereString += "AND permintaan_bantuan.status_permintaan_bantuan = ? ";
        param.push(statusPermintaanBantuan)
    } else {
        whereString += "AND 1=1 ";
    }

    if (penggunaId != null) {
        whereString += "AND permintaan_bantuan.pengguna_id = ? ";
        param.push(penggunaId)
    } else {
        whereString += "AND 1=1 ";
    }

    var queryString = "SELECT permintaan_bantuan.id, DATE_FORMAT(permintaan_bantuan.tanggal, '%d-%m-%Y %T') as tanggal, permintaan_bantuan.jenis_layanan_id, jenis_layanan.nama jenis_layanan_nama, permintaan_bantuan.lat, permintaan_bantuan.lon, permintaan_bantuan.alamat_tempat_kejadian, permintaan_bantuan.status_permintaan_bantuan, permintaan_bantuan.foto, permintaan_bantuan.pengguna_id, pengguna.nama pengguna_nama, DATE_FORMAT(pengguna.tanggal_lahir, '%d-%m-%Y') as pengguna_tanggal_lahir, pengguna.nomor_telepon pengguna_nomor_telepon, pengguna.alamat pengguna_alamat, pengguna.jenis_kelamin_id pengguna_jenis_kelamin_id, jenis_kelamin.nama jenis_kelamin_nama, pengguna.user_id pengguna_user_id, pengguna.created_at pengguna_created_at, pengguna.updated_at pengguna_updated_at, pengguna.deleted_at pengguna_deleted_at, DATE_FORMAT(permintaan_bantuan.created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(permintaan_bantuan.updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(permintaan_bantuan.deleted_at, '%d-%m-%Y %T') as deleted_at FROM permintaan_bantuan JOIN pengguna ON permintaan_bantuan.pengguna_id = pengguna.id JOIN jenis_kelamin ON pengguna.jenis_kelamin_id = jenis_kelamin.id JOIN jenis_layanan ON permintaan_bantuan.jenis_layanan_id = jenis_layanan.id WHERE " + whereString + " ORDER BY id DESC";
    // var connection = getConnection();

    connection.query(queryString, param, function (err, rows, fields) {

        if (err) {
            res.json(msg);
        }

        if (rows.length != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully get all permintaan bantuan by attribute';
            msg['affectedRows'] = rows.length;
            msg['permintaanBantuans'] = rows;

            res.json(msg);
        } else {
            msg['status'] = 404;
            msg['message'] = 'Can\'t find all permintaan bantuan by attribute or permintaan bantuan is empty';
            msg['affectedRows'] = rows.length;
            msg['permintaanBantuans'] = rows;

            res.json(msg);
        }

    });

});

module.exports = router;