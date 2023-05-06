const fs = require('fs');
const path = require('path');
const { stdin, stdout } = process;

fs.writeFile(
  path.join(__dirname, 'textnotes.txt'),
  '',
  (err) => {
    if (err) throw err;
  }
  )
  
stdout.write('Hello! Tell me something! ');
  
stdin.on('data', data => {

  if (data.toString().trim() == 'exit') process.exit(0);

  fs.appendFile(
    path.join(__dirname, 'textnotes.txt'),
    data,
    (err) => {
      if (err) throw err;
    }
    )
  })

process.on('SIGINT', () => {process.exit(0)});
process.on('exit', () => stdout.write('So sad, that you are going away! Bye! :('));
    