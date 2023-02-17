const sizeOf = require("image-size")
const mineType = require("mime-types");
const crypto = require("crypto");
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path")
require.extensions['.tpl'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};
const tpl = require("art-template");

var mhtDocumentTemplate, mhtPartTemplate;

mhtDocumentTemplate = tpl.compile(require("./templates/mht_document.tpl"));

mhtPartTemplate = tpl.compile(require("./templates/mht_part.tpl"));

module.exports = {
  getMHTdocument: function (htmlSource, options) {
    var imageContentParts, ref;
    (ref = this._prepareImageParts(htmlSource, options)),
      (htmlSource = ref.htmlSource),
      (imageContentParts = ref.imageContentParts);
    htmlSource = htmlSource.replace(/\=/g, "=3D");
    return mhtDocumentTemplate({
      htmlSource: htmlSource,
      contentParts: imageContentParts.join("\n"),
    });
  },
  _prepareImageParts: function(htmlSource, options){
    const { pwd } = options
    const dom = new JSDOM(htmlSource)
    const doc = dom.window.document
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
      const filename = this.md5(base64Path)

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
      htmlSource: dom.serialize(),
      imageContentParts: imageContentParts,
    };
  },
  md5: function(somestring){
    return crypto.createHash('md5').update(somestring).digest('hex').toString();
  }
};
