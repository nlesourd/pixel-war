const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// connecting an existing database (handling errors)
const db  = new sqlite3.Database('./db/pixel_war.db', (err) => {
	if (err) {
	  console.error(err.message);
	}
	console.log('Connected to the database!');
});

const join = require('./canvas/join')
router.use('/join', join)

const create = require('./canvas/create')
router.use('/create', create)

router.post("/addPixelToDB", function(req,res){ //Auteur de la fonction Nathan
	let data = req.body;
	if(req.session.loggedin){
		db.serialize(async() => {
			let id = await idCanva(data['nom']);
			const statement = db.prepare('INSERT INTO matrice (id, ligne, colonne, red, green, blue) VALUES(?, ?, ?, ?, ?, ?);');
			statement.get(id, data['ligne'], data['colonne'], data['r'], data['g'], data['b'], (err, result) => {
				if(err){
					res.status(400).send('Erreur lors de la maj de la BD'); //faire une page propre
				} else {
					req.session.nbTotalPixelPose = req.session.nbTotalPixelPose + 1;
					if ((req.session.nbTotalPixelPose == 999) & (req.session.statut == "normal")){
						req.session.statut = "vip";
						res.status(200).send("devientVip");
					}
					else{
						res.sendStatus(200);
					}
					
				}
			});
			statement.finalize();
		})
	}
})

router.post("/chargement", async function(req, res){ //Auteur de la fonction Adrien
	let data = req.body;
	nom = data.nom;
	pixels = await getPixels(nom)
	res.status(200).send(pixels)
})

async function idCanva(nom){ //Auteur de la fonction Adrien
	let sql = `SELECT id FROM canva WHERE nom = "${nom}";`;
	result = await db.query(sql)
	return result[0]['id'];
}

async function getPixels(nom){ //Auteur de la fonction Adrien
	let sql = `SELECT ligne, colonne, red, green, blue FROM matrice m, canva c WHERE m.id = c.id and c.nom = "${nom}";`;
	result = await db.query(sql);
	return result;

}

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

module.exports = router;