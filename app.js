const { application } = require('express')
const express = require('express')
const connectDB = require('./connect')
const app = express()
const mongoose = require('mongoose')



require('dotenv').config()


const dns = require('dns')


// middlewares
app.use(express.static('./public'))
app.use(express.json())
app.use(express.urlencoded())




// database

const TheSchema = new mongoose.Schema({
    original_url: {
        type: String,
        required: true
    },
    short_url: {
        type: String,
        required: true
    }
})
const ShortUrl = mongoose.model('ShortUrl', TheSchema)














app.get('/hello', (req, res) => {
    res.send("Say Hello")

})
app.post('/api/shorturl/new', (req, res) => {

    let adr = req.body.url
    const actualUrl = new URL(adr)

    dns.lookup(actualUrl.hostname, async (err, adress, family) => {
        console.log(actualUrl.hostname, adress, family, err)
        if (err == null) {
            let exist = await ShortUrl.findOne({ original_url: actualUrl.hostname })
            if (exist) {
                res.json({
                    original_url: exist.original_url,
                    short_url: exist.short_url
                })
            } else {
                let new_url = {
                    original_url: actualUrl.hostname,
                    short_url: RandomValue()
                }
                ShortUrl.create(new_url, (err) => {
                    if (err) console.log(err)
                })
                res.json(new_url)
            }
        }
    })
})


//helper function to assign random values to the short_url
function RandomValue() {
    let value = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    let randomvalue = ''
    for (let i = 0; i < 6; i++) {
        randomvalue += value[Math.floor(Math.random() * 9)]
    }
    // return randomvalue;
    return new Number(randomvalue);
}


// going to the short url

app.post('/api/shorturl/new_url',(req,res)=>{
    const short = req.body.short
    console.log(short)
    if(short !== null){
        ShortUrl.findOne({
            short_url: short
        }, (err,data)=>{
            if(err){
                console.log(err)
            } 
            else{
                console.log(data)
                let new_input = 'https://'
                new_input += data.original_url
                res.redirect(new_input)
            } 
        })
    }else{
        res.json({
            "err msg": "the url doesn't exist"
        })
    }
    
})












const port = process.env.PORT || 5000
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port,
            console.log(`Server is listening on port ${port}`)
        )
    } catch (error) {
        console.log(error)
    }
}

start()