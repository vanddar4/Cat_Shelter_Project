const url = require('url')
const fs = require('fs')
const path = require('path')
const qs = require('querystring')
const formidable = require('formidable')
const breeds = require('../data/breeds.json')
let cats = require('../data/cats.json')



module.exports = (req, res) => {
    const pathname = url.parse(req.url).pathname
    console.log(pathname)

    if(pathname === '/cats/add-cat' && req.method === 'GET') { 
        let filepath = path.normalize(path.join(__dirname, '../views/addCat.html'))

        const index = fs.createReadStream(filepath)

        index.on('data', data => {
            let catBreedPlaceholder = breeds.map(breed => `<option value="${breed}">${breed}</option>`)
            let modifiedData = data.toString().replace('{{catBreeds}}', catBreedPlaceholder)
            res.write(modifiedData)
        })

        index.on('end', () => {
            res.end()
        })

        index.on('error', err => {
            console.log(err)
        })

    } else if(pathname === '/cats/add-breed' && req.method === 'GET') {
        let filepath = path.normalize(path.join(__dirname, '../views/addBreed.html'))

        const index = fs.createReadStream(filepath)

        index.on('data', data => {
            res.write(data)
        })

        index.on('end', () => {
            res.end()
        })

        index.on('error', err => {
            console.log(err)
        })
    } else if(pathname === '/cats/add-cat' && req.method === 'POST') {
        let form = new formidable.IncomingForm({uploadDir: "./content/images"})
        
        form.parse(req, (err, fields, files) => {
            if(err) throw err

            let oldpath = files.upload.path;
            let newpath = path.join("./content/images/" + files.upload.name)

            fs.rename(oldpath, newpath, (err) => {
                if(err) throw err
                console.log('files was uploaded sucessfully')
            })


            fs.readFile('./data/cache.json', 'utf8', (err, data) => {
                let cache = JSON.parse(data)
                let uploadID = cache.uploadID + 1
                console.log(uploadID)

                fs.readFile('./data/cats.json', 'utf8', (err, data) => {
                    let allCats = JSON.parse(data)
    
                    allCats.push({id: uploadID, ...fields, image: files.upload.name})
                    let json = JSON.stringify(allCats)
    
                    fs.writeFile('./data/cache.json', JSON.stringify({uploadID}), () => console.log('cache updated'))
    
                    fs.writeFile('./data/cats.json', json, () => {
                        res.writeHead(302, {location: '/'})
                        res.end()
                    })
                })
            })

        })

    } else if(pathname === '/cats/add-breed' && req.method === 'POST') {
        let formData = ''
        req.on('data', data => {
            formData += data
        })

        req.on('end', () => {
            let body = qs.parse(formData)
            fs.readFile('./data/breeds.json', (err, data) => {
                if(err) {
                    throw err
                }
                let breeds = JSON.parse(data)
                breeds.push(body.breed)
                let json = JSON.stringify(breeds)

                fs.writeFile('./data/breeds.json', json, 'utf-8', () => console.log('the breed was successfully uploaded'));
            })

            res.writeHead(302, {location: '/'})
            return res.end();
        })
    } else if(pathname.includes('/cats-edit') && req.method === 'GET') {
        let filepath = path.normalize(path.join(__dirname, '../views/editCat.html'))
        const catID = pathname.split('/').pop()

        const cat = cats.find(cat => cat.id == catID)

        if(cat === null)  throw 'id not found'

        const index = fs.createReadStream(filepath)

        index.on('data', data => {
            let catEditPlaceholder = `
            <form action="/cats-edit/${catID}" method="POST" class="cat-form" enctype="multipart/form-data">
            <h2>Edit Cat</h2>
            <label for="name">Name</label>
            <input name="name" type="text" id="name" value="${cat.name}">
            <label for="description">Description</label>
            <textarea name="description" id="description">${cat.description}</textarea>
            <label for="image">Image</label>
            <input name="upload" type="file" id="image">
            <label for="group">Breed</label>
            <select name="breed" id="group" value="${cat.breed}">
				{{catBreeds}}
            </select>
            <button type="submit">Edit Cat</button>
            </form>`
            let catBreedPlaceholder = breeds.map(breed => `<option value="${breed}">${breed}</option>`)
            let modifiedCatEditPlaceholder = catEditPlaceholder.replace('{{catBreeds}}', catBreedPlaceholder)
            let modifiedData = data.toString().replace('{{editCat}}', modifiedCatEditPlaceholder)

            res.write(modifiedData)
        })

        index.on('end', () => {
            res.end()
        })

        index.on('error', err => {
            console.log(err)
        })
    } else if(pathname.includes('/cats-find-new-home') && req.method === 'GET') { console.log('running')
        const catID = pathname.split('/').pop()
        let filepath = path.normalize(path.join(__dirname, '../views/catShelter.html'))
        console.log('loaded **********')
        const cat = cats.find(cat => cat.id == catID)
        if(cat === null)  throw 'id not found'

        const index = fs.createReadStream(filepath)

        index.on('data', data => {
            // let catShelterPlaceholder = `
            // <form action="/cats-find-new-home/${catID}" method="POST" class="cat-form" enctype="multipart/form-data">
            // <h2>Shelter the cat</h2>
            // <img src="/content/images/${cat.image}" alt="${cat.name}hello">
            // <button type="submit">SHELTER THE CAT</button>
            // </form>`
            // let modifiedData = data.toString().replace('{{catShelter}}', catShelterPlaceholder)
            // res.write(modifiedData)
            let catShelterPlaceholder = `
            <form action="/cats-find-new-home/${catID}" method="POST" class="cat-form" enctype="multipart/form-data">
            <h2>Shelter the cat</h2>
            <img src="/content/images/${cat.image}" alt="${cat.name}">
            <label for="name">Name</label>
            <input type="text" id="name" value="${cat.name}" disabled>
            <label for="description">Description</label>
            <textarea id="description" disabled>${cat.description}</textarea>
            <label for="group">Breed</label>
            <select id="group" disabled>
                <option selected value="Fluffy Cat">${cat.breed}</option>
            </select>
            <button type="submit">SHELTER THE CAT</button>
            </form>`
            let modifiedData = data.toString().replace('{{catShelter}}', catShelterPlaceholder)
            res.write(modifiedData)
        })

        index.on('end', () => {
            res.end()
        })

        index.on('error', err => {
            console.log(err)
        })
    } else if(pathname.includes('/cats-edit') && req.method === 'POST') {
        let form = formidable({uploadDir: "./content/images"})
        form.parse(req, (err, fields, files) => {
            if(err) throw err
            const catID = pathname.split('/').pop()

            const catIndex = cats.findIndex(cat => cat.id == catID)
            if(catIndex === null)  throw 'id not found'
            if(files.upload.size !== 0) {
                let oldpath = files.upload.path;
                let newpath = path.join("./content/images" + files.upload.name)

                fs.rename(oldpath, newpath, (err) => {
                    if(err) throw err
                    console.log('files was uploaded sucessfully')
                })

                fs.readFile('./data/cats.json', 'utf8', (err, data) => {
                    let allCats = JSON.parse(data)
            
                    allCats[catIndex] = {id: Number(catID), ...fields, image: files.upload.name}
                    let json = JSON.stringify(allCats)
            
                    fs.writeFile('./data/cats.json', json, () => {
                        res.writeHead(302, {location: '/'})
                        res.end()
                    })
                })
            } else {
                fs.readFile('./data/cats.json', 'utf8', (err, data) => {
                    let allCats = JSON.parse(data)
            
                    allCats[catIndex] = {id: Number(catID), ...fields, image: allCats[catIndex].image}
                    let json = JSON.stringify(allCats)
            
                    fs.writeFile('./data/cats.json', json, () => {
                        res.writeHead(302, {location: '/'})
                        res.end()
                    })
                })
            }
        })
    } else if(pathname.includes('/cats-find-new-home') && req.method === 'POST') {
        const catID = pathname.split('/').pop()

        const catIndex = cats.findIndex(cat => cat.id == catID)
        
        let catsTemp = cats
        catsTemp.splice(catIndex, 1)
        fs.writeFile('./data/cats.json', JSON.stringify(catsTemp), () => {
            res.writeHead(302, {location: '/'})
            res.end()
        })

    } else if(pathname.includes('/search') && req.method === 'POST') {
        console.log(req)
        let form = formidable()
        form.parse(req, (err, fields) => {
            const { query } = fields

            let filepath = path.normalize(path.join(__dirname, '../views/home/index.html'))
            fs.readFile(filepath, (err, data) => {
                if(err) {
                    console.log(err)
                    res.writeHead(404, {
                        'Content-Type': 'text/plain'
                    })
                    res.write(404)
                    res.end()
                    return
                }

                fs.readFile('./data/cats.json', 'utf-8', (err, cats) => {
                let modifiedCats = JSON.parse(cats).filter(cat => cat.name.includes(query)).map(cat => `
                <li>
                    <img src="${path.join('./content/images/'+cat.image)}" alt="${cat.name}">
                    <h3>${cat.name}</h3>
                    <p><span>Breed: </span>${cat.breed}</p>
                    <p><span>Description: </span>${cat.description}</p>
                    <ul class="buttons">
                    <li class="btn edit"><a href="/cats-edit/${cat.id}">Change Info</a></li>
                    <li class="btn delete"><a href="/cats-find-new-home/${cat.id}">New Home</a></li>
                    </ul>
                </li>`)
                let modifiedData = data.toString().replace('{{cats}}', modifiedCats)

                res.writeHead(200, {
                    'Content-Type': 'text/html'
                })
                res.write(modifiedData)
                res.end()
                })
            })
        })

    } else {
        return true
    }
}