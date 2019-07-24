var express = require('express')
var app = express()
var morgan = require('morgan')
var mysql = require('mysql')
var bodyParser = require('body-parser')
var md5 = require('md5')
var fs = require('fs')
var path = require('path').join(__dirname, '/public')

var dateNow = new Date();
var tahun = dateNow.getFullYear();
var bulan = dateNow.getMonth()+1;
var tanggal = dateNow.getDate();
var jam = dateNow.getHours();
var menit = dateNow.getMinutes();
var detik = dateNow.getSeconds();

var waktu = tahun+"-"+bulan+"-"+tanggal+" "+jam+":"+menit+":"+detik;

app.use(morgan('short'))
app.use(morgan('combined'))

app.use(bodyParser.urlencoded({limit: '50mb', extended: false }));
app.use(bodyParser.json({limit: '50mb'}));

app.use(express.static(path))

// localhost:PORT
var PORT = process.env.PORT || 3003
app.listen(PORT, function () {
    console.log("Server is running on : "+PORT)
});

// setting connection to mysql
function getConnection() {
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
        console.log('Error connection to database');
    } else {
        console.log('Connected to database');
    }
});

app.get('/', function (req, res) {
    console.log('Responding from root route')
    res.send('Hello from ROOT route')
});


// LOGIN AUTHENTICATION USERS
app.post('/api/auth.json', function (req, res) {
    console.log('Authentication for user login');

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

    })

});

// USERS Handling
app.post('/api/user.json', function (req, res) {

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
            console.log('Inserted a new user with id : '+results.insertId);
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

    })

});

app.get('/api/users.json', function (req, res) {
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

})

app.get('/api/find/users.json', function (req, res) {
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

    var queryString = "SELECT id, username, password, role, DATE_FORMAT(created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(deleted_at, '%d-%m-%Y %T') as deleted_at FROM user WHERE "+whereString+" ORDER BY id ASC";
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

});

app.get('/api/:id/user.json', function (req, res) {
    console.log("Fetching users by id : "+req.params.id)

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var userId = req.params.id;
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

// update attribute user for username and password
app.put('/api/:id/user.json', function (req, res) {
    console.log("Updating account user by id : "+req.params.id)

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var userId = req.params.id;
    var username = req.query.username;
    var password = req.query.password;
    var updatedAt = waktu;

    var queryString = "UPDATE user SET username = ?, password = ?, updated_at = ? WHERE id = ?";
    var connection = getConnection();

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

    })

})

app.delete('/api/:id/user.json', function (req, res) {
    console.log("Deleting user by id : "+req.params.id);

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var userId = req.params.id;
    var deletedAt = waktu;
    var queryString = "UPDATE user SET deleted_at = ? WHERE id = ?";
    var connection = getConnection()

    connection.query(queryString, [deletedAt, userId], function (err, results, fields) {

        if (err) {
            res.json(msg)
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

            res.json(msg)
        }

    })

});

