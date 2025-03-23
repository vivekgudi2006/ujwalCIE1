const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Gallery = require('../models/gallerymodel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ensureAuthenticated } = require('../config/auth');

// Make sure uploads directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    },
    fileFilter: fileFilter
});

router.get('/', (req, res) => {
    Gallery.find({}, (err, allcamp) => {
        if (err) console.log(err);
        else
            res.render('gallery', {
                product: allcamp,
                cat: ' Collections',
            });
    });
});

router.get('/category/:category', (req, res) => {
    var gal = req.params.category;
    if (gal === 'Paintings') {
        Gallery.find({
                category: 'Paintings',
            },
            (err, allcamp) => {
                if (err) console.log(err);
                else
                    res.render('gallery', {
                        product: allcamp,
                        cat: 'Paintings',
                    });
            }
        );
    } else if (gal === 'Sculptures') {
        Gallery.find({
                category: 'Sculptures',
            },
            (err, allcamp) => {
                if (err) console.log(err);
                else
                    res.render('gallery', {
                        product: allcamp,
                        cat: 'Sculptures',
                    });
            }
        );
    } else if (gal === 'Photographs') {
        Gallery.find({
                category: 'Photographs',
            },
            (err, allcamp) => {
                if (err) console.log(err);
                else
                    res.render('gallery', {
                        product: allcamp,
                        cat: 'Photographs',
                    });
            }
        );
    } else if (gal === 'Sketches') {
        Gallery.find({
                category: 'Sketches',
            },
            (err, allcamp) => {
                if (err) console.log(err);
                else
                    res.render('gallery', {
                        product: allcamp,
                        cat: 'Sketches',
                    });
            }
        );
    } else {
        Gallery.find({}, (err, allcamp) => {
            if (err) console.log(err);
            else
                res.render('gallery', {
                    product: allcamp,
                    cat: 'Collection',
                });
        });
    }
});

//route to insert product to gallery
router.get('/addProduct', ensureAuthenticated, (req, res) => {
    res.render('productCreation');
});

//route to add products
router.post('/addProduct', ensureAuthenticated, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.render('productCreation', {
            error_msg: 'Please upload an image',
            formData: req.body
        });
    }
    
    const temp = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        minbid: req.body.minbid,
        owner: req.body.owner || (req.user ? req.user.name : 'Unknown'),
        image: '/uploads/' + req.file.filename, // Store relative path
    };

    Gallery.create(temp, (err, result) => {
        if (err) {
            console.log(err);
            return res.render('productCreation', {
                error_msg: 'Error adding product: ' + err.message,
                formData: req.body
            });
        } else {
            req.flash('success_msg', 'Product added successfully');
            return res.redirect('/gallery');
        }
    });
});

//route to find a particular product
router.get('/:productId', (req, res) => {
    let ID = req.params.productId;
    Gallery.findById({ _id: ID }, (err, result) => {
        if (err) {
            console.log(err);
            res.json({ err: err });
        } else {
            // return res.send('The resultant product is:');
            res.render('viewProduct', { reqProduct: result });
        }
    });
});

//route to update a product
router.get('/update/:productId', ensureAuthenticated, (req, res) => {
    console.log('entered');
    const ID = req.params.productId;
    Gallery.findById({ _id: ID }, (err, product) => {
        if (err) {
            console.log(err);
        } else {
            res.render('edit-Product', { element: product });
        }
    });
});

//route to get updated product
router.post('/update/:productId', ensureAuthenticated, (req, res) => {
    let ID = req.params.productId;
    Gallery.updateOne({ _id: ID }, {
            $set: {
                name: req.body.name,
                description: req.body.description,
                minbid: req.body.minbid,
            },
        })
        .exec()
        .then((add) => {
            res.redirect('/gallery/' + ID);
        })
        .catch((notAdd) => {
            res.send('Error while updating');
        });
    console.log('Updated ');
});

router.get('/delete/:productId', ensureAuthenticated, (req, res) => {
    let ID = req.params.productId;
    Gallery.deleteOne({ _id: ID }, (err, deleted) => {
        if (err) {
            res.send(err);
        } else {
            console.log('deleted ', deleted);
            res.redirect('/gallery');
        }
    });
});

// Make sure to export the router
module.exports = router;