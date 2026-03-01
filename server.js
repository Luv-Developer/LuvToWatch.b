require("dotenv").config()
const express = require("express")
const app = express()
const PORT = process.env.PORT
const path = require("path")
const http = require("http")
const cors = require("cors")
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)
const nodemailer = require("nodemailer")
const qrcode = require("qrcode")
const shortid = require("shortid")
var recieveremail 
var moviename
var seatnumber
var ticketprice 
var movieimage 
var ticketdate


// Middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname,"public")))

// Cors Configuration 
app.use(cors({
    origin: ["https://luv-to-watch.vercel.app"], // Removed trailing slash
    methods: ["POST", "GET", "OPTIONS"], // Added OPTIONS method
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
}))

// remove explicit options route because '*' triggers a PathError in path-to-regexp
// CORS middleware above already handles OPTIONS requests for all routes
// app.options('*', cors())

// Nodemailer Configuration 
let smtptconfig = {
    service:"gmail",
    port:465,
    secure:true,
    auth:{
        user:process.env.MAIL,
        pass:process.env.PASS
    }
}

// Routes
app.get("/",(req,res)=>{
    res.send("Hello")
})

 // Stripe Configuration for buying Ticket Online 
app.post("/ticket",async(req,res)=>{
    try{
        // support payload where `data` is an array of movie items
        // and allow `date` and `seatNumber` to be passed at top-level
        let { data, email, date, seatNumber } = req.body

        ticketprice = data[0].ticketprice 
        // defensive extraction with sensible fallbacks
        const first = Array.isArray(data) && data.length > 0 ? data[0] : null
        ticketprice = first && first.priceincents ? first.priceincents : 0
        movieimage = first && first.image ? first.image : ''
        // prefer explicit date from client, otherwise use current timestamp
        ticketdate = date || new Date().toLocaleString()

        // seats may be passed inside the first item as `seats` or as top-level `seatNumber`
        if (first && Array.isArray(first.seats) && first.seats.length > 0) {
            seatnumber = first.seats.map(e => e.id).join(', ')
        } else if (seatNumber) {
            seatnumber = seatNumber
        } else {
            seatnumber = 'N/A'
        }
        recieveremail = email
        if(data){
            const session = await stripe.checkout.sessions.create({
            payment_method_types:['card'],
            mode:"payment",
            line_items: data.map((movie)=>{
                moviename = movie.name
            return{
                    price_data:{
                        currency:"inr",
                        product_data:{
                            name:movie.name,
                            images:[movie.image],
                            description:"LuvToWatch | Movie Ticket"
                        },
                        unit_amount: movie.priceincents   
                    },
                    quantity: movie.quantity
                }
            }) ,
            success_url:`https://luvtowatch.onrender.com/success`,
            cancel_url: `http://localhost:${PORT}/cancel`
        })
        return res.json({url : session.url}).status(200)
        }
    }
    catch(err){
        return res.status(500).json(err)
    }
})

app.get("/success",(req,res)=>{
    qrcode.toString(moviename,{type:"terminal"},(err,qr)=>{
        newqr = qr
    })
    let id = shortid.generate()
    let transporter = nodemailer.createTransport(smtptconfig)
    let mailoption = {
    from: process.env.MAIL, 
    to: recieveremail,
    subject: 'LuvToWatch | Movie Ticket', 
    text: 'Movie Ticket Reservation',
    html: `<h3>Transaction for the booking of ${moviename} has been successfully completed!</h3>
    <h4>Venue: UNITY ONE CINEPOLIS (ROHINI)</h4>
    <h4>Movie: <img src = "${movieimage}"></h4>
    <h4>Seat Number: ${seatnumber}</h4>
    <h4>Ticket Price: ${ticketprice}</h4>
    <h4>Ticket Date: ${ticketdate}</h4>
    <h4>Hall Number is 4</h4>
    <p>Ticket id is ${id}</p>
    <br><br>
    <img src = "https://randomqr.com/assets/images/randomqr-256.png">
    `
    }
    transporter.sendMail(mailoption,(err,info)=>{
        if(err){
            return res.json(err).status(500)
        }
        else{
            return res.render("success",{recieveremail})
        }
    })
})

app.get("/test",(req,res)=>{
    qrcode.toCanvas()
})


app.listen(PORT,()=>{
    console.log(`Server is running at PORT ${PORT}`)
})