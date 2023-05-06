const fs = require('fs');
const path = require('path');
const { stdout } = process;


// console.log(path.basename(__dirname))

const textfile = path.resolve(__dirname, 'text.txt');

const stream = fs.createReadStream( textfile, 'utf-8');
let data = '';
stream.on('data', chunk => data += chunk);
stream.on('end', () => stdout.write(data) )

