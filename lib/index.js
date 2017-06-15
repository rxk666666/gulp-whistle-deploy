const through = require('through2');
const is = require('is-type');
const path = require('path');
const formData = require('form-data');
const fs = require('fs');
const gutil = require('gulp-util');
const pluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-whistle-deploy';

function whistleDeploy(options){
    if(is.undefined(options)){
        throw new pluginError(PLUGIN_NAME, `needs an argument`);
        return;
    }
    if(!is.object(options)){
        throw new pluginError(PLUGIN_NAME, `options must be an Object`);
        return;
    }

    return through.obj(function(file, enc, cb){
        if(!file.isDirectory()){
            let dir = path.join(options.dir, path.dirname(file.relative));
            let form = new formData();
            form.append('file', fs.createReadStream(file.path));
            form.submit({
                host: options.host,
                port: options.port,
                path: '/plugin.deploy/upload?dir=' + dir
            }, (err, res) => {
                if(err){
                    gutil.log(gutil.colors.red('upload error'), file.path);
                }else{
                    let body = '';
                    res.on('data', (chunk) => {
                        body += chunk;
                    });
                    res.on('end', () => {
                        let response = JSON.parse(body);
                        if(response.code == 0){
                            gutil.log(gutil.colors.green('upload success'), file.path);
                        }else{
                            gutil.log(gutil.colors.green('upload server error'), file.path);
                        }
                    });
                }
            });
        }
        this.push(file);
        cb(null);
    });
}

module.exports = whistleDeploy