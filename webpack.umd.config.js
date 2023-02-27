const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.umd.json",
          },
        }],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ ".tsx", ".ts", ".js" ],
  },
  output: {
    filename: "index.js",
    library: "WFCModule",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "umd-dist"),
  },
};
