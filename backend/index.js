const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const DB = new sqlite3.Database("./db.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err);
    console.log("CONNECTED TO DATABASE!");
});

// DB.run(`
//     CREATE TABLE "clients" (
//         "Cont" TEXT,
//         "Consumator" TEXT,
//         "Fix1" TEXT,
//         "Fix2" TEXT,
//         "Email" TEXT,
//         "createdAt" TEXT,
//         "Mobil1" TEXT,
//         "Mobil2" TEXT,
//         "updatedAt" TEXT,
//         "createdAt" TEXT,
//         "sentAt": TEXT,
//         PRIMARY KEY("Cont")
//     );
// `);

const app = express();

app.use(cors());
app.use(express.json());

app.get("/clients", (req, res) => {
    const query = `SELECT * FROM clients`;
    let clients = [];

    DB.all(query, (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            clients = rows;
        }
        res.json(clients);
    });
});

app.get("/client", (req, res) => {
    const { clientCont } = req.query;
    const query = `SELECT * FROM clients WHERE Cont = ${clientCont}`;
    let client = null;

    DB.all(query, (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            if (rows.length) client = rows[0];
        }
        res.json(client);
    });
});

app.post("/client", (req, res) => {
    const { Cont, Consumator, Adresa, Fix1, Mobil1, Fix2, Mobil2, Email } = req.body;
    const query = `INSERT INTO clients (Cont, Consumator, Adresa, Fix1, Mobil1, Fix2, Mobil2, Email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const createdAt = String(new Date() - 0);
    DB.run(query, [Cont, Consumator, Adresa, Fix1, Mobil1, Fix2, Mobil2, Email, createdAt, createdAt], (err) => {
        if (err) console.error(err);
    });

    res.json({
        createdAt,
        updatedAt: createdAt,
    });
});

app.put("/client", (req, res) => {
    const { Cont, Fix1, Mobil1, Fix2, Mobil2, Email } = req.body;
    const query = `UPDATE clients SET Fix1 = ?, Mobil1 = ?, Fix2 = ?, Mobil2 = ?, Email = ?, updatedAt = ? WHERE Cont = ?`;
    const updatedAt = String(new Date() - 0);

    DB.run(query, [Fix1, Mobil1, Fix2, Mobil2, Email, updatedAt, Cont], (err) => {
        if (err) console.error(err);
    });

    res.json({
        updatedAt,
    });
});

app.put("/sendClient", (req, res) => {
    const { Cont } = req.body;
    const sentAt = String(new Date() - 0);
    const query = `UPDATE clients SET sentAt = ${sentAt} WHERE Cont = ${Cont}`;

    DB.run(query, (err) => {
        if (err) console.error(err);
    });

    res.json({ sentAt });
});

app.put("/unsendClient", (req, res) => {
    const { Cont } = req.body;
    const query = `UPDATE clients SET sentAt = NULL WHERE Cont = ${Cont}`;

    DB.run(query, (err) => {
        if (err) console.error(err);
    });

    res.json({ sentAt: null });
});

app.listen("8080", () => console.log("SERVER STARTED ON 8080!"));
