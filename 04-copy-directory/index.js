const fs = require('fs');
const path = require('path');
const { mkdir, readdir } = fs.promises;

const mkDirOptions = {
  recursive: true,
  mode: 0777,
}

const readDirOptions = {
  encoding: 'utf8',
  withFileTypes: true
}

function copyDir(source, destination) {

  const sourceFolderPath = path.resolve(path.basename(__dirname), source);
  const destinationFolderPath = path.resolve(path.basename(__dirname), destination);

  fs.access(destinationFolderPath, err => {
    if (err) mkdir(destinationFolderPath, mkDirOptions);

    readdir(sourceFolderPath, readDirOptions)
      .then(files => {
        for (let file of files) {
          if (file.isFile()) {
            fs.copyFile( 
              path.resolve(sourceFolderPath, file.name), 
              path.resolve(destinationFolderPath, file.name), 
              err => { if (err) console.log(err)}
            )
          } else {
            const newSourceFolderPath = path.resolve(path.basename(__dirname), source, file.name)
            const newDestinationFolderPath = path.resolve(path.basename(__dirname), destination, file.name)
            copyDir(newSourceFolderPath, newDestinationFolderPath)
          }
        }
      })
    .catch( err => console.log(err))
  })
}

copyDir('files', 'files-copy')