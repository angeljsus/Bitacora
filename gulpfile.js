const { watch, series, src, dest } = require('gulp');
const concat = require('gulp-concat');
const stylus = require('gulp-stylus');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const fs = require('fs');


let devDir = './develop/';
let builDir = './build/';
createdir(devDir);
createdir(builDir);
createdir(devDir + 'styles');
createdir(devDir + 'javascript');
createdir(builDir + 'css');
createdir(builDir + 'js');
// create dirs



function buildStyles(){
  return src(devDir + 'styles/*.styl')
    .pipe(stylus())
    .pipe(concat('index.css'))
    .pipe(dest(builDir + 'css'));
}

function buildScript(){
  return src(devDir + 'javascript/*.js')
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(concat('index.js'))
    // .pipe(uglify())
    .pipe(dest(builDir + 'js'));
}

function copyIndex(){
  return src(devDir + '*.html')
    .pipe(dest(builDir))
}

function createdir(ruta){
  let fileExists = fs.existsSync(ruta);
  if (!fileExists){
    fs.mkdirSync(ruta);
  }
}

function watchaMan(){
  watch(devDir + 'styles/*.styl', buildStyles);  
  watch(devDir + 'javascript/*.js', buildScript);  
  watch(devDir + '*.html', copyIndex);  

}

exports.default = series(buildStyles, buildScript, copyIndex, watchaMan);

