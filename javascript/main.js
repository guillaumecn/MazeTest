var game = new Phaser.Game(1024,928, Phaser.AUTO, 'gamebox', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('sky', '../assets/sky.png');
    game.load.image('ground', '../assets/platform.png');
    game.load.image('star', '../assets/star.png');
    game.load.image('ground_1x1', '../assets/ground_1x1.png');
    game.load.spritesheet('dude1', '../assets/dude1.png', 32, 32);
}

//Constantes*****
var LARGEURJEUX = 32; //nombre de tiles de large du jeux 32
var HAUTEURJEUX = 29; //nombre de tiles de haut du jeux 29 (doit être impair!!!)
var VITESSEJOUEUR = 300; //vitesse de déplacement du joueur

//var players;
var terrain; //Groupe contenant les objet innanimé
var cursors; //Variable du curseur (flèche)
var currentLayer;  //Variable qui dit on est présentement sur quel layer
var map;
var layer1;
var entree_x;
var sortie_x;
var curPos_x; 
var curPos_y;
//Tableaux?!
var tableauMap;
var players;
var player1;

function create() {



//Add physic to the game
game.physics.startSystem(Phaser.Physics.ARCADE);

//**************************Map********************************************************************************//
createmap();
createPath();
createSubPath();

//******************************************************//

//On crée le groupe d'objet inerte
terrain = game.add.group();
//On active la physique sur le terrain
terrain.enableBody= true;

//On crée le groupe des joueurs
players = game.add.group();

//On crée le joueur 1
player1 = players.create(entree_x*32,0,'dude1');
//On active et set la physique du joueur 1
game.physics.arcade.enable(player1);
player1.body.collideWorldBounds = true;
//On fait suivre la camera sur le joueur
game.camera.follow(player1);
//Set the animations
player1.animations.add('down', [0,1,2,1],10,true);
player1.animations.add('up', [9,10,11,10],10,true);
player1.animations.add('left', [3,4,5,4], 10, true);
player1.animations.add('right', [6,7,8,7], 10, true);

//On crée le curseur
cursors = game.input.keyboard.createCursorKeys();

}

function update() {


var animation = 'none';

//On fait l'animation du joueur*************************

    //collision entre le joueur et les obstacle de la layer 1
    game.physics.arcade.collide(player1, layer1);
    //  Reset the players velocity (movement)
    player1.body.velocity.x = 0;
    player1.body.velocity.y = 0;

    if (cursors.left.isDown)
    {
        //Move to the left
        player1.body.velocity.x = -VITESSEJOUEUR;
        animation = 'left';
    }
    if (cursors.right.isDown)
    {
        //Move to the right
        player1.body.velocity.x = VITESSEJOUEUR;
        animation = 'right';
    }
    if (cursors.up.isDown)
    {
        //Move up
        player1.body.velocity.y = -VITESSEJOUEUR;
        animation = 'up';
    }
    if (cursors.down.isDown)
    {
        //Move down
        player1.body.velocity.y = VITESSEJOUEUR;
        animation = 'down';
    }

    //Stand still or play the animation
     if (animation == 'none')
    {
        player1.animations.stop();
        //player1.frame = 1;
    } else {
        player1.animations.play(animation);
    }
//**************************************************************
}


function render() {

   //game.debug.text('Current Layer: ' + currentLayer.name, 50, 500);
   //game.debug.text('Position en x  ' + tile_x, 50, 500);
   //game.debug.text('Position en y ' + tile_y, 50, 550);
   //game.debug.text('go where dit: ' + gowhere, 50, 500);
   //game.debug.cameraInfo(game.camera, 32, 32);
   //game.debug.spriteInfo(player1, 32, 132);
    

}

