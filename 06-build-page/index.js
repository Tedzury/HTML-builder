const fs = require('fs');
const path = require('path');
const { mkdir, readdir } = fs.promises;

const rootFolder = path.basename(__dirname);
const htmlComponentsFolder = path.resolve(path.basename(__dirname), 'components');
const stylesFolder = path.resolve(rootFolder, 'styles');
const projectDistFolder = path.resolve(rootFolder, 'project-dist');
const assetsFolder = path.resolve(rootFolder, 'assets');
const copiedAssetsFolder = path.resolve(projectDistFolder, 'assets');

const readDirOptions = {
  encoding: 'utf8',
  withFileTypes: true
}
const mkDirOptions = {
  recursive: true,
  mode: 0777,
}

function giveMeHtmlComponent(template, componentName, replaceablePart) {
  return new Promise( resolve => {
    const _path = path.resolve(htmlComponentsFolder, componentName);
    let component = '';
    const stream = fs.createReadStream(_path, 'utf-8');
    stream.on('data', chunk => {
      component += chunk;
    })
    stream.on('end', () => resolve(template.replace(replaceablePart, component)));
    stream.on('error', err => console.log(err));
  })
}

function prepareHtmlLayout() {

  return new Promise((resolve) => {
      const htmlTemplatePath = path.resolve(rootFolder, 'template.html');
      let htmlTemplate = '';
      const htmlTemplateStream = fs.createReadStream(htmlTemplatePath, 'utf-8');
      htmlTemplateStream.on('data', chunk => {
        htmlTemplate += chunk;
      })
      htmlTemplateStream.on('end', () => resolve(htmlTemplate));
      htmlTemplateStream.on('error', err => console.log(err));
    })
    .then(updatedHtml => giveMeHtmlComponent(updatedHtml, 'header.html', '{{header}}'))
    .then(updatedHtml => giveMeHtmlComponent(updatedHtml, 'articles.html', '{{articles}}'))
    .then(updatedHtml => giveMeHtmlComponent(updatedHtml, 'footer.html', '{{footer}}'))
    .then( updatedHtml => {
      fs.access(projectDistFolder, err => {
        if (err) mkdir(projectDistFolder);
        fs.writeFile(
          path.resolve(projectDistFolder, 'index.html'),
          updatedHtml,
          err => {if (err) console.log(err)}
        )
      })
    })
    .catch(err => console.log(err))
}

function giveMeStyleBundle(_stylesFolder, bundleDestinationFolder) {
  fs.access(projectDistFolder, err => {
    if (err) mkdir(projectDistFolder);
    fs.writeFile(
      path.resolve(bundleDestinationFolder, 'style.css'),
      '',
      (err) => {if (err) console.log(err)}
    )
  
    readdir(_stylesFolder, readDirOptions)
      .then( files => {
        for (let file of files) {
          if (path.extname(file.name) === '.css') {
            const readableStream = fs.createReadStream(path.resolve(stylesFolder, file.name))
            readableStream.on('data', chunk => {
              fs.appendFile(
                path.resolve(bundleDestinationFolder, 'style.css'),
                chunk,
                (err) => {if (err) console.log(err)}
              )
            })
          }
        }
      })
      .catch(err => console.log(err))
  })
  
}
function copyDir(source, destination) {

  fs.access(destination, err => {
    if (err) mkdir(destination, mkDirOptions);

    readdir(source, readDirOptions)
      .then(files => {
        for (let file of files) {
          if (file.isFile()) {
            fs.copyFile( 
              path.resolve(source, file.name), 
              path.resolve(destination, file.name), 
              err => { if (err) console.log(err)}
            )
          } else {
            const newSource = path.resolve(path.basename(__dirname), source, file.name)
            const newDestination = path.resolve(path.basename(__dirname), destination, file.name)
            copyDir(newSource, newDestination)
          }
        }
      })
    .catch( err => console.log(err))
  })
}

prepareHtmlLayout()
giveMeStyleBundle(stylesFolder, projectDistFolder)
copyDir(assetsFolder, copiedAssetsFolder)
