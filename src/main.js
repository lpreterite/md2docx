const path = require("path")
const fs = require('fs')
const marked = require('marked')
const toDocx = require('./toDocx')

function MD2Docx(options={}){
  function getOutputDirPath(outputPath, defaultPath){
    // console.log(outputPath)
    let stats;
    try{
      stats = fs.statSync(outputPath)
    }catch(e){}
    if(!stats) return defaultPath
    return stats.isDirectory() ? outputPath : path.dirname(outputPath)
  }

  function generate(input, output, {pwd,encoding="utf8"}={}){
    const filename = path.basename(input, path.extname(input))
    const outputDir = getOutputDirPath(output,path.dirname(input))
    pwd = pwd ? pwd : path.dirname(input)
    output = path.resolve(outputDir, `${filename}.docx`)

    // console.log("MD2Docx: %s | %s | %s", input,output,outputDir)

    const mdSource = fs.readFileSync(input, encoding)
    const htmlSource = marked.parse(mdSource)

    toDocx.generate(output, htmlSource, { pwd })
  }

  return {
    generate
  }
}

const factory = (options) => new MD2Docx(options);
module.exports = module.exports.default = factory()
