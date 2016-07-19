#ES6-React-boilerplate

>基于ES6的React工作流构建

这里主要介绍gulp+browserify的构建方式，同时提供webpack的配置文件；

##目录结构

```
├── build/                      //静态文件生产目录
│   ├── css/
│   └── js/
│       └──bundle.js            //所有js文件打包成bundle.js
│
├── public/                     //静态文件开发目录
│   ├── components/             //React组件目录
│   ├── image/
│   ├── less/
│   ├── lib/
│   │   ├──react-0.14.7.min.js
│   │   └──react-dom.js
│   │
│   └── App.js                  //React根文件
│
├── views/                      //模板文件目录
│   └── index.html
│
├── app.js                      //koa入口文件
├── gulpfile.js                 //gulp配置文件
├── package.json
└── README.md
```


##配置文件gulpfile.js


###web开发基础工作流搭建相关gulp插件

- **gulp-less**

less服务端编译

- **gulp-minify-css**

css文件压缩

- **gulp-autoprefixer**

根据设置浏览器版本自动处理css3样式中的浏览器前缀

- **gulp-uglify**

js文件压缩

- **gulp-concat**

文件合并

- **gulp-connect、gulp-livereload**

构建本地Web开发服务器，实现页面监听update自动刷新


- **gulp-if**

- **gulp-yargs**

获取接受参数，配合gulp-if实现开发/生产搭建选择


###ES6及JSX转码相关插件

- **browserify**

打包预编译js文件

- **babelify**

实现es6及jsx转码

- **vinyl-source-stream** 

将常规流转换为包含Stream的vinyl对象，并且重命名（这一步是在gulp中使用browserify的关键点）

- **vinyl-buffer** 

将vinyl对象内容中的Stream转换为Buffer（gulp不支持Stream）

关于stream和buffer的解释详见**[这篇博客](https://segmentfault.com/a/1190000003770541)**

- **dependify** 

使打包后的js文符合UMD规范，并可以指定不将一些外部依赖包打进包内(standalonify模块作用一致)

- **watchify** 

提高打包速度，检测文件改动并只update需要更新的文件（不用每次都重新打包）


###gulpfile.js完整代码

```
var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    less = require('gulp-less'),
    uglify = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    connect = require('gulp-connect'),
    browserify = require('browserify'),
    // browserify在打包后须要进行Stream转换才可和gulp配合，在这里需要使用vinyl-source-stream和vinyl-buffer这两个包。
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    // dependify插件使打包后的js文符合UMD规范
    dependify = require('dependify'),
    babelify = require('babelify'),
    watchify = require('watchify'),
    argv = require('yargs').argv;

function getLibName() {
    var libName = '.';
    if (argv.min) {
        libName = '.min.';
    }
    return libName;
}

var b = browserify({
        entries: 'public/App.js'
    })
    // 使打包后的js文件符合UMD规范并指定外部依赖包（不指定外部依赖会把react与react-dom也打包进来）
    .plugin(dependify, {
        name: 'diary',
        deps: {
            'react': 'React',
            'react-dom': 'ReactDOM'
        }
    })
    // 使用babel转换es6代码
    .transform(babelify, {
        presets: ['es2015', 'react'], // 分别是 转换ES6、转换JSX
        plugins: ['transform-es2015-classes', 'transform-es2015-modules-commonjs'] // es6 class 和 module插件
    });

function bundle() {
    return b.bundle() // 合并打包
        .pipe(source('bundle' + getLibName() + 'js')) // 将常规流转换为包含Stream的vinyl对象，并且重命名
        .pipe(buffer()) // 将vinyl对象内容中的Stream转换为Buffer
        .pipe(gulpif(argv.min, uglify()))
        .pipe(gulp.dest('build/js'))
        .pipe(livereload());
}

gulp.task('build-js', bundle);

// gulp.task('watch-js', function() {
//  b.plugin(watchify)
//      .on('update', function(ids) {
//          gulp.start('build-js');
//      });
// });

gulp.task('build-css', function() {
    return gulp.src('public/less/*.less')
        .pipe(concat('index' + getLibName() + 'less'))
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 3 versions', 'Android >= 4.0', 'Firefox >= 20'],
            // 是否美化属性值
            cascade: true,
            // 是否去掉不必要的前缀
            remove: true,
        }))
        .pipe(gulpif(argv.min, minifycss()))
        .pipe(gulp.dest('build/css'))
        .pipe(livereload());
});

gulp.task('connect', function() {
    connect.server({
        root: '../',
        livereload: true
    });
});

gulp.task('watch-html', function() {
    return gulp.src('views/*.html')
        .pipe(livereload());
});

gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('public/less/*.less', ['build-css']);
    gulp.watch('views/*.html', ['watch-html']);
    b.plugin(watchify)
        .on('update', function(ids) {
            gulp.start('build-js');
        });
});

gulp.task('default', ['connect', 'build-js', 'build-css', 'watch']);
```



##webpack的配置文件webpack.config.js

>显然，webpack的配置方式更为直观，但个人比较喜欢browserify与gulp协作的pipe stream方式，孰优孰劣在这里就先不必较了。

```
var path = require('path');
var webpack = require('webpack');
// path.resolve返回相对于运行node.js程序的路径，接受多个参数，相当于依次执行cd命令
var node_modules = path.resolve(__dirname, '../node_modules');

var dir_public = path.resolve(__dirname, '../public');
var dir_build = path.resolve(__dirname, '../build');

module.exports = {
    entry: path.resolve(dir_public, 'app.jsx'),
    output: {
        path: dir_build,
        filename: 'bundle.js'
    },
    // webpack-dev-server（在localhost:8080建立一个web服务器，存放编译后的静态资源包）配置文件
    devServer: {
        contentBase: dir_build
    },
    // 导入文件预处理器
    module: {
        loaders: [{
            // "test" is commonly used to match the file extension
            test: /public(\\|\/).+\.jsx?$/,
            // "exclude" should be used to exclude exceptions
            exclude: /node_modules/,
            loader: 'babel-loader',
            // 相当于loader: 'babel?presets[]=es2015'
            query: {
                presets: ['es2015', 'react']
            }
        }]
    },
    // 用于扩展webpack的插件
    plugins: [
        // Avoid publishing files when compilation fails
        new webpack.NoErrorsPlugin()
    ],
    stats: {
        // Nice colored output
        colors: true
    },
    // 开启devtool，并配置输出代码的source map  （与less生成的source map文件有关联？）
    devtool: 'source-map'
}
```

