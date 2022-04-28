const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const DB = new sqlite3.Database("./db.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error(err);
    else console.log("CONNECTED TO DATABASE!");
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/clients", (_, res) => {
    const query = `SELECT * FROM clients`;

    DB.all(query, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
        } else {
            res.json(rows);
        }
    });
});

app.get("/client", (req, res) => {
    const { Cont } = req.query;
    const query = `SELECT * FROM clients WHERE Cont = ${Cont}`;

    DB.all(query, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        if (!rows.length) return res.status(404).json(`no client with Cont = ${Cont}`);

        res.json(rows[0]);
    });
});

app.post("/client", (req, res) => {
    const { Cont, Consumator, Adresa, Fix1, Mobil1, Fix2, Mobil2, Email } = req.body;
    const createdAt = String(new Date() - 0);
    const query = `INSERT INTO clients (Cont, Consumator, Adresa, Fix1, Mobil1, Fix2, Mobil2, Email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    DB.run(query, [Cont, Consumator, Adresa, Fix1, Mobil1, Fix2, Mobil2, Email, createdAt, createdAt], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        res.json({
            createdAt,
            updatedAt: createdAt,
        });
    });
});

app.put("/client", (req, res) => {
    const { Cont, Consumator, Fix1, Mobil1, Fix2, Mobil2, Email } = req.body;
    const query = `UPDATE clients SET Consumator = ?, Fix1 = ?, Mobil1 = ?, Fix2 = ?, Mobil2 = ?, Email = ?, updatedAt = ? WHERE Cont = ?`;
    const updatedAt = String(new Date() - 0);

    DB.run(query, [Consumator, Fix1, Mobil1, Fix2, Mobil2, Email, updatedAt, Cont], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        res.json({
            updatedAt,
        });
    });
});

app.put("/sendClient", (req, res) => {
    const { Cont } = req.body;
    const sentAt = String(new Date() - 0);
    const query = `UPDATE clients SET sentAt = ${sentAt} WHERE Cont = ${Cont}`;

    DB.run(query, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        res.json({ sentAt });
    });
});

app.put("/unsendClient", (req, res) => {
    const { Cont } = req.body;
    const query = `UPDATE clients SET sentAt = NULL WHERE Cont = ${Cont}`;

    DB.run(query, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        res.json({ sentAt: null });
    });
});

app.listen("8080", () => console.log("SERVER STARTED ON 8080!"));
