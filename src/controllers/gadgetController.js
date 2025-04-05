const db = require('../config/db');
var CryptoJS = require("crypto-js");

exports.getAllGadgets = (req, res) => {
    db.all("SELECT * FROM gadgets", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
          // Decrypt the `secretInfo` field for each gadget
        const decryptedRows = rows.map(row => {
            if (row.secretInfo) {
                const bytes = CryptoJS.AES.decrypt(row.secretInfo, 'encryptionKey');
                row.secretInfo = bytes.toString(CryptoJS.enc.Utf8); // Decrypt and convert to UTF-8
            }
            return row;
        });

        res.status(200).json(decryptedRows);
    });
};

exports.createGadget = (req, res) => {
    const { name, price, quantity } = req.body;
    var encryptedName = CryptoJS.AES.encrypt(name, 'encryptionKey').toString();

    db.run("INSERT INTO gadgets (name, price, quantity, secretInfo) VALUES (?, ?, ?,?)", [name, price, quantity, encryptedName], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ id: this.lastID });
    });
};

exports.deleteGadget = (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM gadgets WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Gadget not found" });
        res.status(200).json({ message: "Gadget deleted" });
    });
}
exports.updateGadget = (req, res) => {
    const { id } = req.params;
    const { name, price, quantity } = req.body;
    db.run("UPDATE gadgets SET name = ?, price = ?, quantity = ? WHERE id = ?", [name, price, quantity, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Gadget not found" });
        res.status(200).json({ message: "Gadget updated" });
    });
}
exports.getGadgetById = (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM gadgets WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: "Gadget not found" });
        res.status(200).json(row);
    });
}

exports.bulkDeleteGadgets = (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid request" });
    }
    const placeholders = ids.map(() => '?').join(',');
    db.run(`DELETE FROM gadgets WHERE id IN (${placeholders})`, ids, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: `${this.changes} gadgets deleted` });
    });
}

exports.bulkUpdateGadgets = (req, res) => {
    const gadgets  = req.body;
    if (!Array.isArray(gadgets) || gadgets.length === 0) {
        return res.status(400).json({ message: "Invalid request" });
    }

    const updates = gadgets.map(gadget => {
        const { id, name, price, quantity } = gadget;
        return new Promise((resolve, reject) => {
            db.run("UPDATE gadgets SET price = ?, quantity = ? WHERE id = ?", [price, quantity, id], function(err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    });

    Promise.all(updates)
        .then(results => {
            res.status(200).json({ message: `${results.reduce((a, b) => a + b, 0)} gadgets updated` });
        })
        .catch(err => res.status(500).json({ error: err.message }));
}