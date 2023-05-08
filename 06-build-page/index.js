const fs = require('fs');
const path = require('path');
const { isGeneratorFunction } = require('util/types');
const { mkdir, readdir, rm, access} = fs.promises;

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

async function giveMeHtmlComponent(template, componentName, replaceablePart) {
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

async function giveMeHtmlTemplate() {

  const htmlTemplatePath = path.resolve(rootFolder, 'template.html');
  let htmlTemplate = '';
  const htmlTemplateStream = fs.createReadStream(htmlTemplatePath, 'utf-8');
  htmlTemplateStream.on('data', chunk => {
    htmlTemplate += chunk;
  })
  htmlTemplateStream.on('end', () => prepareAndRenderLayout(htmlTemplate));
  htmlTemplateStream.on('error', err => console.log(err)); 
}

async function prepareAndRenderLayout(template) {
  
  let updatedTemplate = template;
  const htmlList = [];  
  await readdir(htmlComponentsFolder, readDirOptions)
  .then(async(files) => {
    for (let file of files) {
      if (file.isFile()) {
        htmlList.push(file.name.substring(0, file.name.indexOf('.')))
      }
    }
    for( let file of htmlList) {
      updatedTemplate = await giveMeHtmlComponent(updatedTemplate, `${file}.html`, `{{${file}}}`)
    }
    fs.access(projectDistFolder, err => {
      if (err) mkdir(projectDistFolder);
      fs.writeFile(
        path.resolve(projectDistFolder, 'index.html'),
        updatedTemplate,
        err => {if (err) console.log(err)}
      )
    })
  })
  .catch( err => console.log(err))
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
                chunk + '\n',
                (err) => {if (err) console.log(err)}
              )
            })
          }
        }
      })
      .catch(err => console.log(err))
  })
  
}

async function doesExist(path) {
  try{
    await access(path, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  }
  catch (err) {
    if (err) return false;
  }
}
async function copyDir(source, destination) {

  const dirExistence = await doesExist(destination)

  if (dirExistence) {
    await rm(destination, {recursive: true})
  }
    await mkdir(destination, mkDirOptions);
    await readdir(source, readDirOptions)
      .then(async(files) => {
        for (let file of files) {
          if (file.isFile()) {
            fs.copyFile( 
              path.resolve(source, file.name), 
              path.resolve(destination, file.name), 
              err => { if (err) console.log(err)}
            )
          } else {
            const newSource = path.resolve(source, file.name)
            const newDestination = path.resolve(destination, file.name)
            copyDir(newSource, newDestination)
          }
        }
      })
    .catch( err => console.log(err))

}

giveMeStyleBundle(stylesFolder, projectDistFolder)
giveMeHtmlTemplate()
copyDir(assetsFolder, copiedAssetsFolder)