function createmap() {


    //simple background to the map
    game.stage.backgroundColor = '#2d2d2d';

    //  Creates a blank tilemap
    map = game.add.tilemap();   

    //On cree le tableau 2D qui représente la map
    tableauMap = new Array();
    for (var i=0;i<LARGEURJEUX;i++)
        tableauMap[i] = new Array();
    //On rempli le tableau de 0
    for (i=0;i<LARGEURJEUX;i++)
    {
        for (var j=0;j<HAUTEURJEUX;j++)
            tableauMap[i][j]=0;
    }


    //  Add a Tileset image to the map
    map.addTilesetImage('ground_1x1');

    //  Creates a new blank layer and sets the map dimensions.
    //  In this case the map is LARGEURJEUX x HAUTEURJEUX tiles in size and the tiles are 32x32 pixels in size.
    layer1 = map.create('level 1',LARGEURJEUX, HAUTEURJEUX, 32, 32);
    layer1.scrollFactorX = 0.5;
    layer1.scrollFactorY = 0.5;
    currentLayer = layer1;
    //layer1.fixedtocamera = true;    
    //layer1.debug = true;

    //On set la grosseur du monde selon la layer1
    layer1.resizeWorld();   
    //On fait ensorte que les tiles 0 à 3 du tilesetimage soit "dur" (collision) dans la layer 1.
    map.setCollisionBetween(0, 3, true, layer1); 

}

function createPath()
{
    
    //On trouve la position d'entrée et de sortie du maze
    entree_x = game.rnd.between(1,LARGEURJEUX-2);
    //Entre la position d'entrée e dans le tableau
    tableauMap[entree_x][0]=3;

    //On fait le mur top,droite et gauche une première fois
    faireMur(1);

   
    //*******************************************************************************************************************************

    //On fait un chemin, de l'entrée au coté opposer de la map. Àléatoire....
    curPos_x=entree_x; //Position actuel en x
    curPos_y=1; //position actuel en y (1 devant l'entrée)

    tableauMap[curPos_x][curPos_y]=3; //On commence le chemin
    curPos_y=2; // on se met dans le milieu de la grosse case a créé
    tableauMap[curPos_x][curPos_y]=3;
    i=0;
    //On fait le chemin du haut jusqu'au bas
    while (curPos_y != HAUTEURJEUX-1)
    {
        getPath();
        //if (i>33)
           // curPos_y = HAUTEURJEUX-1;
        //i++
    }
    //On definie la position de sortie
    sortie_x = curPos_x;

    //On refait les murs
    faireMur(5);

    //On parcourt le tableaux et on place les blocs à leurs place selon le numéro attribuer dans le tableau
    for (i=0;i<LARGEURJEUX;i++)
    {
        for (var j=0;j<HAUTEURJEUX;j++)
        {
            if (tableauMap[i][j]==1 || tableauMap[i][j]==5)
                map.putTile(2,i,j,layer1);

            if (tableauMap[i][j]==3)
                map.putTile(4,i,j,layer1);
        }            
    }    
}

