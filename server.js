const express = require('express');
const crypto = require('crypto');
const app = express();
const port = 3000;

const knownFingerprints = [
    'a1b2c3d4e5f67890...', 
];

app.use(express.json());

app.post('/validate', (req, res) => {
    const { fingerprint, timestamp } = req.body;
    

    const isValid = knownFingerprints.includes(fingerprint);
    
    res.json({ valid: isValid });
});

app.listen(port, () => {
    console.log(`Validation server running at http://localhost:${port}`);
});