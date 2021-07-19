const express = require('express')
const exp = express()

exp.get("/", (req, res) => {
    res.send('test')
})

exp.listen(5000, () => {
    console.log('server is running.')
})