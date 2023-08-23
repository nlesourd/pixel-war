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

// home
router.get('/home', function (req, res) {
	res.redirect('/');
});

router.get('/index.html', function (req, res) {
	res.redirect('/');
});

router.get('/', function (req, res) { //Auteur de la fonction Adrien
	var nbUtilisateur = 0;
	var nbCanva = 0;
	var statut = "0";
	var nbCanvaCree = 0;
	var nbTotalPixelPose = 0;
	db.get('SELECT * FROM site;', (err, result) => {
		nbUtilisateur = result["nbUtilisateurTotal"];
		nbCanva = result["nbCanvaTotal"];
		if (req.session.loggedin){
			statut = req.session.statut;
			nbCanvaCree = req.session.nbCanvaCree;
			nbTotalPixelPose = req.session.nbTotalPixelPose;
		}
		res.render('index.ejs', {logged: req.session.loggedin, login: req.session.login, nbUtilisateurSite: nbUtilisateur, nbCanvaSite : nbCanva,
								statutU: statut, nbTotalPixelPoseU: nbTotalPixelPose, nbCanvaCreeU: nbCanvaCree});
	});
	
});

module.exports = router;