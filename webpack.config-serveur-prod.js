
const path = require('path');

module.exports = {
    entry: ['./src/index.ts'],
    target: 'node',
    mode: 'production',
    node: {
        __dirname: false,
        __filename: false,
    },
    output: {
        path: path.join(__dirname, './dist'),
        filename: 'server.min.js'
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                loader: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: [".js", ".ts"]
    }
};


