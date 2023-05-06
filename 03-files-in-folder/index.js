const fs = require('fs');
const path = require('path');
const { readdir } = fs.promises;

const options = {
   encoding: 'utf8',
   withFileTypes: true
}

function formFileStatistic(pathToFile, _file) {

  let name = path.basename(_file.name).substring(0, path.basename(_file.name).indexOf('.'));
  if (name === '') name = '.gitkeep';
  const ext = path.extname(_file.name).slice(1);

  fs.stat(path.join(pathToFile, _file.name), (err, stats) => {
    if (err) {
      console.log(err);
    }
    else {
      const size = stats.size + 'kb'
      console.log(`${name} - ${ext} - ${size}`)
    }
  })
}

function readDirectory(folder) {

  const folderpath = path.resolve(path.basename(__dirname), folder);

  readdir(folderpath, options)
  .then(files => {
    for (let file of files) {
      if (file.isFile()) {
        formFileStatistic(folderpath, file);
      } else {
        const newFolderPath = path.resolve(path.basename(__dirname), folder, file.name)
        readDirectory(newFolderPath)
      }
    }
  })
  .catch( err => console.log(err))
}

readDirectory('secret-folder')
