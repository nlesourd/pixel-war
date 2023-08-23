const SUPER = document.querySelector('#SUPER');
const couleurs = document.querySelector('#couleurs');
const curseur = document.querySelector('#curseur');

var nom = name;

// Définissez la durée du minuteur en minutes
var duration = duree;
var interval;
var devientVip = false;

//partie canva
const context = SUPER.getContext('2d');

//On définit la taille du canva
const tailleCellule = 10;
SUPER.width= tailleCellule*width;
SUPER.height= tailleCellule*height;

//Auteur de la palette de la couleur Tenga

//liste des couleurs qui compose la palette à laquelle l'utilisateur pourra accéder rapidement 
const palette = [ 
    "#FFEBEE", "#FCE4EC", "#F3E5F5", "#B39DDB", "#9FA8DA", "#90CAF9", "#81D4FA", "#80DEEA", 
    "#4DB6AC", "#66BB6A", "#9CCC65", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", 
    "#A1887F", "#E0E0E0", "#90A4AE", "#000"
]

//affichage de la palette de couleurs et gestion de la sélection 
let couleurChoisie = palette[20]
let colorButton = document.getElementById("colorbar")

palette.forEach(color => { //Auteur de la fonction Tenga

    const couleur = document.createElement('div')
    couleur.style.backgroundColor = color
    couleurs.appendChild(couleur)

    couleur.addEventListener('click', () => {
        couleurChoisie = color 
    })
})

couleurChoisie = "#000"

function chargement(result){ //Auteur de la fonction Adrien/Nathan
    let matrice = []
    result.forEach(pixel =>{ 
        matrice.push(pixel.ligne)
        matrice.push(pixel.colonne)
        matrice.push(pixel.red)
        matrice.push(pixel.green)
        matrice.push(pixel.blue)
    });
    
    for (let i = 0; i < matrice.length; i+=5){
        pixel = context.createImageData(tailleCellule, tailleCellule);

        for (let j = 0; j < pixel.data.length; j += 4) {
            // Modify pixel data
            pixel.data[j+0] = matrice[i+2]; //r
            pixel.data[j+1] = matrice[i+3]; //g
            pixel.data[j+2] = matrice[i+4]; //b
            pixel.data[j+3] = 255; //transparence
        }     

        context.putImageData(pixel, matrice[i+0]*tailleCellule , matrice[i+1]*tailleCellule);    
    }
}

//chargement du canva toutes les secondes
setInterval(function(){ //Auteur de la fonction Nathan/Adrien
        $.ajax({
            type: 'POST',
            url: '/canva/chargement',
            data: {nom:nom},
            error: function(){
                alert('Problème AJAX')
            },
            success: function(result){
                chargement(result)
            }
        });
    }
, 1000);


colorButton.addEventListener('input', () => { //Auteur de la fonction Tenga
    couleurChoisie = colorButton.value
})

couleurChoisie = "#000"

SUPER.addEventListener('click', function(event){ //Auteur de la fonction Nathan
    const x = event.offsetX;
    const y = event.offsetY;

    const gridX = Math.floor(x / tailleCellule);
    const gridY = Math.floor(y / tailleCellule);

    //Get the value of the color we chose
    let r = hexToRgb(couleurChoisie).r
    let g = hexToRgb(couleurChoisie).g
    let b = hexToRgb(couleurChoisie).b
    $.ajax({ //ajax request to add to the DB
        type: 'POST',
        url: '/canva/addPixelToDB',
        data: {nom:nom, ligne:gridX, colonne:gridY, r:r, g:g, b:b, login:login},
        error: function(){
            alert('Problème AJAX')
        },
        success: function(result){
            if (result == "devientVip"){
                devientVip = true
            }

        }
    });

    if (devientVip){
        duration = 0.17
        alert("Congratulations on becoming a VIP! (don't forget to logout once you've finished your modifications so that your status and other personal progressions are saved)")
        console.log("passe")
    }

    //reset the values
    ancienX = -10000; 
    ancienY = -10000;

    //Auteur de l'overlay et du timer Adrien
    // Créer l'élément overlay pour bloquer les clics
    var overlay = document.createElement('div');

    // Ajouter une classe CSS à l'élément overlay
    overlay.classList.add('overlay');

    // Ajouter l'élément overlay au corps de la page
    document.body.appendChild(overlay);

    // Récupérer l'élément overlay
    var overlay = document.querySelector('.overlay');

    // Exécuter la fonction qui supprime l'overlay une fois le minuteur terminé
    setTimeout(function() {
    overlay.parentNode.removeChild(overlay);
    }, 1000*60*duration+2000); // durée voulue

    // Convertir la durée en secondes et la stocker en session
    document.cookie=`timer${login}=${duration * 60}`

    interval = setInterval(startTimer, 1000);
})

