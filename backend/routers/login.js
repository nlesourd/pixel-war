const express = require('express');
const router = express.Router();
const md5 = require('md5');

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

// check credentials in database + initialize session
router.post('/login', function (req, res, next) { //Auteur de la fonction Tenga
	let data = req.body;
	if(data['login']!=null && data['login']!="" && data['password']!=null && data['password']!=""){
		
		db.serialize(() => {
			const statement = db.prepare("SELECT pseudo, motDePasse, statut, nbCanvaCree, nbTotalPixelPose FROM utilisateur WHERE pseudo=?;");
			statement.get(data['login'], (err, result) => {
				if(err){
					next(err);
				} else {
					if (typeof(result)==="undefined"){ //utilisateur incorrect
						res.render('login.ejs', {logged: false, login: req.session.login, error: true});
					}
					else{
						if(result["motDePasse"] == md5(data["password"])){ // check if the password is okay
							req.session.loggedin=true;
							req.session.login = result['pseudo'];
							req.session.statut = result['statut'];
							req.session.nbCanvaCree = result['nbCanvaCree'];
							req.session.nbTotalPixelPose = result['nbTotalPixelPose'];
							res.redirect("/")
						} else { //mdp incorrect
							res.render('login.ejs', {logged: false, login: req.session.login, error: true});
						}
					}
				}
			});
			statement.finalize();
		
		});

	} else {
		res.status(400).send('Bad request!');
	}
});

router.get('/login', function (req, res) { //Auteur de la fonction Tenga
	res.render('login.ejs', {logged: req.session.loggedin, login: req.session.login, error: false});
});

router.get('/logout', function (req, res) { //Auteur de la fonction Tenga
	const statement = db.prepare('UPDATE utilisateur SET nbCanvaCree = ?, statut = ?, nbTotalPixelPose = ?, statut = ? WHERE pseudo = ?;');
    statement.get(req.session.nbCanvaCree, req.session.statut, req.session.nbTotalPixelPose, req.session.statut, req.session.login, (err, result) => {
		req.session.destroy();
		res.redirect('/login');
	});
    statement.finalize();
});

module.exports = router;