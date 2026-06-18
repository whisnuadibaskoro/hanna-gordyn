require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const cors = require("cors");

const supabase = require("./config/supabase");
const auth = require("./middleware/auth");
const aiRoutes = require("./routes/ai");
const app = express();
process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:");
    console.error(err);
});

process.on("unhandledRejection", (reason) => {
    console.error("UNHANDLED REJECTION:");
    console.error(reason);
});

console.log("SUPABASE_URL:", !!process.env.SUPABASE_URL);
console.log("SUPABASE_KEY:", !!process.env.SUPABASE_KEY);
console.log("SESSION_SECRET:", !!process.env.SESSION_SECRET);
console.log("ADMIN_USERNAME:", !!process.env.ADMIN_USERNAME);
console.log("ADMIN_PASSWORD:", !!process.env.ADMIN_PASSWORD);
console.log("GEMINI_API_KEY:", !!process.env.GEMINI_API_KEY);
console.log("REGISTER AI ROUTE");
/*
================================
MIDDLEWARE
================================
*/
app.use("/views/rekomendasi", aiRoutes);
app.use(cors());

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

app.use(express.static(
    path.join(__dirname, "public")
));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);

/*
================================
VIEW ENGINE
================================
*/

app.set(
    "view engine",
    "ejs"
);

app.set(
    "views",
    path.join(
        __dirname,
        "views"
    )
);
/*
================================
FUNCTION
================================
*/

async function generateReceipt(){

    const now = new Date();

    const year = now.getFullYear();

    const month =
    String(now.getMonth()+1)
    .padStart(2,"0");

    const day =
    String(now.getDate())
    .padStart(2,"0");

    const datePrefix = `HG${year}${month}${day}`;

    // Ambil nomor resi terbaru hari ini
    const { data } = await supabase
        .from("warranty")
        .select("receipt_number")
        .like("receipt_number", `${datePrefix}%`)
        .order("id", { ascending: false })
        .limit(1);

    let sequence = 1;

    if(data && data.length > 0){
        const lastReceipt = data[0].receipt_number;
        const lastSequence = parseInt(
            lastReceipt.slice(-3)
        );
        sequence = lastSequence + 1;
    }

    const sequenceStr = String(sequence)
        .padStart(3, "0");

    return `${datePrefix}${sequenceStr}`;

}

/*
================================
USER
================================
*/

app.get("/", (req, res) => {

    res.render("home");

});

app.get("/katalog", (req, res) => {

    res.render("katalog");

});

app.get("/kontak", (req, res) => {

    res.render("kontak");

});

app.get("/garansi", (req, res) => {

    res.render(
        "garansi",
        {
            data: null,
            error: null
        }
    );

});

app.post("/garansi", async (req, res) => {

    const receipt_number = req.body.receipt_number;

    const { data, error } = await supabase
        
    .from("warranty")
    .select("*")
    .eq("receipt_number", receipt_number)
    .single();

    if (error) {
        return res.render("garansi", {
            data: null,
            error: "Nomor Resi Tidak Ditemukan"
        });
    }

    res.render("garansi", {
        data,
        error: null
    });

});


/*
================================
ADMIN LOGIN
================================
*/

app.get(
    "/admin",
    (req,res)=>{

        res.render(
            "admin/login"
        );

});

app.post(
    "/admin/login",

    (req,res)=>{

        const username =
        req.body.username;

        const password =
        req.body.password;

        if(

            username ===
            process.env.ADMIN_USERNAME

            &&

            password ===
            process.env.ADMIN_PASSWORD

        ){

            req.session.login =
            true;

            return res.redirect(
                "/admin/dashboard"
            );

        }

        res.send(
            "Username atau Password Salah"
        );

});

/*
================================
DASHBOARD
================================
*/

app.get(

"/admin/dashboard",

auth,

async(req,res)=>{

const {
data,
error
}

=

await supabase

.from(
"warranty"
)

.select("*")

.order(
"id",
{
ascending:false
}
);

res.render(

"admin/dashboard",

{

data

}

);

});

/*
================================
TAMBAH GARANSI
================================
*/
app.get(
    "/admin/tambah",
    auth,
    (req, res) => {

        res.render("admin/tambah");

    }
);

app.post(

"/admin/tambah",

auth,

async(req,res)=>{

    const receipt =
    await generateReceipt();

    await supabase

    .from("warranty")

    .insert([

        {

            buyer_name:
            req.body.buyer_name,

            warranty_type:
            req.body.warranty_type,

            purchase_date:
            req.body.purchase_date,

            warranty_end:
            req.body.warranty_end,

            receipt_number:
            receipt

        }

    ]);

    res.redirect(
        "/admin/dashboard"
    );

});
/*
================================
HAPUS
================================
*/

app.get(

"/admin/hapus/:id",

auth,

async(req,res)=>{

await supabase

.from(
"warranty"
)

.delete()

.eq(
"id",
req.params.id
);

res.redirect(
"/admin/dashboard"
);

});

/*
================================
LOGOUT
================================
*/

app.get(

"/admin/logout",

(req,res)=>{

req.session.destroy(()=>{

res.redirect(
"/admin"
);

});

});

/*
================================
SERVER
================================
*/

const PORT =
process.env.PORT || 3000;

app.listen(
PORT,
()=>{

console.log(

    "Server berjalan di : "

+

PORT

);

});

app.get(

"/admin/edit/:id",

auth,

async(req,res)=>{

const {

data,
error

}

=

await supabase

.from("warranty")

.select("*")

.eq(
"id",
req.params.id
)

.single();

res.render(

"admin/edit",

{

data

}

);

});

app.post(

"/admin/edit/:id",

auth,

async(req,res)=>{

await supabase

.from("warranty")

.update({

buyer_name:
req.body.buyer_name,

warranty_type:
req.body.warranty_type,

purchase_date:
req.body.purchase_date,

warranty_end:
req.body.warranty_end

})

.eq(
"id",
req.params.id
);

res.redirect(
"/admin/dashboard"
);

});

app.get(

"/admin/search",

auth,

async(req,res)=>{

const keyword =
req.query.keyword;

const {
data
}

=

await supabase

.from("warranty")

.select("*")

.ilike(
"buyer_name",
`%${keyword}%`
)

.order(
"id",
{
ascending:false
}
);

res.render(

"admin/dashboard",

{

data

}

);

});
