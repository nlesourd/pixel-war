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

router.post('/', function (req, res) { //Auteur de la fonction Adrien
    let data = req.body;
    if(data['login']!=null && data['login']!="" && data['password']!=null && data['password']!=""){
        db.serialize(() => {
			const statement = db.prepare('INSERT INTO utilisateur (pseudo, motDePasse, statut, nbTotalPixelPose, nbCanvaCree) VALUES(?, ?, "normal", 0, 0);');
			statement.get(data['login'], md5(data['password']), (err, result) => {
				if(err){
					res.status(400).send('Login déjà utilisé!');
				} else {
                    req.session.login = data["login"];
                    req.session.loggedin = true;
                    req.session.statut = "normal";
                    req.session.nbCanvaCree = 0;
                    req.session.nbTotalPixelPose = 0;
                    db.get('SELECT * FROM site;', (err, result) => {
                        nbUtilisateurAvant = result["nbUtilisateurTotal"];
                        incrementerNbUtilisateur(nbUtilisateurAvant);
                    });
                    
                    res.redirect("/")
				}
			});
			statement.finalize();
        });
        
    }
    else{
        res.status(400).send('Bad request!');
    }
});

function incrementerNbUtilisateur(nbUtilisateurAvant){   //Auteur de la fonction Adrien
        const statement = db.prepare('UPDATE site SET nbUtilisateurTotal = ?;');
        statement.get(nbUtilisateurAvant + 1, (err, result) => {});
        statement.finalize();
    

}

router.post('/available', function(req, res) { //Auteur de la fonction Adrien
    let data = req.body;
    db.serialize(() => {
        const statement = db.prepare("SELECT pseudo FROM utilisateur WHERE pseudo=?");
        statement.get(data['login'], (err, result) => {
            if(err){
                next(err);
            } else {
                if(typeof(result)==="undefined"){
                    res.status(200).send("OK");
                } else{
                    res.status(200).send("KO");
                }
            }
        });
        statement.finalize();
    })
})

router.get('/', function (req, res) { //Auteur de la fonction Adrien
	res.sendFile('signup.html', {root: "../frontend"});
});

module.exports = router;