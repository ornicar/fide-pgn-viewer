"use strict";

const fs = require("fs");
const webpack = require("webpack");
const dotenv = require("dotenv");

const ENV_PATH = "./config/.env";

// Read local .env file if exist.
const buildEnvironments = fs.existsSync(ENV_PATH)
  ? dotenv.parse(fs.readFileSync(ENV_PATH))
  : {};

module.exports = {
  plugins: [
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/),
    new webpack.DefinePlugin({
      buildEnvironments: JSON.stringify(buildEnvironments)
    })
  ]
};
