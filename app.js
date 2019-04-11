var express = require('express');
var app = express();

app.set('view engine', 'ejs');

var mysql = require('mysql');


const fileUpload = require('express-fileupload');
app.use(fileUpload());

var fs = require('fs');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

var reviews = require("./model/reviews.json");




app.use(express.static('views'));
app.use(express.static('css'));
app.use(express.static('images'));

const db = mysql.createConnection ({
    host: 'den1.mysql2.gear.host',
    user: 'carmart',
    password: 'Dc6IJ~-95gIi',
    database: 'carmart'
});

db.connect((err) => {
    if (err) {
        console.log("Connection failed");
    } else {
        console.log("Connection successful!");
    }
});

app.get('/', function (req, res) {
    res.redirect('/cars');  
});


//Create a route to db table
app.get('/createtable', function(req, res) {
    
//    let sql = 'CREATE TABLE Cars (Id int NOT NULL AUTO_INCREMENT PRIMARY KEY, Make varchar(255), Model varchar(255), Year int, Price int, Image varchar(255))' 
    
//    let sql = 'INSERT INTO Cars (Make, Model, Year, Price, Image) VALUES ("Skoda", "Octavia", 2017, 1399, "Octavia")'; 
    
//    let sql = 'ALTER TABLE Cars ADD Info varchar(1000)';
    
    let query = db.query(sql, (err, res) => {
        if (err) {
            throw err;
        }
    });
    
    res.send("Cols added!");
});


// route to show cars.ejs page
app.get('/cars', function(req, res){
    let sql = 'SELECT * FROM Cars';
    let query = db.query(sql, (err, res1) => {
        if (err) throw err;
        
        res.render('cars', {res1})
    });
    
});



app.get('/cars', function(req, res) {
    res.render('cars');
});

// route to render addcar page
app.get('/addcar', function(req, res){
    res.render('addcar');
})

// route to post new car

app.post('/addcar', function(req, res) {
    if(!req.files) return res.status(400).send('No files uploaded');
    
    let sampleFile = req.files.sampleFile;
    filename = sampleFile.name;
    sampleFile.mv('./images/' + filename, function (err){
        if (err) return res.status(500).send(err);
        
        console.log('Here is the image ' + filename)
    })
    
//    let sql = 'CREATE TABLE Cars (Id int NOT NULL AUTO_INCREMENT PRIMARY KEY, Make varchar(255), Model varchar(255), Year int, Price int, Image varchar(255))' 
    let sql = 'INSERT INTO Cars (Make, Model, Year,Mileage, Price, Image, Info) VALUES ("'+req.body.Make+'", "'+req.body.Model+'", '+req.body.Year+', '+req.body.Mileage+', '+req.body.Price+', "'+filename+'", "'+req.body.Info+'")'; 
    
    let query = db.query(sql, (err, res) => {
        if (err) {
            throw err;
        }
    });
    
    res.redirect("/cars");
});



// Edit car details 

app.get('/editcar/:id', function (req, res) {
    let sql = 'SELECT * FROM Cars WHERE Id = "'+req.params.id+'" ';
    let query = db.query(sql, (err, res1) => {
        if (err) throw err;
        
        res.render('editcar', {res1})
    });
    

});

app.post('/editcar/:id', function(req, res) {
    if(!req.files) return res.status(400).send('No files uploaded');
    
    let sampleFile = req.files.sampleFile;
    filename = sampleFile.name;
    sampleFile.mv('./images/' + filename, function (err){
        if (err) return res.status(500).send(err);
        
        console.log('Here is the image ' + filename)
    })
    let sql = 'UPDATE Cars SET Make = "'+req.body.Make+'", Model = "'+req.body.Model+'", Year = '+req.body.Year+', Mileage = '+req.body.Mileage+', Price = '+req.body.Price+', Image = "'+filename+'", Info ="'+req.body.Info+'" WHERE Id = "'+req.params.id+'"'; 
    
    let query = db.query(sql, (err, res) => {
        if (err) {
            throw err;
        }
    });
    
    res.redirect("/cars");
});

app.get('/deletecar/:id', function(req, res){
    let sql = 'DELETE FROM Cars WHERE Id = "'+req.params.id+'" '
    let query = db.query(sql, (err, res) => {
        if (err) {
            throw err;
        }
    });
    
    res.redirect("/cars");
});

// route to render the upload page
app.get('/upload', function(req, res){
    res.render('upload');
});

app.post('/upload', function(req, res){
    let sampleFile = req.files.sampleFile;
    filename = sampleFile.name;
    
    sampleFile.mv('./images/' + filename, function(err){
        if (err)
            return res.status(500).send(err);
            console.log('Image is ' + filename)
        res.redirect('/');
    })
})

// Route to make an offer

app.get('/makeoffer/:id', function(req, res){
    let sql = 'SELECT * FROM Cars WHERE Id = "'+req.params.id+'" ';
    let query = db.query(sql, (err, res1) => {
        if (err) throw err;
        
        res.render('makeoffer', {res1})
    });
    
});

