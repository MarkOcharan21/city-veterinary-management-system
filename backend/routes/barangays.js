const express = require("express");
const router = express.Router();

const db = require("../config/db");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

/*
GET ALL BARANGAYS
*/
router.get("/", auth, async (req, res) => {
    try {

        const [rows] = await db.query(
            "SELECT * FROM barangays ORDER BY barangay_name ASC"
        );

        res.json(rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to retrieve barangays."
        });

    }
});

/*
GET SINGLE BARANGAY
*/
router.get("/:id", auth, async (req, res) => {

    try {

        const [rows] = await db.query(

            "SELECT * FROM barangays WHERE barangay_id=?",

            [req.params.id]

        );

        if (rows.length === 0) {

            return res.status(404).json({

                message: "Barangay not found."

            });

        }

        res.json(rows[0]);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Server error"

        });

    }

});

/*
CREATE BARANGAY
*/
router.post("/", auth, authorize("admin"), async (req, res) => {

    try {

        const { barangay_name } = req.body;

        if (!barangay_name) {

            return res.status(400).json({

                message: "Barangay name is required."

            });

        }

        const [duplicate] = await db.query(

            "SELECT * FROM barangays WHERE barangay_name=?",

            [barangay_name]

        );

        if (duplicate.length > 0) {

            return res.status(409).json({

                message: "Barangay already exists."

            });

        }

        const [result] = await db.query(

            "INSERT INTO barangays(barangay_name) VALUES(?)",

            [barangay_name]

        );

        res.status(201).json({

            message: "Barangay added.",

            barangay_id: result.insertId

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Unable to create barangay."

        });

    }

});

/*
UPDATE BARANGAY
*/
router.put("/:id", auth, authorize("admin"), async (req, res) => {

    try {

        const { barangay_name } = req.body;

        await db.query(

            "UPDATE barangays SET barangay_name=? WHERE barangay_id=?",

            [

                barangay_name,

                req.params.id

            ]

        );

        res.json({

            message: "Barangay updated."

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Update failed."

        });

    }

});

/*
DELETE BARANGAY
*/
router.delete("/:id", auth, authorize("admin"), async (req, res) => {

    try {

        await db.query(

            "DELETE FROM barangays WHERE barangay_id=?",

            [req.params.id]

        );

        res.json({

            message: "Barangay deleted."

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Delete failed."

        });

    }

});

/*
SEARCH BARANGAY
*/
router.get("/search/:keyword", auth, async (req, res) => {

    try {

        const keyword = `%${req.params.keyword}%`;

        const [rows] = await db.query(

            "SELECT * FROM barangays WHERE barangay_name LIKE ? ORDER BY barangay_name",

            [keyword]

        );

        res.json(rows);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Search failed."

        });

    }

});

module.exports = router;