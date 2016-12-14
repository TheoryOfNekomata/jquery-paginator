var

    /**
     * The path of the source files in order of occurrence.
     * @type {string[]}
     */
    files = [
        './src/init.js',
        './src/settings/component.js',
        './src/settings.js',
        './src/renderer.js',
        './src/page.js',
        './src/model.js',
        './src/view.js',
        './src/component.js',
        './src/definition.js'
    ],

    styles = [
        './src/style.css'
    ],

    /**
     * The output directory of the compiled files.
     * @type {string}
     */
    output = './bin',

/* ---------------- *
 * Task definitions *
 * ---------------- */

    name = require('./package.json').name,

    gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

if (name.indexOf('/') > -1) {
    name = name.slice(name.indexOf('/') + 1);
}

gulp.task('compile', function (cb) {
    gulp.src(files)
        .pipe(concat(name + '.js'))
        .pipe(gulp.dest(output))
        .on('end', cb);
});

gulp.task('compile-minified', function (cb) {
    gulp.src(files)
        .pipe(concat(name + '.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(output))
        .on('end', cb);
});

gulp.task('copy-styles', function (cb) {
    gulp.src(styles)
        .pipe(concat(name + '.css'))
        .pipe(gulp.dest(output))
        .on('end', cb);
});

gulp.task('default', ['compile', 'compile-minified', 'copy-styles']);
