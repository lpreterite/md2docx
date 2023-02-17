const path = require("path")
const fs = require('fs');
const JSZip = require('jszip');
const internal = require('./internal');

// https://stackoverflow.com/questions/12752622/require-file-as-string
require.extensions['.tpl'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};
require.extensions['.html'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

function asBlob(html, options) {
  var zip;
  zip = new JSZip();
  internal.addFiles(zip, html, options);
  return internal.generateDocument(zip);
}

const pwd = path.resolve(__dirname, "../assets/")
const filePath = './dist/example.docx';
const html = require("../assets/example.html");

fs.writeFile(filePath, asBlob(html, { pwd }), (error) => {
  if (error) {
    console.log('Docx file creation failed');
    return;
  }
  console.log('Docx file created successfully');
});

