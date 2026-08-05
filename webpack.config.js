const path = require('path');
const nodeExternals = require('webpack-node-externals');
const Dotenv = require('dotenv-webpack');

module.exports = (env) => {
  return {
    target: 'node',
    mode: env.NODE_ENV || 'development',
    entry: './src/server.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    externals: [nodeExternals()],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
    plugins: [
      new Dotenv({
        path: '.env',
        systemvars: true,
        allowEmptyValues: true,
        ignoreStub: true,
      }),
    ],
  };
};
