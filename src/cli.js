#!/usr/bin/env node

const pkg = require("../package.json");
const path = require("path")
const { Command } = require('commander');
const program = new Command();
const md2docx = require('./main');

program
  .name("md2docx")
  .description(pkg.description)
  .version(pkg.version, '-v, --version', `version`)
  .option('-o, --outputDir <string>', 'output path')
  .argument('<string>', 'Markdown File')
  .action((mdPath)=>{
    const opts = program.opts();
    let outputDir = opts.outputDir ? path.resolve(process.cwd(), opts.outputDir) : undefined
    md2docx.generate(path.resolve(process.cwd(),mdPath), outputDir)
  })

program.parse();
