const express = require("express");
const router = express.Router();

const multer = require("multer");
const ai = require("../services/gemini");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});
router.post(
    "/",
    upload.single("foto"),
    async (req, res) => {

        try {

            if (!req.file) {
                return res.render("rekomendasi", {
                    hasil: null,
                    error: "Silakan upload foto terlebih dahulu."
                });
            }

            const prompt = `...`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    {
                        inlineData: {
                            mimeType: req.file.mimetype,
                            data: req.file.buffer.toString("base64")
                        }
                    },
                    {
                        text: prompt
                    }
                ]
            });

            const hasil = response.text;

            res.render("rekomendasi", {
                hasil,
                error: null
            });

        } catch (err) {

            console.error("GEMINI ERROR:", err);

            res.render("rekomendasi", {
                hasil: null,
                error: err.message
            });

        }

    }
);

module.exports = router;