app.post('/makeoffer/', function(req, res) {
    
//    let sql = 'CREATE TABLE Offers (Id int NOT NULL AUTO_INCREMENT PRIMARY KEY, Name varchar(255), Email varchar(255), CarId int, Offer int)' 
//    let sql = 'ALTER TABLE Offers ADD Image varchar(255)';
    let sql = 'INSERT INTO Offers (Image, Name, Email, CarId, Offer) VALUES ("'+req.body.Image+'", "'+req.body.Name+'", "'+req.body.Email+'", '+req.body.CarId+', '+req.body.Offer+')'; 
    
//    let sql = 'INSERT INTO Offers (Name, Email, CarId, Offer) VALUES ("John Byrne", "JByrne@gmail.com", 37, 12500)'; 
    
    let query = db.query(sql, (err, res) => {
        if (err) {
            throw err;
        }
    });
    
    res.redirect('/offer');
});

// Display All offers
app.get('/offer', function(req, res){
    let sql = 'SELECT * FROM Offers';
    let query = db.query(sql, (err, res1) => {
        if (err) throw err;
        
        res.render('offer', {res1})
    });
    
});



app.get('/offer', function(req, res) {
    res.render('offer');
});




// Display Highest Offers

app.get('/showoffers', function(req, res){
    let sql = 'SELECT * FROM Offers INNER JOIN (SELECT CarId, MAX(Offer) AS Maxoffer FROM Offers GROUP BY CarId) topoffer ON Offers.CarId = topoffer.CarId AND Offers.Offer = topoffer.Maxoffer';
    let query = db.query(sql, (err, res1) => {
        if (err) throw err;
        
        res.render('showoffers', {res1})
    });
    
});

app.get('/showoffers', function(req, res) {
    res.render('showoffers');
});


// Edit Offers
app.get('/editoffer/:id', function (req, res) {
    let sql = 'SELECT * FROM Offers WHERE Id = "'+req.params.id+'" ';
    let query = db.query(sql, (err, res1) => {
        if (err) throw err;
        
        res.render('editoffer', {res1})
    });
    

});

app.post('/editoffer/:id', function(req, res) {
    let sql = 'UPDATE Offers SET Name = "'+req.body.Name+'", Email = "'+req.body.Email+'", CarId = '+req.body.CarId+', Offer = '+req.body.Offer+' WHERE Id = "'+req.params.id+'"'; 
    
    let query = db.query(sql, (err, res) => {
        if (err) {
            throw err;
        }
    });
    
    res.redirect("/offer");
});

app.get('/deleteoffer/:id', function(req, res){
    let sql = 'DELETE FROM Offers WHERE Id = "'+req.params.id+'" '
    let query = db.query(sql, (err, res) => {
        if (err) {
            throw err;
        }
    });
    
    res.redirect("/offer");
});







// REVIEWS & COMMENTS SECTION

app.get('/reviews', function(req, res) {
    res.render('reviews', {reviews});
});

app.get('/addreview', function(req, res) {
    res.render('addreview');
});

app.post('/addreview', function(req,res){
    
    function getMax(reviews, id) {
        var max;
        
        for (var i=0; i<reviews.length; i++) {
            if(!max || parseInt(reviews[i][id]) > parseInt(max[id]))
            max = reviews[i];
        }
        
        return max;
        
    }
    
    // call the getMax function and pas some info to it 
    // When the function runs we need to get the answer back and store it as a variable
    
    var maxCid = getMax(reviews, "id")
    
   var newId = maxCid.id + 1; // make a ne variable for id which is 1 larger than the current max
    
    console.log("New id is: " + newId);
    var json = JSON.stringify(reviews) // we tell the application to get our JSON readdy to modify
    // Now we will create a new JSON object
    
    var contactsx = {
        
        username: req.body.username,
        comment: req.body.comment,
        id: newId,
        
        
        
    }
    
    
    // Now we push the data back to the JSON file
    
    fs.readFile('./model/reviews.json', 'utf8', function readfileCallback(err){
        if(err){
            throw(err)
            
        } else {
            
          reviews.push(contactsx)  // add the new contact to the JSON file
          json = JSON.stringify(reviews, null, 4) // structure the new data nicely in the JSON file
          fs.writeFile('./model/reviews.json', json, 'utf8')
        }
        
        
    })
    res.redirect('/reviews')
    
});

/// Delete functionality

app.get('/deletereview/:id', function(req, res){
    var json = JSON.stringify(reviews);
    //Get id to delete from URL parameter
    var keyToFind = parseInt(req.params.id);
    var data = reviews;
    var index = data.map(function(reviews){return reviews.id}).indexOf(keyToFind);
    reviews.splice(index, 1);
    
    json = JSON.stringify(reviews, null, 4) // structure the new data nicely in the JSON file
    fs.writeFile('./model/reviews.json', json, 'utf8')
    
    console.log('It is gone!');
    res.redirect('/reviews');
});


// Edit functionality

app.get('/editreview/:id', function (req, res) {
    function chooseContact(indOne){
        return indOne.id === parseInt(req.params.id);
    }
    
    var indOne = reviews.filter(chooseContact)
    
    res.render('editreview', {res:indOne});  
});

app.post('/editreview/:id', function(req, res){
    
    var json = JSON.stringify(reviews);
    var keyToFind = parseInt(req.params.id);
    var data = reviews;
    var index = data.map(function(reviews){return reviews.id}).indexOf(keyToFind);
    
    reviews.splice(index, 1, {
        username: req.body.username,
        comment: req.body.comment,
        id: parseInt(req.params.id)  
    });
    json = JSON.stringify(reviews, null, 4);
    fs.writeFile('./model/reviews.json', json, 'utf8');
    
    
    res.redirect('/reviews');
})




// ****************************************

app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', function (){
    console.log('Good to go!');
})