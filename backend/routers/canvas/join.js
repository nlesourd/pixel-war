//Auteur du fichier Adrien
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
 
router.get("/", function(req, res) { //Auteur de la fonction Adrien
	let list_theme;
	db.serialize(() =>{
		db.all("SELECT DISTINCT theme FROM canva;", (err, result) =>{
			list_theme = result;
			result.sort((x, y) => x.theme.localeCompare(y.theme));
		});
		db.all("SELECT c.nom, c.theme, c.longueur, c.largeur FROM canva c;", (err, result) => {
			result.sort((x, y) => x.nom.localeCompare(y.nom));
			list_nom = result
			res.render("join.ejs", {themes : list_theme, canvas : list_nom});
		})
	})	    
});

router.get("/nom/:nom", async (req, res) =>{ //Auteur de la fonction Adrien
	let nomCanva = req.params.nom;
	let existe = await canvaExists(nomCanva);
	duree = 0.17; //10 secondes pour les vips
	if (req.session.statut === "normal"){
		duree = 1; //1 minute
	}
	if (existe){
		[width, height] = await getWidhtHeight(nomCanva);
		pixels = await getPixels(nomCanva);
		res.render("canva.ejs", {login: req.session.login, name: nomCanva, width: width, height: height, pixels: pixels, duree: duree, logged: req.session.loggedin}); 
	} else{
		res.sendFile("canva_inexistant.html", {root: "./../frontend"});
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

async function getPixels(nom){ //Auteur de la fonction Adrien
	let sql = `SELECT ligne, colonne, red, green, blue FROM matrice m, canva c WHERE m.id = c.id and c.nom = "${nom}";`;
	result = await db.query(sql);
	return result;

}

async function getWidhtHeight(nom){ //Auteur de la fonction Adrien
	let sql = `SELECT largeur, longueur FROM canva WHERE nom = "${nom}";`;
	result = await db.query(sql);
	return [result[0]["largeur"], result[0]["longueur"]];
}

async function canvaExists(nom){ //Auteur de la fonction Adrien
	let res;
	let sql = `SELECT * FROM canva WHERE nom = "${nom}";`;
	result = await db.query(sql)
	if (result.length===0){
		res = false;
	} else{
		res = true;
	}
	return res;
};

module.exports = router;