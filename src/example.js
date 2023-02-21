const path = require("path")
const fs = require('fs');
const JSZip = require('jszip');
const internal = require('./internal');
const marked = require('marked');
const glob = require("glob")

// https://stackoverflow.com/questions/12752622/require-file-as-string
require.extensions['.tpl'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};
require.extensions['.html'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

const outputDir = path.resolve(__dirname, '../assets')
function outputTo(filename, data, type = 'text') {
  const types = { 'text': 'txt', 'html': 'html', 'json': 'json' }
  const extname = types[type]
  return fs.writeFileSync(path.resolve(outputDir, `${filename}.${extname}`), template(filename, data, type))
}

function template(filename, data, type='text'){
    if(type === 'html'){
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Document</title>
</head>
<body>
  <div>
    ${data}
  </div>
</body>
</html>`
    }
    if(type === 'json'){
        return `{
    "title": "${filename}",
    "content": "${data.replace(/\"/ig,'\\"')}"
}`
    }

    return data
}

function asBlob(html, options) {
  var zip;
  zip = new JSZip();
  internal.addFiles(zip, html, options);
  return internal.generateDocument(zip);
}

const pwd = path.resolve(__dirname, "../assets/")

glob('assets/*.md', function (err, files) {
  files.forEach(file => {
    fs.readFile(file, 'utf8', (err, markContent) => {
      if (err) {
        throw err
      } else {
        const _path = path.resolve(__dirname, '../', file)
        const filename = path.basename(_path, path.extname(_path))
        let htmlStr = marked.parse(markContent)
        const filePath = `./dist/${filename}.docx`;
        outputTo(filename, htmlStr, 'html')

        fs.writeFile(filePath, asBlob(template(filename, htmlStr, 'text'), { pwd }), (error) => {
          if (error) {
            console.log('Docx file creation failed');
            return;
          }
          console.log('Docx file created successfully');
        });
      }
    })
  })
})

// const html = require("../assets/example.html");

// fs.writeFile(filePath, asBlob(html, { pwd }), (error) => {
//   if (error) {
//     console.log('Docx file creation failed');
//     return;
//   }
//   console.log('Docx file created successfully');
// });

