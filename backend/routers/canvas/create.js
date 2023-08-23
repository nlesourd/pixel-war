//Auteur du fichier Nathan

const express = require('express');
const router = express.Router();

// add data to req.body (for POST requests)
router.use(express.urlencoded({ extended: true }));

const sqlite3 = require('sqlite3').verbose();

// connecting an existing database (handling errors)
const db  = new sqlite3.Database('./db/pixel_war.db', (err) => {
	if (err) {
	  console.error(err.message);
	}
	console.log('Connected to the database!');
});

router.post('/available', function(req, res) { //Auteur de la fonction Nathan
    let data = req.body;
	if (req.session.loggedin){
		db.serialize(() => {
		const statement = db.prepare("SELECT nom FROM canva WHERE nom=?");
		statement.get(data['nom'], (err, result) => {
			if(err){
				next(err);
			} else {
				if(typeof(result)==="undefined"){
					statut = "OK " + req.session.statut;
					res.status(200).send(statut);
				} else{
					res.status(200).send("KO");
				}
			}
		});
		statement.finalize();
		})
	}
})

router.post('/', function (req, res, next){ //Auteur de la fonction Nathan
	if (req.session.loggedin){
		let data = req.body;
		var width = 100;
		var height = 100;
		req.session.nbCanvaCree = req.session.nbCanvaCree + 1;
		if(data['nom']!=null && data['nom']!="" && data['theme']!=null && data['theme']!="" && data['width']!=0 && data['height']!=0){
			db.serialize(async() => {
				if(req.session.statut == "vip"){
					width = data['width'];
					height = data['height'];
				}
				sql = `INSERT INTO canva (nom, theme, longueur, largeur) VALUES("${data['nom']}", "${data['theme']}", ${width}, ${height});`
				await db.query(sql)
				if(req.session.loggedin){
					db.get('SELECT * FROM site;', (err, result) => {
						nbCanvaAvant = result["nbCanvaTotal"];
						incrementerNbCanva(nbCanvaAvant);
					});
				}
				url = '/canva/join/nom/'+data['nom']
				res.redirect(url);
			});
		} else {
			res.status(400).send('Bad request!');
		}
	}
});

db.query = function (sql, params) { //fonction pour permettre d'utiliser le await //Auteur de la fonction Adrien
    sql = sql.replace(/SERIAL PRIMARY KEY/, "INTEGER PRIMARY KEY AUTOINCREMENT");
    var that = this;
    return new Promise(function (resolve, reject) {
      that.all(sql, params, function (error, result) {
        if (error)
          reject(error);
        else
          resolve(result);
      });
    });
};

function incrementerNbCanva(nbCanvaAvant){   //Auteur de la fonction Nathan/Adrien
	const statement = db.prepare('UPDATE site SET nbCanvaTotal = ?;');
	statement.get(nbCanvaAvant + 1, (err, result) => {});
	statement.finalize();
}

router.get('/', function (req, res) { //Auteur de la fonction Nathan
	if (req.session.loggedin){
		res.sendFile('create.html', {root: "../frontend"});
	}
	else{
		res.redirect("/")
	}
});



module.exports = router;