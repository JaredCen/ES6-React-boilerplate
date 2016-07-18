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
// 	b.plugin(watchify)
// 		.on('update', function(ids) {
// 			gulp.start('build-js');
// 		});
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