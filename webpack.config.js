const path = require("path");
const webpack = require("webpack");
const HappyPack = require("happypack");

const isProduction = () => process.env.NODE_ENV === "production";

let plugins = [
  new HappyPack({
    id: "jsx",
    threads: 4,
    loaders: [
      {
        loader: "babel-loader",
        query: {
          babelrc: false,
          presets: [["env", { modules: false }], "stage-0", "react"],
          plugins: ["react-hot-loader/babel"]
        }
      }
    ]
  }),
  new HappyPack({
    id: "styles",
    threads: 2,
    loaders: [
      { loader: "style-loader" },
      { loader: "css-loader" }
    ]
  })
];

if (isProduction() === "yeah") {
  plugins = [
    ...plugins,
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: { warnings: false, screw_ie8: false }
    })
  ];
}

module.exports = {
  devtool: "#cheap-module-source-map",

  performance: {
    hints: isProduction() ? "warning" : false
  },

  entry: [
    path.join(__dirname, "src/sidebar/index.jsx")
  ],

  output: {
    path: path.join(__dirname, "/dist/"),
    filename: "sidebar.js",
    publicPath: "/"
  },

  plugins,

  resolve: {
    modules: [path.resolve("./src"), path.resolve("./node_modules")],
    extensions: [".js", ".jsx", ".css", ".scss"]
  },

  resolveLoader: {
    modules: ['node_modules', `${process.cwd()}/node_modules`],
  },

  module: {
    rules: [
      {
        test: /\.jsx|\.js$/,
        loader: "happypack/loader?id=jsx",
        exclude: /node_modules/
      },
      // styles
      {
        test: /\.(css|scss)$/,
        loader: "happypack/loader?id=styles"
      },
      // images & other files
      {
        test: /\.jpe?g$|\.gif$|\.png|\.woff$|\.ttf$|\.wav$|\.mp3$/,
        loader: "file-loader"
      }
    ]
  }
};
