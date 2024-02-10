const express = require('express');
const multer = require('multer');
const db = require('./database');
const app = express();
const PORT = 3000;

const upload = multer();

// creating a new person with form data
app.post('/personnes', upload.single('image'), (req, res) => {
    const nom = req.body.nom;
    const adresse = req.body.adresse;
    const image = req.file; 

   
    if (!image) {
        return res.status(400).json({ error: 'Image field is required' });
    }

    const imageBuffer = image.buffer; 

    // Insert the new person with the image data into the database
    db.run(`INSERT INTO personnes (nom, adresse, image) VALUES (?, ?, ?)`, [nom, adresse, imageBuffer], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({
            message: 'success',
            data: {
                id: this.lastID
            }
        });
    });
});


// Route to retrieve all persons
app.get('/personnes', (req, res) => {
    db.all("SELECT * FROM personnes", [], (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }

        // convert image buffer to base64 string
        const formattedRows = rows.map(row => {
            const base64Image = row.image ? `data:image/jpeg;base64,${Buffer.from(row.image).toString('base64')}` : null;
            return {
                id: row.id,
                nom: row.nom,
                adresse: row.adresse,
                imageBase64: base64Image 
            };
        });

        res.json({
            "message": "success",
            "data": formattedRows
        });
    });
});



// Route pour récupérer une personne par ID
app.get('/personnes/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM personnes WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }
        
        
        if (!row) {
            res.status(404).json({
                "error": "Person not found"
            });
            return;
        }

        // Convert image buffer to base64 string
        const base64Image = row.image ? `data:image/jpeg;base64,${Buffer.from(row.image).toString('base64')}` : null;

        res.json({
            "message": "success",
            "data": {
                id: row.id,
                nom: row.nom,
                adresse: row.adresse,
                imageBase64: base64Image 
            }
        });
    });
});




// Route pour mettre à jour une personne
app.put('/personnes/:id', (req, res) => {
    const id = req.params.id;
    const { nom, adresse } = req.body; // Récupérer le nom et l'adresse depuis le corps de la requête
    db.run(`UPDATE personnes SET nom = ?, adresse = ? WHERE id = ?`, [nom, adresse, id], function(err) {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }
        res.json({
            "message": "success"
        });
    });
});

// Route pour supprimer une personne
app.delete('/personnes/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM personnes WHERE id = ?`, id, function(err) {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }
        res.json({
            "message": "success"
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
