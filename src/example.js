const path = require("path")
const fs = require('fs');
const JSZip = require('jszip');
const marked = require('marked');
const glob = require("glob")

const toDocx = require('./toDocx')

const outputDir = path.resolve(__dirname, '../assets')
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
        // outputTo(filename, htmlStr, 'html')

        const pwd = path.resolve(__dirname, "../assets/")
        toDocx.generate(filePath, htmlStr, { pwd })
      }
    })
  })
})

const pwd = path.resolve(__dirname, "../assets/")
const html = fs.readFileSync("./assets/example.html",'utf8')
toDocx.generate('./dist/example.docx', html, { pwd })


function MD2Docx(options={}){
  function generate(input, output, {pwd,encoding="utf8"}={}){
    const filename = path.basename(input, path.extname(input))
    pwd = pwd ? pwd : path.dirname(output)

    const mdSource = fs.readFileSync(input, encoding)
    const htmlSource = marked.parse(mdSource)

    toDocx.generate('./dist/example.docx', htmlSource, { pwd })
  }

  return {
    generate
  }
}

const factory = (options) => new MD2Docx(options);
module.exports = module.exports.default = factory()
