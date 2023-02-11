//Dependencies
const express = require('express')
const fs = require('fs')
const path = require('path')
const multiparty = require('multiparty')
const cors = require('cors')
const bp = require('body-parser')
const { loadavg } = require('os')

//Reading db.json file
const rawData = fs.readFileSync('./resources/db2.json');
const resources = JSON.parse(rawData);
const availableEndpoints = Object.keys(resources)

//Transforming db.json
// resources.products = resources.products.map(product => {
//     return {...product, "thumbnails": product.thumbnails.map(thumbnail => {
//         return thumbnail.slice(thumbnail.lastIndexOf('/'))
//     }), "image": product.image.slice(product.image.lastIndexOf('/'))}
// })
// fs.writeFileSync('./resources/db2.json', JSON.stringify(resources, null, 4))


//Allow system to allocate environment port or default to port 3000
const port = process.env.PORT || 8001

// Create main app
const app = express()

// Application configurations
app.use(bp.json())
app.use(bp.urlencoded({extended: true}))
app.use(cors())

//Root directory
const root = "./public/static"

//Home Page endpoint
app.get('/', (req, res) => {
    logAccess(req.method, req.path)
    res.sendFile('home.html', { root: root })
})

app.get("/product_images/*", (req, res) => {
    try {
        logAccess(req.method, req.path)
        res.sendFile(`${req.path}`, { root: root})

    } catch (e) {
        res.status(404).sendFile('notfound.html', { root: root })
    }
})

app.get('/products', (req, res) => {
    logAccess(req.method, req.path)
    const queryFields = req.query

    if(queryFields.category) {
        // Handle query by category
        const productsByCategory = resources.products.filter(product => product.category === queryFields.category)

        res.send(productsByCategory)
    }
    else if (queryFields.id) {
        // Handle query by id
        res.send(resources.products.find(product => product.id == (queryFields.id)))
    }
})

//
app.get("/resources/*", (req, res) => {
    logAccess(req.method, req.path)
    const resource = req.path.slice(1).split('/')
    if(resource.length == 2) {
        if(availableEndpoints.find(endpoint => endpoint === resource[1])) {
            res.send(resources[resource[1]])
        } else {
            res.status(404).send('<center><h1 style="color: maroon;">404 : Resource Not Found</h1></center>')
        }
    } else {
        res.status(404).sendFile('notfound.html', { root: root })
    }
})

//Redirect administration page
app.get('/c-admin', (req, res) => {
    logAccess(req.method, req.path)
    res.sendFile('home.html', { root: root })
})

app.get("/*", (req, res) => {
    res.status(404).sendFile('notfound.html', { root: root })
})

//Launch server on free port
app.listen(port, (err) => {
    if(err) {
        console.error(err)
    }
    console.log(`MAIN SERVER ~~~RUNNING~~~ | PORT = ${port}`)
})

function logAccess(method, path) {
    console.log(`${method.padEnd(9)}${path.slice(0,25).padEnd(35,".")}`)
}
