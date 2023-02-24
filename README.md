# md2docx


[![npm version](https://img.shields.io/npm/v/@packy-tang/md2docx.svg)](https://www.npmjs.com/package/@packy-tang/md2docx)
![](https://img.shields.io/node/v/@packy-tang/md2docx)
[![NPM downloads](http://img.shields.io/npm/dm/@packy-tang/md2docx.svg)](https://www.npmjs.com/package/@packy-tang/md2docx)

> Markdown to docx command tool

## Features

将Markdown格式文档转换为Word文档内容。转换过程是 `md-> html -> mhtm -> docx`。参考 [evidenceprime/html-docx-js](https://github.com/evidenceprime/html-docx-js) 思路进行设计。

## 安装（Install）

```sh
$ npm i -g @packy-tang/md2docx
```

## 使用（How to Use）

### 命令行

```sh
$ md2docx -h
Usage: md2docx [options] <string>

Markdown to docx command tool

Arguments:
  string                    Markdown File

Options:
  -v, --version             version
  -o, --outputDir <string>  output path
  -h, --help                display help for command
```

## 使用例子

```sh
$ md2docx test.md
# 在test.md同目录下生产产出 test.docx 文件

$ mkdir dist/
$ md2docx -o dist/ test.md
# 指定 dist/ 作为产出目录，test.docx 文件会在dist目录中
```

## 开发（Develop）

```sh
# 更新nodejs版本
$ npm run nvm

# 更改你的代码，运行下面代码进行转换测试
$ node src/example.js

# 运行下面代码进行命令行测试
$ npm link
$ md2docx test.md
```

## License

Copyright (c) packy-tang [<lpreterite@126.com>](https://github.com/lpreterite)

根据[MIT协议](./LICENSE)的开源软件.
