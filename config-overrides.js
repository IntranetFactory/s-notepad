const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function override(config, env) {
  if (!config.plugins) {
    config.plugins = [];
  }
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "node_modules/monaco-editor/min/vs/",
          to: "monaco-editor/vs/"
        },
      ],
    })
  );
  return config;
};