/*

*/
function getPath() 
{
    
    var goRight = 0;
    var goLeft = 0;
    var goFront = 0;
    var goPath = 0;
    var gowhere;
    var fromWhere;
    var grosseCase1 =0;
    

    //On regarde on peut aller ou
     if ((tableauMap[curPos_x-1][curPos_y] == 0) && (tableauMap[curPos_x-2][curPos_y] == 0))
    {
        goLeft = 1;
        gowhere = 'left';
    }
    if ((tableauMap[curPos_x+1][curPos_y] == 0) && (tableauMap[curPos_x+2][curPos_y] == 0))
    {
        goRight = 1;
        gowhere = 'right';
    }        
    if ((tableauMap[curPos_x][curPos_y+1] == 0) && (tableauMap[curPos_x][curPos_y+2] == 0))
    {
        goFront = 1; 
        gowhere = 'front';
    }

    //On regarde on arrive de ou
    if ((tableauMap[curPos_x-1][curPos_y]==3) && (tableauMap[curPos_x-2][curPos_y]==3))
        fromWhere = 'right';
    if ((tableauMap[curPos_x+1][curPos_y]==3) && (tableauMap[curPos_x+2][curPos_y]==3))
        fromWhere = 'left';
    if ((tableauMap[curPos_x][curPos_y-1]==3) && (tableauMap[curPos_x][curPos_y-2]==3))
        fromWhere = 'back';       

    switch (goFront+goRight+goLeft)
    {
        case 1:
            grosseCase1 = getGrosseCase(gowhere,fromWhere);
            setGrosseCase(grosseCase1);
            curPos_x = curPos_x + 2*goRight- 2*goLeft;
            curPos_y = curPos_y + 2*goFront;            
            
        break;

        case 2:
            goPath = game.rnd.between(1,2);
            if (goFront)
            {
                if ( goPath==1 )
                {
                    gowhere = 'front';
                    grosseCase1 = getGrosseCase(gowhere,fromWhere);
                    setGrosseCase(grosseCase1);
                    curPos_y = curPos_y + 2; //va devant                    
                }
                    
                else
                {
                    if (goLeft)
                    {
                        gowhere = 'left';
                        grosseCase1 = getGrosseCase(gowhere,fromWhere);
                        setGrosseCase(grosseCase1);
                    }                        
                    else
                    {
                        gowhere = 'right';
                        grosseCase1 = getGrosseCase(gowhere,fromWhere);
                        setGrosseCase(grosseCase1);
                    }
                    curPos_x = curPos_x + 2*goRight - 2*goLeft; //va a gauche ou a droite       
                }
                    
            }
            else
            {
                if (goPath == 1)
                {                    
                    gowhere = 'right';
                    grosseCase1 = getGrosseCase(gowhere,fromWhere);
                    setGrosseCase(grosseCase1);
                    curPos_x = curPos_x + 2; //va a droite
                }
                    
                else
                {                    
                    gowhere = 'left';
                    grosseCase1 = getGrosseCase(gowhere,fromWhere);
                    setGrosseCase(grosseCase1);
                    curPos_x = curPos_x - 2; //va a gauche
                }                    
            }

        break;

        case 3:
            goPath = game.rnd.between(1,3);
            switch (goPath)
            {
                case 1: //va devant                    
                    gowhere = 'front';
                    grosseCase1 = getGrosseCase(gowhere,fromWhere);
                    setGrosseCase(grosseCase1);
                    curPos_y = curPos_y + 2;
                break;

                case 2: //va a droite                    
                    gowhere = 'right';
                    grosseCase1 = getGrosseCase(gowhere,fromWhere);
                    setGrosseCase(grosseCase1); 
                    curPos_x = curPos_x + 2;                   
                break;

                case 3: //va a gauche                   
                    gowhere = 'left';
                    grosseCase1 = getGrosseCase(gowhere,fromWhere);
                    setGrosseCase(grosseCase1);
                     curPos_x = curPos_x - 2;
                break;

                default:
                    alert('Erreur 1!');
            }
        break;

        default:
            alert('Erreur 2!!');
    }
    //alert("On va ou?  " + gowhere);
}

/*
function findGoWhere()
{
    var goWhere;
    if ((tableauMap[curPos_x-1][curPos_y] == 0) && (tableauMap[curPos_x-2][curPos_y] == 0))
    {
        gowhere = 'left';
    }
    if ((tableauMap[curPos_x+1][curPos_y] == 0) && (tableauMap[curPos_x+2][curPos_y] == 0))
    {
        gowhere = 'right';
    }        
    if ((tableauMap[curPos_x][curPos_y+1] == 0) && (tableauMap[curPos_x][curPos_y+2] == 0))
    {
        gowhere = 'front';
    }
    return goWhere;
}
*/

function getGrosseCase(gowhere, fromWhere)
{
    
    var grosseCase = 0;
    if (fromWhere == 'back')
    {
       if (gowhere == 'front')
            grosseCase = game.rnd.pick([1,3,4,6,6]);
        if (gowhere == 'right')
            grosseCase = game.rnd.pick([1,2,4,7,7]);
        if (gowhere == 'left')
            grosseCase = game.rnd.pick([1,2,3,5,5]);
    }
    
    if (fromWhere == 'right')
    {
       if (gowhere == 'front')
            grosseCase = game.rnd.pick([1,3,10,11,10,11]);
        if (gowhere == 'right')
            grosseCase = game.rnd.pick([1,2,8,10,8,10]);
    }

    if (fromWhere == 'left')
    {
       if (gowhere == 'front')
            grosseCase = game.rnd.pick([1,4,9,10,9,10]);
        if (gowhere == 'left')
            grosseCase = game.rnd.pick([1,2,8,10,8,10]);
    }
    return grosseCase;
    
}

