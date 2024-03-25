import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch'; // Importa node-fetch come modulo ES
dotenv.config();

const app = express();
app.use(cors());
const APIkey = process.env.API_KEY;
const port = 3000;

app.get('/everything', async (req, res) => {
    try {
        const url = `https://newsapi.org/v2/everything?q=everything&from=2024-03-14&sortBy=publishedAt&language=en&apiKey=${APIkey}`;
        console.log(url);
        const response = await fetch(url); // Effettua la richiesta fetch
        const data = await response.json(); // Ottieni i dati dalla risposta
        res.json(data); // Invia i dati al client
    } catch (error) {
        console.error("Error fetching top news:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
