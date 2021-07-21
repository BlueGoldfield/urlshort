const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const exphbs = require('express-handlebars')

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}))
app.set('view engine', 'hbs')

const connectionString = 'mongodb+srv://admin:vQ89C06RljE4IUix@cluster0.0fdt5.mongodb.net/test?retryWrites=true&w=majority'
MongoClient.connect(connectionString, (err, client) => {
    if (err) return console.error(err)
    const db = client.db('short-urls')
    const urlCollection = db.collection('urls')

    app.use(express.urlencoded({ extended: true }))

    updateUrls()

    app.get("/", (req, res) => {
        //res.sendFile(__dirname + '/public/index.html')
        res.render('home')
    })
    app.get("/shortened", (req, res) => {
        //res.sendFile(__dirname + '/public/shortened.html')
        urlCollection.find().toArray()
            .then(result => {
                //console.log(result[result.length - 1].short)
                res.render('shortened', {short_url: result[result.length - 1]})
                updateUrls()
            })
            .catch(err => {
                console.error(err)
            })
        }
    )
    app.post("/shortened", (req, res) => {
        req.body['newurl'] = req.get('host') + '/' + req.body['short']
        urlCollection.insertOne(req.body, (err, result) => {
            if (err) return console.error(err)
            res.redirect('/shortened')
            updateUrls()
        })
    })

    function updateUrls(){
        urlCollection.find().toArray((err, docs) => {
            if (err) return console.error(err)
            docs.forEach((doc) => {
                app.get("/" + doc.short, (req, res) => {
                    res.redirect(301, doc.url)
                })
            })
        })
    }

    console.log('connected to database.')
})

app.listen(5000, () => {
    console.log('server is running.')
})