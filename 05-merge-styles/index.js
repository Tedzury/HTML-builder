const fs = require('fs');
const path = require('path');
const { readdir } = fs.promises;

const readDirOptions = {
  encoding: 'utf8',
  withFileTypes: true
}

const _stylesFolder = path.resolve(path.basename(__dirname), 'styles');
const _bundleDestinationFolder = path.resolve(path.basename(__dirname), 'project-dist');

function giveMeStyleBundle(stylesFolder, bundleDestinationFolder) {
  fs.writeFile(
    path.resolve(bundleDestinationFolder, 'bundle.css'),
    '',
    (err) => {if (err) console.log(err)}
  )

  readdir(stylesFolder, readDirOptions)
    .then( files => {
      for (let file of files) {
        if (path.extname(file.name) === '.css') {
          const readableStream = fs.createReadStream(path.resolve(stylesFolder, file.name))
          readableStream.on('data', chunk => {
            fs.appendFile(
              path.resolve(bundleDestinationFolder, 'bundle.css'),
              chunk,
              (err) => {if (err) console.log9(err)}
            )
          })
        }
      }
    })
    .catch(err => console.log(err))
}

giveMeStyleBundle(_stylesFolder, _bundleDestinationFolder)