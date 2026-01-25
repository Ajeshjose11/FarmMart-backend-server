const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/products')
    },

    filename: (req, file, cb) => {
        const date = new Date(). toDateString()
        cb(null, `IMG-${file.originalname}-${date}`)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
        cb(null, true)
    }
    else {
        cb(null, false)
    }
}

// const multerConfig = multer({
//     storage,
//     fileFilter
// })

const upload = multer({ storage , fileFilter });

module.exports = upload
