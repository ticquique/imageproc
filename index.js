const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const src = path.resolve('./src');
const dist = path.resolve('./dist');
const sizes = [300, 500];

const imageFilter = (file, cb) => {
    // accept image only
    if (!file.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb('Only image files are allowed! ');
    } else {
        return cb(null, file);
    }
};

const imageProcess = (size, file, src, dest, cb) => {
    const extension = path.extname(file);
    const pathdest = path.join(dest, path.relative(src, file)).replace(extension, size + '.png');
    sharp.cache(false);
    sharp(file)
        .resize(size, null, {
            kernel: sharp.kernel.lanczos3
        })
        .embed()
        .toFile(pathdest)
        .then((data) => {
            fs.copyFile(file, path.join(dest, path.relative(src, file)), (err) => {
                if (err) cb(err);
                else {
                    cb(null, data);
                }
            });
        })
        .catch((err) => {
            cb(err);
        });
}

const loop = (sizes, dir, dist, done) => {
    fs.readdir(dir, function(err, list) {
        if (err) {
            return done(err);
        }

        let i = 0;
        (function next() {
            let file = list[i++];
            if (!file) {
                console.log('-------------------------------------------------------------');
                console.log('finished.');
                console.log('-------------------------------------------------------------');
                return;
            } else {
                file = path.join(dir, file);
                fs.stat(file, (err, stat) => {
                    if (stat && stat.isDirectory()) {
                        loop(file, (err) => {
                            next();
                        });
                    } else {
                        imageFilter(file, (err, name) => {
                            if (err) {
                                console.log(err + file);
                                next();
                            } else {
                                sizes.forEach(size => {
                                    imageProcess(size, name, dir, dist, (err, data) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log(data);
                                        }
                                        next();
                                    })
                                })

                            }
                        });
                    }
                })
            }


        })();
    })
}

console.log('-------------------------------------------------------------');
console.log('processing...');
console.log('-------------------------------------------------------------');

loop(sizes, src, dist, function(error) {
    if (error) {
        throw error;
    }
});