// PENGGUNA Handling
app.post('/api/pengguna.json', function (req, res) {
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

app.get('/api/penggunas.json', function (req, res) {
    console.log("Fetching all data pengguna");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var queryString = "SELECT pengguna.id, pengguna.nama, pengguna.alamat, pengguna.nomor_telepon, DATE_FORMAT(pengguna.tanggal_lahir, '%d-%m-%Y') as tanggal_lahir, pengguna.jenis_kelamin_id, jenis_kelamin.nama jenis_kelamin_nama, DATE_FORMAT(jenis_kelamin.created_at, '%d-%m-%Y %T') as jenis_kelamin_created_at, DATE_FORMAT(jenis_kelamin.updated_at, '%d-%m-%Y %T') as jenis_kelamin_updated_at, DATE_FORMAT(jenis_kelamin.deleted_at, '%d-%m-%Y %T') as jenis_kelamin_deleted_at, pengguna.avatar, user.id user_id, user.username user_username, user.password user_password, user.role user_role, DATE_FORMAT(user.created_at, '%d-%m-%Y %T') as user_created_at, DATE_FORMAT(user.updated_at, '%d-%m-%Y %T') user_updated_at, DATE_FORMAT(user.deleted_at, '%d-%m-%Y %T') user_deleted_at, DATE_FORMAT(pengguna.created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(pengguna.updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(pengguna.deleted_at, '%d-%m-%Y %T') as deleted_at FROM pengguna JOIN user ON pengguna.user_id = user.id JOIN jenis_kelamin ON pengguna.jenis_kelamin_id = jenis_kelamin.id WHERE pengguna.deleted_at is null ORDER BY id DESC";
    var connection = getConnection();

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

app.get('/api/find/penggunas.json', function (req, res) {
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

    var queryString = "SELECT pengguna.id, pengguna.nama, pengguna.alamat, pengguna.nomor_telepon, DATE_FORMAT(pengguna.tanggal_lahir, '%d-%m-%Y') as tanggal_lahir, pengguna.jenis_kelamin_id, jenis_kelamin.nama jenis_kelamin_nama, DATE_FORMAT(jenis_kelamin.created_at, '%d-%m-%Y %T') as jenis_kelamin_created_at, DATE_FORMAT(jenis_kelamin.updated_at, '%d-%m-%Y %T') as jenis_kelamin_updated_at, DATE_FORMAT(jenis_kelamin.deleted_at, '%d-%m-%Y %T') as jenis_kelamin_deleted_at, pengguna.avatar, user.id user_id, user.username user_username, user.password user_password, user.role user_role, DATE_FORMAT(user.created_at, '%d-%m-%Y %T') as user_created_at, DATE_FORMAT(user.updated_at, '%d-%m-%Y %T') user_updated_at, DATE_FORMAT(user.deleted_at, '%d-%m-%Y %T') user_deleted_at, DATE_FORMAT(pengguna.created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(pengguna.updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(pengguna.deleted_at, '%d-%m-%Y %T') as deleted_at FROM pengguna JOIN user ON pengguna.user_id = user.id JOIN jenis_kelamin ON pengguna.jenis_kelamin_id = jenis_kelamin.id WHERE "+whereString+" ORDER BY id ASC";
    var connection = getConnection();

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

    })
})

app.get('/api/:id/pengguna.json', function (req, res) {
    console.log("Fetching data pengguna by penggunaId");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var penggunaId = req.params.id;

    var queryString = "SELECT pengguna.id, pengguna.nama, pengguna.alamat, pengguna.nomor_telepon, DATE_FORMAT(pengguna.tanggal_lahir, '%d-%m-%Y') as tanggal_lahir, pengguna.jenis_kelamin_id, jenis_kelamin.nama jenis_kelamin_nama, DATE_FORMAT(jenis_kelamin.created_at, '%d-%m-%Y %T') as jenis_kelamin_created_at, DATE_FORMAT(jenis_kelamin.updated_at, '%d-%m-%Y %T') as jenis_kelamin_updated_at, DATE_FORMAT(jenis_kelamin.deleted_at, '%d-%m-%Y %T') as jenis_kelamin_deleted_at, pengguna.avatar, user.id user_id, user.username user_username, user.password user_password, user.role user_role, DATE_FORMAT(user.created_at, '%d-%m-%Y %T') as user_created_at, DATE_FORMAT(user.updated_at, '%d-%m-%Y %T') user_updated_at, DATE_FORMAT(user.deleted_at, '%d-%m-%Y %T') user_deleted_at, DATE_FORMAT(pengguna.created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(pengguna.updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(pengguna.deleted_at, '%d-%m-%Y %T') as deleted_at FROM pengguna JOIN user ON pengguna.user_id = user.id JOIN jenis_kelamin ON pengguna.jenis_kelamin_id = jenis_kelamin.id WHERE pengguna.deleted_at is null AND pengguna.id = ? ORDER BY id ASC";
    var connection = getConnection();

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

    })

});

app.put('/api/:id/pengguna.json', function (req, res) {
    console.log("Updating data pengguna by id : "+req.params.id);

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };


    var penggunaId = req.params.id;
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

    var connection = getConnection();
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

    })

})

app.delete('/api/:id/pengguna.json', function (req, res) {
    console.log("Deleting pengguna by id : "+req.params.id);

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var penggunaId = req.params.id;
    var deletedAt = waktu;

    var queryString = "UPDATE pengguna SET deleted_at = ? WHERE id = ?";
    var connection = getConnection();

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

    })

})


