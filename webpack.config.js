const path = require('path');
const nodeExternals = require('webpack-node-externals');
const Dotenv = require('dotenv-webpack');

module.exports = (env) => {
  const envPath = (() => {
    switch (env.NODE_ENV) {
      case 'production':
        return './env/.env.prod';
      case 'test':
        return './env/.env.test';
      default:
        return './env/.env.dev';
    }
  })();

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
        path: envPath,
        systemvars: true,
        safe: true,
      }),
    ],
  };
};