//sauvegarder les couleurs et les coordonées pour le déplacement de la souris
var ancienX;
var ancienY;
var ancienneCouleur

function drawMouseEffect(x, y) { //Auteur de la fonction Tenga
    // Set fill color
    context.fillStyle = couleurChoisie;

    // Calculate grid position
    const gridX = Math.floor(x / tailleCellule) * tailleCellule;
    const gridY = Math.floor(y / tailleCellule) * tailleCellule;
    ancienX = gridX;
    ancienY = gridY;

    //Store the values when the mouse will quit the pixel we are on
    r = context.getImageData(gridX, gridY, 1, 1).data[0]
    g = context.getImageData(gridX, gridY, 1, 1).data[1]
    b = context.getImageData(gridX, gridY, 1, 1).data[2]
    ancienneCouleur = rgbToHex(r,g,b); 

    // Fill grid square
    context.fillRect(gridX, gridY, tailleCellule, tailleCellule);      
}

SUPER.addEventListener('mousemove', function(event){ //Auteur de la fonction Tenga
    //redraw the previous pixel we were on
    context.beginPath();
    context.fillStyle = ancienneCouleur
    context.fillRect(ancienX, ancienY, tailleCellule, tailleCellule)

    // Get mouse position
    const x = event.offsetX;
    const y = event.offsetY;

    // Draw mouse effect
    drawMouseEffect(x, y);
})

//affichage au chargement 

//si le timer n'était pas terminé
if (getCookie(`timer${login}`)>0){  //Auteur de la fonction Adrien
    interval = setInterval(startTimer, 1000);

    // Créer l'élément overlay
    var overlay = document.createElement('div');

    // Ajouter une classe CSS à l'élément overlay
    overlay.classList.add('overlay');

    // Ajouter l'élément overlay au corps de la page
    document.body.appendChild(overlay);

    // Récupérer l'élément overlay
    var overlay = document.querySelector('.overlay');
    

    // Exécuter la fonction qui supprime l'overlay une fois le minuteur terminé
    setTimeout(function() {
    overlay.parentNode.removeChild(overlay);
    }, 2000+1000*getCookie(`timer${login}`)); // durée voulue
}

//création d'un pixel blanc
var pixelBlanc = context.createImageData(tailleCellule, tailleCellule);
for (let j = 0; j < pixelBlanc.data.length; j += 4) { //Auteur de la fonction Adrien
    // Modify pixel data
    pixelBlanc.data[j+0] = 255;
    pixelBlanc.data[j+1] = 255;
    pixelBlanc.data[j+2] = 255;
    pixelBlanc.data[j+3] = 255;
}

//initialisation par défaut à tous les pixels blancs
for (let i = 0; i < width; i+=1){
    for (let j = 0; j < height; j+=1){
        context.putImageData(pixelBlanc, i*tailleCellule, j*tailleCellule)
    }
}

//affichage des pixels qui sont en BD
for (let i = 0; i < matrice.length; i+=5){  //Auteur de la fonction Adrien
        pixel = context.createImageData(tailleCellule, tailleCellule);

        for (let j = 0; j < pixel.data.length; j += 4) {
            // Modify pixel data
            pixel.data[j+0] = matrice[i+2];
            pixel.data[j+1] = matrice[i+3];
            pixel.data[j+2] = matrice[i+4];
            pixel.data[j+3] = 255;
        }     

        context.putImageData(pixel, matrice[i+0]*tailleCellule , matrice[i+1]*tailleCellule);    
}

// Définir une fonction qui mettra à jour le minuteur à chaque seconde
function startTimer() { //Auteur de la fonction Adrien
    // Convertir les secondes restantes en minutes et secondes
    var minutes = parseInt(getCookie(`timer${login}`) / 60, 10)
    var seconds = parseInt(getCookie(`timer${login}`) % 60, 10);

    // Ajouter un zéro devant les minutes et secondes si nécessaire
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    // Récupérer l'élément HTML qui affichera le minuteur
    var display = document.querySelector('#timer');

    // Afficher le minuteur dans l'élément HTML
    display.textContent = minutes + ":" + seconds;

    // Décrémenter le compteur de 1 seconde
    document.cookie = `timer${login}=${getCookie(`timer${login}`) - 1}`;

    // Si le minuteur atteint 0, arrêter le minuteur et refresh la page
    if (getCookie(`timer${login}`) < 0) {
        clearInterval(interval);
    }
}

function getCookie(name) { //Auteur de la fonction Adrien
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
}

function componentToHex(c) { //Auteur de la fonction Adrien
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(r, g, b) { //Auteur de la fonction Adrien
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) { //Auteur de la fonction Adrien
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }