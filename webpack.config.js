var webpack = require('webpack');
module.exports = {
    entry: {
        project: './src/front/project.ts',
        couplings: './src/front/couplings.ts'
    },
    output: {
        path: __dirname + "/compiled/public/js",
        filename: '[name].js'
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
    },
    module: {
        loaders: [
            {test: /\.ts$/, loader: 'ts-loader'}
        ]
    }
}