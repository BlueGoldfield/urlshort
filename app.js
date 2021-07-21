const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const exphbs = require('express-handlebars')
const random = require('randomstring')

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}))
app.set('view engine', 'hbs')

const connectionString = 'mongodb+srv://admin:vQ89C06RljE4IUix@cluster0.0fdt5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
MongoClient.connect(connectionString, (err, client) => {
    if (err) return console.error(err)
    const db = client.db('short-urls')
    const urlCollection = db.collection('urls')

    app.use(express.urlencoded({ extended: true }))

    app.get('/', (req, res) => {
        res.render('home')
    })

    app.get("/shortened", (req, res) => {
        urlCollection.find().toArray()
            .then(result => {
                res.render('shortened', {short_url: result[result.length - 1]})
                updateUrls()
            })
            .catch(err => {
                console.error(err)
            })
        }
    )
    app.post("/shortened", (req, res) => {
        var found = false
        if (req.body['furl'].indexOf('http://') == -1 && req.body['furl'].indexOf('https://') == -1){
            req.body['furl'] = "http://" + req.body['furl']
        }
        urlCollection.find().toArray((err, docs) => {
            if (err) return console.error(err)
            docs.forEach((doc) => {
                if (req.body['furl'] == doc['furl']){
                    found = true
                    res.render('shortened', {short_url: doc})
                    updateUrls()
                }
                })
                if (found == false){
                    rand = random.generate(5)
                    req.body['newurl'] = req.get('host') + '/' + rand
                    req.body['short'] = rand
                    urlCollection.insertOne(req.body, (err, result) => {
                        if (err) return console.error(err)
                        res.redirect('/shortened')
                        updateUrls()
                    })
                }
            })
        })

    function updateUrls(){
        urlCollection.find().toArray((err, docs) => {
            if (err) return console.error(err)
            docs.forEach((doc) => {
                app.get("/" + doc['short'], (req, res) => {
                    res.redirect(301, doc['furl'])
                })
            })
        })
    }
})

    console.log('connected to database.')

app.listen(5000, () => {
    console.log('server is running.')
})