// BERITA Handling
// app.post('/api/berita', function (req, res) {
//     console.log("Inserted for new berita");
//
//     var msg = {
//         'status': 500,
//         'message': 'Internal server error'
//     };
//
//     var judul = req.body.judul;
//     var objek = req.body.objek;
//     var penyebab = req.body.penyebab;
//     var kronologi = req.body.kronologi;
//     var korban = req.body.korban;
//     var tindakanPetugas = req.body.tindakan_petugas;
//     var penangananMulai = req.body.penanganan_mulai;
//     var penangananSelesai = req.body.penanganan_selesai;
//     var unsurBantuan = req.body.unsur_bantuan;
//     var petugasPelaksana = req.body.petugas_pelaksana;
//     var unitKendaraan = req.body.unit_kendaraan;
//     var permintaanBantuanId = req.body.permintaan_bantuan_id;
//     var foto = req.body.foto;
//     var createdAt = waktu;
//
//     var queryString = "INSERT INTO berita (judul, objek, penyebab, kronologi, korban, tindakan_petugas, penanganan_mulai, penanganan_selesai, unsur_bantuan, petugas_pelaksana, unit_kendaraan, permintaan_bantuan_id, foto, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
//     var connection = getConnection();
//
//     connection.query(queryString, [judul, objek, penyebab, kronologi, korban, tindakanPetugas, penangananMulai, penangananSelesai, unsurBantuan, petugasPelaksana, unitKendaraan, permintaanBantuanId, foto, createdAt], function (err, results, fields) {
//
//         if (err) {
//             res.json(msg)
//         }
//
//         if (results) {
//             msg['status'] = 200;
//             msg['message'] = 'Successfully created new berita';
//
//             res.json(msg);
//         } else {
//             msg['status'] = 500;
//             msg['message'] = 'Failed created new berita';
//
//             res.json(msg)
//         }
//
//     });
//
// });
//
// app.get('/api/beritas', function (req, res) {
//     console.log("Show all Berita Acara");
//
//     var msg = {
//         'status': 500,
//         'message': 'Internal server error'
//     };
//
//     var queryString = "SELECT berita.id, berita.judul, berita.objek, berita.penyebab, berita.kronologi, berita.korban, berita.tindakan_petugas, DATE_FORMAT(berita.penanganan_mulai, '%H:%i') as penanganan_mulai, DATE_FORMAT(berita.penanganan_selesai, '%H:%i') as penanganan_selesai, berita.unsur_bantuan, berita.petugas_pelaksana, berita.unit_kendaraan, berita.permintaan_bantuan_id, DATE_FORMAT(permintaan_bantuan.tanggal, '%d-%m-%Y %T') as permintaan_bantuan_tanggal, permintaan_bantuan.jenis_layanan_id permintaan_bantuan_jenis_layanan_id, jenis_layanan.nama jenis_layanan_nama, permintaan_bantuan.lat permintaan_bantuan_lat, permintaan_bantuan.lon permintaan_bantuan_lon, permintaan_bantuan.alamat_tempat_kejadian permintaan_bantuan_alamat_tempat_kejadian, permintaan_bantuan.status_permintaan_bantuan permintaan_bantuan_status_permintaan_bantuan, permintaan_bantuan.created_at permintaan_bantuan_created_at, permintaan_bantuan.updated_at permintaan_bantuan_updated_at, permintaan_bantuan.deleted_at permintaan_bantuan_deleted_at, pengguna.id pengguna_id, pengguna.nama pengguna_nama, berita.foto, berita.created_at, berita.updated_at, berita.deleted_at FROM berita JOIN permintaan_bantuan ON berita.permintaan_bantuan_id = permintaan_bantuan.id JOIN pengguna ON permintaan_bantuan.pengguna_id = pengguna.id JOIN jenis_layanan ON permintaan_bantuan.jenis_layanan_id = jenis_layanan.id WHERE berita.deleted_at is null";
//     var connection = getConnection();
//
//     connection.query(queryString, function (err, rows, fields) {
//
//         if (err) {
//             res.json(msg)
//         }
//
//         if (rows.length != 0) {
//             msg['status'] = 200;
//             msg['message'] = 'Successfully get all berita';
//             msg['affectedRows'] = rows.length;
//             msg['beritas'] = rows;
//
//             res.json(msg)
//         } else {
//             msg['status'] = 200;
//             msg['message'] = 'Failed get all berita or berita is empty';
//             msg['affedtedRows'] = rows.length;
//             msg['beritas'] = rows;
//
//             res.json(msg)
//         }
//
//     });
//
// });
//
// app.get('/api/berita/', function (req, res) {
//    console.log("Fetching data berita by param id : "+req.query.id)
//
//    var msg = {
//        'status': 500,
//        'message': 'Internal server error'
//    }
//
//    var id = req.query.id;
//    var queryString = "SELECT berita.id, berita.judul, berita.objek, berita.penyebab, berita.kronologi, berita.korban, berita.tindakan_petugas, DATE_FORMAT(berita.penanganan_mulai, '%H:%i') as penanganan_mulai, DATE_FORMAT(berita.penanganan_selesai, '%H:%i') as penanganan_selesai, berita.unsur_bantuan, berita.petugas_pelaksana, berita.unit_kendaraan, berita.permintaan_bantuan_id, DATE_FORMAT(permintaan_bantuan.tanggal, '%d-%m-%Y %T') as permintaan_bantuan_tanggal, permintaan_bantuan.jenis_layanan_id permintaan_bantuan_jenis_layanan_id, jenis_layanan.nama jenis_layanan_nama, permintaan_bantuan.lat permintaan_bantuan_lat, permintaan_bantuan.lon permintaan_bantuan_lon, permintaan_bantuan.alamat_tempat_kejadian permintaan_bantuan_alamat_tempat_kejadian, permintaan_bantuan.status_permintaan_bantuan permintaan_bantuan_status_permintaan_bantuan, permintaan_bantuan.created_at permintaan_bantuan_created_at, permintaan_bantuan.updated_at permintaan_bantuan_updated_at, permintaan_bantuan.deleted_at permintaan_bantuan_deleted_at, pengguna.id pengguna_id, pengguna.nama pengguna_nama, berita.foto_id, foto_kejadian.url foto_kejadian_url, foto_kejadian.created_at foto_kejadian_created_at, foto_kejadian.updated_at foto_kejadian_updated_at, foto_kejadian.deleted_at foto_kejadian_deleted_at, berita.created_at, berita.updated_at, berita.deleted_at FROM berita JOIN permintaan_bantuan ON berita.permintaan_bantuan_id = permintaan_bantuan.id JOIN foto_kejadian ON berita.foto_id = foto_kejadian.id JOIN pengguna ON permintaan_bantuan.pengguna_id = pengguna.id JOIN jenis_layanan ON permintaan_bantuan.jenis_layanan_id = jenis_layanan.id WHERE berita.deleted_at is null AND berita.id = ?";
//    var connection = getConnection();
//
//    connection.query(queryString, [id], function (err, rows, fields) {
//
//        if (err) {
//            res.json(msg)
//        }
//
//        if (rows.length != 0) {
//            msg['status'] = 200;
//            msg['message'] = "Successfully get data berita by id";
//            msg['affectedRows'] = rows.length;
//            msg['berita'] = rows;
//
//            res.json(msg)
//        } else {
//            msg['status'] = 200;
//            msg['message'] = "Failed get data berita by id or berita is empty";
//            msg['affectedRows'] = rows.length;
//            msg['berita'] = rows;
//
//            res.json(msg);
//        }
//
//    });
//
// });

