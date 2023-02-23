const fs = require("fs")
const path = require("path")
const JSZip = require("jszip")
const mineType = require("mime-types")
const crypto = require("crypto")
const { Window } = require("happy-dom")
const sizeOf = require("image-size")
const { bootstrapDocumentTemplate, mhtDocumentTemplate, mhtPartTemplate } = require("./XMLTemplates.js")

const md5 = str => crypto.createHash('md5').update(str).digest('hex').toString();

const getFile = function (filename) {
  return fs.readFileSync(filename, 'utf8');
};

const __documentOptionsDefault = {
  margins: {
    top: 1440,
    right: 1440,
    bottom: 1440,
    left: 1440,
    header: 720,
    footer: 720,
    gutter: 0,
  },
  width: 12240,
  height: 15840,
  orient: "portrait",
}

function toDocx(options={}){
  const _pwd = options.pwd
  const _documentOptions = options.documentOptions || __documentOptionsDefault

  function generateDocx(ouputPath, mhtml, documentOptions=_documentOptions){
    documentOptions = {
      ...documentOptions,
      margins: { ...__documentOptionsDefault.margins, ...documentOptions.margins }
    }

    const _zip = new JSZip()
    _zip.file(
      "[Content_Types].xml",
      fs.readFileSync(__dirname + "/assets/content_types.xml")
    );
    _zip
      .folder("_rels")
      .file(".rels", fs.readFileSync(__dirname + "/assets/rels.xml"));
    _zip
      .folder("word")
      .file("document.xml", bootstrapDocumentTemplate(documentOptions))
      .file("afchunk.mht", mhtml)
      .folder("_rels")
      .file(
        "document.xml.rels",
        fs.readFileSync(__dirname + "/assets/document.xml.rels")
      );
    const buffer = Buffer.from(new Uint8Array(_zip.generate({
      type: "arraybuffer",
    })))
    fs.writeFile(ouputPath, buffer, (error) => {
      if (error) {
        console.log('Docx file creation failed');
        return;
      }
      console.log('Docx file created successfully');
    })
  }

  function getMHTDocImageParts(htmlSource, pwd=_pwd){
    const win = new Window()
    const doc = win.document
    doc.body.innerHTML = htmlSource
    const imgs = Array.from(doc.querySelectorAll('img'))
    const base64RegExp = /data:(\w+\/\w+);(\w+),(.*)/

    //提取图片信息，并替换原html的img地址
    const imgInfo = imgs.map(el=>{
      let contentType,
          contentEncoding,
          encodedContent,
          contentLocation;
      const isBase64 = base64RegExp.test(el.src)
      let base64Path;
      const originPath = el.src

      if(isBase64){
        base64Path = el.src
        const match = el.src.match(base64RegExp)
        // console.log(match)
        contentType = match[1]
        contentEncoding = match[2]
        encodedContent = match[3]
      }else{
        const filePath = path.resolve(pwd, el.src)
        contentType = mineType.lookup(filePath)
        contentEncoding = "base64"
        encodedContent = fs.readFileSync(filePath, {encoding: 'base64'})
        base64Path = `data:${contentType};base64,${encodedContent}`
        // el.src = base64Path
      }
      // console.log(base64Path.substring(0, 20))
      const extension = contentType.split("/")[1];
      const filename = md5(base64Path)

      const originSize = sizeOf(Buffer.from(encodedContent,'base64'))
      const ratio = originSize.height/originSize.width
      const maxWidth = 680
      const width = Math.min(originSize.width, maxWidth)
      const height = ratio * width

      // update Dom
      el.src = contentLocation =`file:///C:/fake/images/${filename}.${extension}`
      el.width = width
      el.height = height

      return {
        originPath,
        originSize,
        base64Path,
        contentLocation,
        contentType,contentEncoding,encodedContent
      }
    })

    //生成MHTML图像信息
    const imageContentParts = imgInfo.map(({
      contentLocation,contentType,contentEncoding,encodedContent
    })=>mhtPartTemplate({
      contentType: contentType,
      contentEncoding: contentEncoding,
      contentLocation: contentLocation,
      encodedContent: encodedContent,
    }))

    return {
      htmlSource: doc.documentElement.outerHTML,
      imageContentParts: imageContentParts,
    };
  }
  function getMHTDoc(htmlSource, imgSource) {
    htmlSource = htmlSource.replace(/\=/g, "=3D");
    return mhtDocumentTemplate({
      htmlSource: htmlSource,
      contentParts: imgSource.join("\n"),
    });
  }

  function generate(ouputPath, html, options){
    const { pwd=_pwd, documentOptions=_documentOptions } = options
    let { htmlSource, imageContentParts } = getMHTDocImageParts(html, pwd)
    const mhtDoc = getMHTDoc(htmlSource, imageContentParts)
    return generateDocx(ouputPath, mhtDoc, documentOptions)
  }

  const ctx = {
    generate
  }
  Object.defineProperties(ctx, {
    pwd:{
      get:()=>_pwd,
      set:val=>_pwd=val
    }
  })
  return ctx
}

const factory = (options) => new toDocx(options);
module.exports = module.exports.default = factory()
