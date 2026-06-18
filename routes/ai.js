const express = require("express");
const router = express.Router();
const multer = require("multer");
const ai = require("../services/gemini");
const fs = require("fs");

router.get("/", (req,res)=>{
    res.render("rekomendasi");
});

module.exports = router;
const storage = multer.diskStorage({

    destination(req,file,cb){
        cb(null,"public/uploads");
    },

    filename(req,file,cb){
        cb(
            null,
            Date.now() + "-" + file.originalname
        );
    }

});

const upload = multer({
    storage
});

const produkHanna = `
1. Premium Blinds with Box
   Karakter:
   Elegan, premium, mewah.

2. Premium Regular
   Karakter:
   Modern dan praktis.

3. Premium Vitrase
   Karakter:
   Natural dan terang.

4. Premium Roller Blind
   Karakter:
   Modern dan profesional.

5. Premium Venetian Blind
   Karakter:
   Kontrol cahaya fleksibel.

6. Premium Vertical Blind
   Karakter:
   Cocok untuk jendela besar.
`;
router.post(
"/",
upload.single("foto"),
async (req,res)=>{

});
const imageBytes =
fs.readFileSync(req.file.path);
const prompt = `
Anda adalah konsultan interior profesional Hanna Gordyn.

Analisis foto ruangan.

Pilih produk HANYA dari daftar berikut:

${produkHanna}

Tugas:

1. Identifikasi warna dominan.
2. Identifikasi gaya interior.
3. Pilih 3 produk terbaik.
4. Berikan skor kecocokan.
5. Berikan alasan.

Jawab dalam bahasa Indonesia.
`;
const response =
await ai.models.generateContent({

model: "gemini-2.5-flash",

contents: [
{
inlineData:{
mimeType:req.file.mimetype,
data:imageBytes.toString("base64")
}
},
prompt
]

});
const hasil =
response.text;

res.render(
"hasil-ai",
{
hasil
}
);