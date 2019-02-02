////////////////////////////////////////////////////////////////////////////////
// WEBPACK CONFIGURATION
////////////////////////////////////////////////////////////////////////////////

const path = require("path"),
  webpack = require("webpack"),
  CleanWebpackPlugin = require("clean-webpack-plugin"),
  TerserPlugin = require('terser-webpack-plugin'),
  MiniCssExtractPlugin = require("mini-css-extract-plugin"),
  OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin"),
  ImageminPlugin = require("imagemin-webpack-plugin").default,
  SVGSpriteLoaderPlugin = require("svg-sprite-loader/plugin"),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  BrowserSyncPlugin = require("browser-sync-webpack-plugin"),
  // NodemonPlugin = require( 'nodemon-webpack-plugin' ), // Not needed?
  FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin")

const DEV = process.env.NODE_ENV === "development"

module.exports = {

  ////////////////////////////////////////////////////////////////////////////
  // MAIN CONFIG

  mode: DEV ? "development" : "production",
  context: path.resolve(__dirname, "src"),
  entry: ["./js/index.js", "./css/main.scss"],

  output: {
    path: path.resolve(__dirname, "dist/js"),
    // filename: "[name].[hash:8].js"
    filename: "[name].js",
    // publicPath: '/'
  },

  devtool: 'eval-source-map',

  ////////////////////////////////////////////////////////////////////////////
  // LOADERS

  module: {
    rules: [

      // Scripts
      {
        test: /\.js$/,
        include: /src/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      },

      // Styles
      {
        test: /\.(css|sass|scss)$/,
        use: [{
          // loader: MiniCssExtractPlugin.loader
          // loader: DEV ? 'style-loader' : MiniCssExtractPlugin.loader
          loader: 'style-loader'
        }, {
          loader: "css-loader",
          options: {
            sourceMap: true
          }
        }, {
          loader: "postcss-loader",
          options: {
            sourceMap: true
          }
        }, {
          loader: "sass-loader", options: {
            sourceMap: true
          }
        }]
      },

      // SVG sprites
      {
        test: /img\/sprites\/.*\.svg$/,
        loader: "svg-sprite-loader",
        options: {
          extract: true,
          spriteFilename: "../img/sprite.symbol.svg.twig",
          runtimeCompat: true
        }
      }
    ]
  },

  ////////////////////////////////////////////////////////////////////////////
  // PLUGINS

  plugins: [

    // CLEAN

    // Wipe out the /dist folder
    new CleanWebpackPlugin(["dist/*"]),

    // CSS

    // Extract css into dedicated file
    new MiniCssExtractPlugin({
      // filename: "../css/[name].[hash:8].css"
      filename: "../css/[name].css",
      // filename: DEV ? '../css/[name].css' : '../css/[name].[hash:8].css',
      // chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
      sourceMap: true
    }),

    // Enable the css minification plugin
    new OptimizeCSSAssetsPlugin({}),

    // COPY

    // Copy static files
    new CopyWebpackPlugin(
      [
        { from: "img/favicon/*.*", to: __dirname + "/dist" },
        { from: "img/video/*.*", to: __dirname + "/dist" },
        { from: "img/*.*", to: __dirname + "/dist" }
      ],
      {
        // debug: 'info'
      }
    ),

    // Image optimization
    new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i }),

    // SVG sprite generation
    new SVGSpriteLoaderPlugin({
      plainSprite: true
    }),

    // Friendly webpack errors
    new FriendlyErrorsPlugin({
      clearConsole: false
    }),

    // DEV SERVER PLUGINS

    // new webpack.HotModuleReplacementPlugin() // Seems buggy: https://github.com/webpack/webpack/issues/1583

    // BROWSERSYNC
    new BrowserSyncPlugin(
      {
        // notify: false,
        host: 'localhost',
        port: 3000,
        // logLevel: 'silent',

        files: [
          // '{lib,templates}/**/*.php', '*.php',
          "*.css",
          "**/*.php",
          "**/*.html",
          "**/*.twig",
          // dest + '/**',
          "!**/*.map",
          "!vendor",
          "!node_modules"
        ],

        proxy: "localhost:8080", // The dev-server port
        open: false, // Don't auto-open browsers on startup
        browser: ["google chrome", "firefox"]
      },

      // plugin options
      {
        // prevent BrowserSync from reloading the page
        // and let Webpack Dev Server take care of this
        reload: false,
        injectCss: true,
      }
    )

    // NODEMON
    // Not needed? Seems working without this...
    // Nodemon: "hot reload this Webpack config file too"
    // See: https://survivejs.com/webpack/developing/webpack-dev-server/#making-it-faster-to-develop-configuration
    // new NodemonPlugin()
  ],

  ////////////////////////////////////////////////////////////////////////////
  // OPTIMIZATION

  optimization: {

    minimizer: [

      // JS MIN
      // Enable the js minification plugin

      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        terserOptions: {
          ecma: 6,
          compress: true,
          output: {
            comments: false,
            beautify: false
          }
        }
      }),

      // CSS MIN
      // Enable the css minification plugin

      new OptimizeCSSAssetsPlugin({})
    ]
  },

  stats: {
    colors: true,
  },

  devtool: 'source-map',

  ////////////////////////////////////////////////////////////////////////////
  // DEV SERVER

  // devServer: {
  //   // Display only errors to reduce the amount of output.
  //   // stats: "errors-only",

  //   // Parse host and port from env to allow customization.
  //   //
  //   // If you use Docker, Vagrant or Cloud9, set
  //   // host: options.host || "0.0.0.0",
  //   //
  //   // 0.0.0.0 is available to all network devices
  //   // unlike default `localhost`.
  //   // host: process.env.HOST, // Defaults to `localhost`
  //   hot: true,
  //   host: "0.0.0.0",
  //   port: 3000, // Defaults to 8080
  //   // proxy: {
  //   //   '/': 'http://localhost:8000' // The Docker wp port
  //   // },
  //   open: false, // Open the page in browser
  //   overlay: true, // Overlay for capturing compilation related warnings and errors
  //   // contentBase: "index.php"
  // }
}
