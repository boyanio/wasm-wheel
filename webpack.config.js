const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const dist = path.resolve('./dist');
const langs = [
  'assemblyscript',
  'c',
  'csharp',
  'go',
  'java',
  'kotlin',
  'php',
  'python',
  'rust',
];

const isProduction = process.argv.some((x) => x === '--mode=production');
const hash = isProduction ? '.[contenthash]' : '';

module.exports = {
  mode: 'development',
  entry: {
    main: './src/main.js',
    ...langs.reduce(
      (result, lang) =>
        Object.assign(result, {
          [`wasm/wheel-part-${lang}`]: {
            import: `./src/langs/${lang}/wasm-loader.js`,
            dependOn: ['main'],
          },
        }),
      {}
    ),
  },
  target: 'web',
  output: {
    path: dist,
    filename: `[name]${hash}.js`,
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.m?js$/,
        resourceQuery: { not: [/(raw|wasm)/] },
      },
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      },
      {
        resourceQuery: /wasm/,
        type: 'asset/resource',
        generator: {
          filename: 'wasm/[name][ext]',
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/index.html'),
      favicon: path.resolve(__dirname, './src/favicon.ico'),
    }),
    new CopyPlugin({
      patterns: [{ from: './src/img', to: path.resolve(dist, 'img') }],
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^(path|ws|crypto|fs|os|util|node-fetch)$/,
    }),
    // needed by @wasmer/wasi
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  externals: {
    // needed by @wasmer/wasi
    'wasmer_wasi_js_bg.wasm': true,
  },
  resolve: {
    fallback: {
      // needed by @wasmer/wasi
      buffer: require.resolve('buffer/'),
    },
  },
};