// PELAYANAN BANTUAN Handling
app.post('/api/permintaanBantuan.json', function (req, res) {
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
    var connection = getConnection();

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

app.get('/api/permintaanBantuans.json', function (req, res) {
    console.log("Fetching all data Permintaan Bantuan");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var queryString = "SELECT permintaan_bantuan.id, DATE_FORMAT(permintaan_bantuan.tanggal, '%d-%m-%Y %T') as tanggal, permintaan_bantuan.jenis_layanan_id, jenis_layanan.nama jenis_layanan_nama, permintaan_bantuan.lat, permintaan_bantuan.lon, permintaan_bantuan.alamat_tempat_kejadian, permintaan_bantuan.status_permintaan_bantuan, permintaan_bantuan.foto, permintaan_bantuan.pengguna_id, pengguna.nama pengguna_nama, DATE_FORMAT(pengguna.tanggal_lahir, '%d-%m-%Y') as pengguna_tanggal_lahir, pengguna.nomor_telepon pengguna_nomor_telepon, pengguna.alamat pengguna_alamat, pengguna.jenis_kelamin_id pengguna_jenis_kelamin_id, jenis_kelamin.nama jenis_kelamin_nama, pengguna.user_id pengguna_user_id, pengguna.created_at pengguna_created_at, pengguna.updated_at pengguna_updated_at, pengguna.deleted_at pengguna_deleted_at, DATE_FORMAT(permintaan_bantuan.created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(permintaan_bantuan.updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(permintaan_bantuan.deleted_at, '%d-%m-%Y %T') as deleted_at FROM permintaan_bantuan JOIN pengguna ON permintaan_bantuan.pengguna_id = pengguna.id JOIN jenis_kelamin ON pengguna.jenis_kelamin_id = jenis_kelamin.id JOIN jenis_layanan ON permintaan_bantuan.jenis_layanan_id = jenis_layanan.id WHERE permintaan_bantuan.deleted_at is null ORDER BY id DESC";
    var connection = getConnection();

    connection.query(queryString, function(err, rows, fields) {
        
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

app.get('/api/find/permintaanBantuans.json', function (req, res) {
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

    var queryString = "SELECT permintaan_bantuan.id, DATE_FORMAT(permintaan_bantuan.tanggal, '%d-%m-%Y %T') as tanggal, permintaan_bantuan.jenis_layanan_id, jenis_layanan.nama jenis_layanan_nama, permintaan_bantuan.lat, permintaan_bantuan.lon, permintaan_bantuan.alamat_tempat_kejadian, permintaan_bantuan.status_permintaan_bantuan, permintaan_bantuan.foto, permintaan_bantuan.pengguna_id, pengguna.nama pengguna_nama, DATE_FORMAT(pengguna.tanggal_lahir, '%d-%m-%Y') as pengguna_tanggal_lahir, pengguna.nomor_telepon pengguna_nomor_telepon, pengguna.alamat pengguna_alamat, pengguna.jenis_kelamin_id pengguna_jenis_kelamin_id, jenis_kelamin.nama jenis_kelamin_nama, pengguna.user_id pengguna_user_id, pengguna.created_at pengguna_created_at, pengguna.updated_at pengguna_updated_at, pengguna.deleted_at pengguna_deleted_at, DATE_FORMAT(permintaan_bantuan.created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(permintaan_bantuan.updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(permintaan_bantuan.deleted_at, '%d-%m-%Y %T') as deleted_at FROM permintaan_bantuan JOIN pengguna ON permintaan_bantuan.pengguna_id = pengguna.id JOIN jenis_kelamin ON pengguna.jenis_kelamin_id = jenis_kelamin.id JOIN jenis_layanan ON permintaan_bantuan.jenis_layanan_id = jenis_layanan.id WHERE "+whereString+" ORDER BY id DESC";
    var connection = getConnection();

    connection.query(queryString, param, function(err, rows, fields) {

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

app.get('/api/web/permintaanBantuanRespons.json', function (req, res) {
    console.log("Fetching all data permintaan bantuan where status not pending");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var queryString = "SELECT permintaan_bantuan.id, DATE_FORMAT(permintaan_bantuan.tanggal, '%d-%m-%Y %T') as tanggal, permintaan_bantuan.jenis_layanan_id, jenis_layanan.nama jenis_layanan_nama, permintaan_bantuan.lat, permintaan_bantuan.lon, permintaan_bantuan.alamat_tempat_kejadian, permintaan_bantuan.status_permintaan_bantuan, permintaan_bantuan.foto, permintaan_bantuan.pengguna_id, pengguna.nama pengguna_nama, DATE_FORMAT(pengguna.tanggal_lahir, '%d-%m-%Y') as pengguna_tanggal_lahir, pengguna.nomor_telepon pengguna_nomor_telepon, pengguna.alamat pengguna_alamat, pengguna.jenis_kelamin_id pengguna_jenis_kelamin_id, jenis_kelamin.nama jenis_kelamin_nama, pengguna.user_id pengguna_user_id, pengguna.created_at pengguna_created_at, pengguna.updated_at pengguna_updated_at, pengguna.deleted_at pengguna_deleted_at, DATE_FORMAT(permintaan_bantuan.created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(permintaan_bantuan.updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(permintaan_bantuan.deleted_at, '%d-%m-%Y %T') as deleted_at FROM permintaan_bantuan JOIN pengguna ON permintaan_bantuan.pengguna_id = pengguna.id JOIN jenis_kelamin ON pengguna.jenis_kelamin_id = jenis_kelamin.id JOIN jenis_layanan ON permintaan_bantuan.jenis_layanan_id = jenis_layanan.id WHERE permintaan_bantuan.deleted_at is null AND permintaan_bantuan.status_permintaan_bantuan != 0 ORDER BY tanggal DESC";
    var connection = getConnection();

    connection.query(queryString, function (err, rows, fields) {

        if (err) {
            res.json(msg)
        }

        if (rows.length != 0) {
            msg['status'] = 200;
            msg['message'] = "Successfully get all data permintaan bantuan where status not pending";
            msg['affectedRows'] = rows.length;
            msg['responPermintaan'] = rows;

            res.json(msg)
        } else {
            msg['status'] = 404;
            msg['message'] = "Can\'t get all data permintaan bantuan where status not pending or permintaan bantuan is empty";
            msg['affectedRows'] = rows.length;
            msg['responPermintaan'] = rows;

            res.json(msg)
        }

    });

});

app.get('/api/:id/permintaanBantuan.json', function (req, res) {
    console.log("Fetching data permintaan bantuan by id");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };


    var permintaanBantuanId = req.params.id;

    var queryString = "SELECT permintaan_bantuan.id, DATE_FORMAT(permintaan_bantuan.tanggal, '%d-%m-%Y %T') as tanggal, permintaan_bantuan.jenis_layanan_id, jenis_layanan.nama jenis_layanan_nama, permintaan_bantuan.lat, permintaan_bantuan.lon, permintaan_bantuan.alamat_tempat_kejadian, permintaan_bantuan.status_permintaan_bantuan, permintaan_bantuan.foto, permintaan_bantuan.pengguna_id, pengguna.nama pengguna_nama, DATE_FORMAT(pengguna.tanggal_lahir, '%d-%m-%Y') as pengguna_tanggal_lahir, pengguna.nomor_telepon pengguna_nomor_telepon, pengguna.alamat pengguna_alamat, pengguna.jenis_kelamin_id pengguna_jenis_kelamin_id, jenis_kelamin.nama jenis_kelamin_nama, pengguna.user_id pengguna_user_id, DATE_FORMAT(pengguna.created_at, '%d-%m-%Y %T') as pengguna_created_at, DATE_FORMAT(pengguna.updated_at, '%d-%m-%Y %T') as pengguna_updated_at, DATE_FORMAT(pengguna.deleted_at, '%d-%m-%Y %T') as pengguna_deleted_at, DATE_FORMAT(permintaan_bantuan.created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(permintaan_bantuan.updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(permintaan_bantuan.deleted_at, '%d-%m-%Y %T') as deleted_at FROM permintaan_bantuan JOIN pengguna ON permintaan_bantuan.pengguna_id = pengguna.id JOIN jenis_kelamin ON pengguna.jenis_kelamin_id = jenis_kelamin.id JOIN jenis_layanan ON permintaan_bantuan.jenis_layanan_id = jenis_layanan.id WHERE permintaan_bantuan.deleted_at is null AND permintaan_bantuan.id = ? ORDER BY id ASC";
    var connection = getConnection();

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

app.put('/api/web/:id/permintaanBantuan/updateStatus.json', function (req, res) {
    console.log("Updating data permintaan bantuan by id : "+req.params.id);

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var permintaanBantuanId = req.params.id;
    var statusPermintaan = req.params.statusPermintaanBantuan;
    var updatedAt = waktu;
    var queryString = "UPDATE permintaan_bantuan SET status_permintaan_bantuan = ?, updated_at = ? WHERE id = ?";
    var connection = getConnection();

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

app.delete('/api/:id/permintaanBantuan.json', function (req, res) {
    console.log("Deleting permintaan bantuan by id : "+req.params.id)

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var permintaanBantuanId = req.params.id;
    var deletedAt = waktu;

    var queryString = "UPDATE permintaan_bantuan SET deleted_at = ? WHERE id = ?";
    var connection = getConnection();

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

    })

})

// JENIS KELAMIN Handling
app.post('/api/jenisKelamin.json', function (req, res) {

    var msg = {
        'status' : 500,
        'message': 'Internal server error'
    };

    var nama = req.query.nama;
    var createdAt = waktu;

    var queryString = "INSERT INTO jenis_kelamin (nama, created_at) VALUES (?, ?)";
    var connection = getConnection();

    connection.query(queryString, [nama, createdAt], function (err, results, fields) {

        if (err) {
            res.json(msg)
        }

        if (results.affectedRows != 0) {
            console.log("Inserted new jenis kelamin");

            msg['status'] = 200;
            msg['message'] = 'Successfully inserted new jenis kelamin';
            msg['jenisKelaminId'] = results.insertId;

            res.json(msg)
        } else {
            msg['status'] = 500;
            msg['message'] = 'Failed inserted new jenis kelamin';
            msg['jenisKelaminId'] = null;

            res.json(msg)
        }

    })

});

app.get('/api/jenisKelamins.json', function (req, res) {

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var queryString = "SELECT id, nama, DATE_FORMAT(created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(deleted_at, '%d-%m-%Y %T') as deleted_at FROM jenis_kelamin WHERE deleted_at is null ORDER BY nama ASC";
    var connection = getConnection();

    connection.query(queryString, function (err, rows, fields) {

        if (err) {
            res.json(msg)
        }

        if (rows.length != 0) {
            msg['status'] = 200;
            msg['message'] = "Successfully get all data jenis kelamin";
            msg['affectedRows'] = rows.length;
            msg['jenisKelamins'] = rows;

            res.json(msg)
        } else {
            msg['status'] = 404;
            msg['message'] = "Can\'t get all data jenis kelamin or jenis kelamin is empty";
            msg['affectedRows'] = rows.length;
            msg['jenisKelamins'] = rows;

            res.json(msg)
        }

    })

});

app.get('/api/:id/jenisKelamin.json', function (req, res) {
    console.log("Fetching data jenis kelamin by id");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var jenisKelaminId = req.params.id;

    var queryString = "SELECT id, nama, DATE_FORMAT(created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(deleted_at, '%d-%m-%Y %T') as deleted_at FROM jenis_kelamin WHERE deleted_at is null AND id = ? ORDER BY id ASC";
    var connection = getConnection();

    connection.query(queryString, [jenisKelaminId], function (err, rows, fields) {

        if (err) {
            res.json(msg)
        }

        if (rows.length != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully get data jenis kelamin by id';
            msg['affectedRows'] = rows.length;
            msg['jenisLayanan'] = rows;

            res.json(msg)
        } else {
            msg['status'] = 404;
            msg['message'] = 'Can\'t get data jenis kelamin by id';
            msg['affectedRows'] = rows.length;
            msg['jenisLayanan'] = rows;

            res.json(msg)
        }

    })

})

app.put('/api/:id/jenisKelamin.json', function (req, res) {
    console.log("Updating data jenis kelamin by id : "+req.params.id);

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var jenisKelaminId = req.params.id;
    var nama = req.query.nama;
    var updatedAt = waktu;

    var queryString = "UPDATE jenis_kelamin SET nama = ?, updated_at = ? WHERE id = ?";
    var connection = getConnection();

    connection.query(queryString, [nama, updatedAt, jenisKelaminId], function (err, results, fields) {

        if (err) {
            res.json(msg)
        }

        if (results.affectedRows != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully updated data jenis kelamin';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        } else {
            msg['status'] = 500;
            msg['message'] = 'Failed updated data jenis kelamin';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        }

    })

})

app.delete('/api/:id/jenisKelamin.json', function (req, res) {
    console.log("Deleting jenis kelamin by id : "+req.params.id);

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var jenisKelaminId = req.params.id;
    var deletedAt = waktu;

    var queryString = "UPDATE jenis_kelamin SET deleted_at = ? WHERE id = ?";
    var connection = getConnection();

    connection.query(queryString, [deletedAt, jenisKelaminId], function (err, results, fields) {

        if (err) {
            res.json(msg)
        }

        if (results.affectedRows != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully deleted jenis kelamin by id';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        } else {
            msg['status'] = 500;
            msg['message'] = 'Failed deleted jenis kelamin by id';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        }

    })

})


// JENIS LAYANAN BANTUAN HANDLING
app.post('/api/jenisLayanan.json', function (req, res) {
    console.log("Inserting new jenis layanan");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };
    var nama = req.query.nama;
    var createdAt = waktu;

    var queryString = "INSERT INTO jenis_layanan (nama, created_at) VALUES (?, ?)";
    var connection = getConnection();

    connection.query(queryString, [nama, createdAt], function (err, results, fields) {

        if (err) {
            res.json(msg)
        }

        if (results.affectedRows != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully inserted new jenis layanan';
            msg['jenisLayananId'] = results.insertId;

            res.json(msg)
        } else {
            msg['status'] = 500;
            msg['message'] = 'Failed inserted new jenis layanan';
            msg['jenisLayananId'] = null;
        }

    })

})

app.get('/api/jenisLayanans.json', function (req, res) {
    console.log("Fetching all data jenis layanan");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var queryString = "SELECT id, nama, DATE_FORMAT(created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(deleted_at, '%d-%m-%Y %T') as deleted_at FROM jenis_layanan WHERE deleted_at is null ORDER BY nama ASC";
    var connection = getConnection();

    connection.query(queryString, function (err, rows, fields) {

        if (err) {
            res.json(msg)
        }

        if (rows.length != 0) {
            msg['status'] = 200;
            msg['message'] = "Successfully get all data jenis layanan";
            msg['affectedRows'] = rows.length;
            msg['jenisLayanans'] = rows;

            res.json(msg)
        } else {
            msg['status'] = 404;
            msg['message'] = "Can\'t get all data jenis layanan or jenis layanan is empty";
            msg['affectedRows'] = rows.length;
            msg['jenisLayanans'] = rows;

            res.json(msg)
        }

    })

})

app.get('/api/:id/jenisLayanan.json', function (req, res) {
    console.log("Fetching data jenis layanan by id");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var jenisLayananId = req.params.id;

    var queryString = "SELECT id, nama, DATE_FORMAT(created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(deleted_at, '%d-%m-%Y %T') as deleted_at FROM jenis_layanan WHERE deleted_at is null AND id = ? ORDER BY id ASC";
    var connection = getConnection();

    connection.query(queryString, [jenisLayananId], function (err, rows, fields) {

        if (err) {
            res.json(msg)
        }

        if (rows.length != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully get data jenis layanan by id';
            msg['affectedRows'] = rows.length;
            msg['jenisLayanan'] = rows;

            res.json(msg)
        } else {
            msg['status'] = 404;
            msg['message'] = 'Can\'t find data jenis layanan by id or jenis layanan is empty';
            msg['affectedRows'] = rows.length;
            msg['jenisLayanan'] = rows;

            res.json(msg)
        }

    })

})

app.put('/api/:id/jenisLayanan.json', function (req, res) {
    console.log("Updating data jenis layanan")

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var jenisLayananId = req.params.id;
    var nama = req.query.nama;
    var updatedAt = waktu;

    var queryString = "UPDATE jenis_layanan SET nama = ?, updated_at = ? WHERE id = ?";
    var connection = getConnection();

    connection.query(queryString, [nama, updatedAt, jenisLayananId], function (err, results, fields) {

        if (err) {
            res.json(msg)
        }

        if (results.affectedRows != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully updated data jenis layanan';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        } else {
            msg['status'] = 500;
            msg['message'] = 'Failed updated data jenis layanan';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        }

    })

})

app.delete('/api/:id/jenisLayanan.json', function (req, res) {
    console.log("Deleting data jenis layanan");

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var jenisLayananId = req.params.id;
    var deletedAt = waktu;

    var queryString = "UPDATE jenis_layanan SET deleted_at = ? WHERE id = ?";
    var connection = getConnection();

    connection.query(queryString, [deletedAt, jenisLayananId], function (err, results, fields) {

        if (err) {
            res.json(msg)
        }

        if (results.affectedRows != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully deleted data jenis layanan';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        } else {
            msg['status'] = 500;
            msg['message'] = 'Failed deleted data jenis layanan';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;

            res.json(msg)
        }

    })

})


// UPLOAD IMAGE HANDLING
var uploadImage = function(req, res, next) {

    var msg = {
        'status': 500,
        'message': 'Internal server error'
    };

    var namaGambar = 'img-'+Date.now()+'.jpg';

    try {

        // to declare some path to store your converted image
        var path = './public/images/'+namaGambar;

        var imgdata = req.body.image;

        // to convert base64 format into random filename
        var base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
        // var base64Data = imgdata;

        fs.writeFileSync(path, base64Data,  {encoding: 'base64'});

        msg['status'] = 200;
        msg['message'] = "Successfully uploading image";
        msg['path'] = '/images/'+namaGambar;

        console.log(msg);
        return res.json(msg);

    } catch (e) {
        next(e);
    }
};

app.post('/upload/image', uploadImage);

