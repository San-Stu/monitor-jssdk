const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const packageinfo = require('./package.json')

module.exports = {
  mode: 'production',
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `monitor-jssdk-${packageinfo.version}.js`,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false, // 不将注释提取到单独的文件中
      })
    ]
  }
}
