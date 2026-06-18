console.log("AI ROUTES LOADED");
const express = require("express");
const router = express.Router();

const multer = require("multer");
const ai = require("../services/gemini");

// ========================
// MULTER
// ========================

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// ========================
// DATA PRODUK
// ========================

const produkHanna = `
1. Premium Blinds with Box
2. Premium Regular
3. Premium Vitrase
4. Premium Roller Blind
5. Premium Venetian Blind
6. Premium Vertical Blind
`;

// ========================
// HALAMAN
// ========================

router.get("/", (req, res) => {

    res.render("rekomendasi", {
        hasil: null,
        error: null
    });

});

// ========================
// ANALISIS
// ========================

router.post(
    "/",
    upload.single("foto"),
    async (req, res) => {

        try {

            if (!req.file) {

                return res.render(
                    "rekomendasi",
                    {
                        hasil: null,
                        error: "Silakan upload foto."
                    }
                );

            }

            const prompt = `
Anda adalah konsultan interior Hanna Gordyn.

Analisis foto ruangan berikut.

Pilih produk hanya dari daftar berikut:

${produkHanna}

Berikan:

1. Warna dominan
2. Gaya interior
3. 3 rekomendasi produk
4. Skor kecocokan
5. Alasan
`;

            const response =
                await ai.models.generateContent({

                    model: "gemini-2.5-flash",

                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    inlineData: {
                                        mimeType:
                                        req.file.mimetype,
                                        data:
                                        req.file.buffer.toString("base64")
                                    }
                                },
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]

                });

            const hasil =
                response.text ||
                "Tidak ada hasil.";

            res.render(
                "rekomendasi",
                {
                    hasil,
                    error: null
                }
            );

        }

        catch (err) {

            console.error(
                "GEMINI ERROR:",
                err
            );

            res.render(
                "rekomendasi",
                {
                    hasil: null,
                    error: err.message
                }
            );

        }

    }
);

module.exports = router;