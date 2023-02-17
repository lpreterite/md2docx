const plugins = []
if (process.env.NODE_ENV === 'test') {
  plugins.push(["istanbul"])
}

module.exports = {
  "exclude": "node_modules/**",
  
  "presets": [
    [
      "@babel/preset-env",
      {
        "modules": false,
        "corejs":2,
        "useBuiltIns": "entry"
      }
    ]
  ],
  
  plugins
}