function setGrosseCase(grosseCase)
{
    
    tableauMap[curPos_x][curPos_y]=3;
    tableauMap[curPos_x][curPos_y-1]=3;
    tableauMap[curPos_x][curPos_y+1]=3;
    tableauMap[curPos_x-1][curPos_y]=3;
    tableauMap[curPos_x+1][curPos_y]=3;
    tableauMap[curPos_x-1][curPos_y-1]=1;
    tableauMap[curPos_x-1][curPos_y+1]=1;
    tableauMap[curPos_x+1][curPos_y-1]=1;
    tableauMap[curPos_x+1][curPos_y+1]=1;

    switch (grosseCase)
    {
        case 2:
            tableauMap[curPos_x][curPos_y+1]=1;
        break;

        case 3:
            tableauMap[curPos_x+1][curPos_y]=1;
        break;

        case 4:
            tableauMap[curPos_x-1][curPos_y]=1;
        break;

        case 5:
            tableauMap[curPos_x][curPos_y+1]=1;
            tableauMap[curPos_x+1][curPos_y]=1;
        break;
        case 6:
            tableauMap[curPos_x-1][curPos_y]=1;
            tableauMap[curPos_x+1][curPos_y]=1;
        break;
        case 7:
            tableauMap[curPos_x-1][curPos_y]=1;
            tableauMap[curPos_x][curPos_y+1]=1;
        break;
        case 8:
            tableauMap[curPos_x][curPos_y-1]=1;
            tableauMap[curPos_x][curPos_y+1]=1;
        break;
        case 9:
            tableauMap[curPos_x][curPos_y-1]=1;
            tableauMap[curPos_x-1][curPos_y]=1;
        break;
        case 10:
            tableauMap[curPos_x][curPos_y-1]=1;
        break;
        case 11:
            tableauMap[curPos_x][curPos_y-1]=1;
            tableauMap[curPos_x+1][curPos_y]=1;
        break;
        default:
    }
    
}

function faireMur(valeur_mur)
{

    //On met le mur du top
    for (var i=0;i<LARGEURJEUX;i++)
    {
        //Top
        if (i != entree_x)
            tableauMap[i][0]=valeur_mur;
    }
    //On met les mur de droite et de gauche
    for (i=0;i<HAUTEURJEUX;i++)
    {
        //droite
        tableauMap[0][i]=valeur_mur;
        //Gauche
        tableauMap[LARGEURJEUX-1][i]=valeur_mur;
    }

    if (valeur_mur != 1)
    {
            //On met le mur du bas
        for (i=0;i<LARGEURJEUX;i++)
        {
            //Bas
            if (i != sortie_x)
                tableauMap[i][HAUTEURJEUX-1]=valeur_mur;
        }
        tableauMap[sortie_x][HAUTEURJEUX-1]=3;
    }
}

function createSubPath()
{
    
    for (var j=1;j<HAUTEURJEUX-1;j++)
    {
        var i = 1;
        while (tableauMap[i][j] != 0)
        {
            if ((tableauMap[i][j]==3) || (tableauMap[i][j+1]==3) || (tableauMap[i][j-1]==3))
                createLeftBranch();
            i++;
        }
        i=HAUTEURJEUX-1;
        while (tableauMap[i][j] != 0)
        {
            if ((tableauMap[i][j]==3) || (tableauMap[i][j+1]==3) || (tableauMap[i][j-1]==3))
                createRightBranch();
            i--;
        }
    }   
}
function createLeftBranch()
{
    var fromWhere = 'left';

}
function createRightBranch()
{

}