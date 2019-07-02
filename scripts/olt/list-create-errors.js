const path = require('path');
const fs = require('fs');

function recFindByExt(base, ext, files, result) {
  files = files || fs.readdirSync(base);
  result = result || [];

  files.forEach(file => {
    var newbase = path.join(base, file);
    if (fs.statSync(newbase).isDirectory()) {
      if (!newbase.includes('node_modules')) {
        result = recFindByExt(newbase, ext, fs.readdirSync(newbase), result);
      }
    } else {
      if (file.substr(-1 * (ext.length + 1)) == '.' + ext) {
        result.push(newbase);
      }
    }
  });
  return result;
}

const base = process.cwd();
const fileList = recFindByExt(base, 'js');
let count = 0;
const errorRegex = /(?<=createError\()\s*`.*?(?=`)|(?<=createError\()\s*'.*?(?=')/gm;

let output = fileList.reduce((fullResult, fileUri, index) => {
  const data = fs.readFileSync(fileUri, 'utf8');
  const errorMessages = data.match(errorRegex) || [];
  const flattenedList = errorMessages.map(str =>
    str.replace(/\r?\n|\r/g, '').trim(),
  );
  let strRes = '';
  if (flattenedList.length > 0) {
    strRes = `### (${index}) File: ${fileUri.replace(base, '')}\n`;
    flattenedList.forEach((errorMessage, index2) => {
      strRes += `What? ****\n\`${errorMessage
        .replace('`', '')
        .replace("'", '')}\`\n=> \n\n`;
    });
    count += flattenedList.length;
    strRes += `> ----- Found: ${flattenedList.length} messages------\n\n`;
  }
  return (fullResult += strRes);
}, '');

output = `## Error Messages ${base}\n**Total: ${count}**\n\n` + output;
const outputFile = path.join(base, 'error-messages.md');
console.log('output', output);
fs.writeFileSync(outputFile, output);
console.log(`Found ${count} error messages`);
console.log(`Wrote to ${outputFile}`);
