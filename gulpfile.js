var

    /**
     * The path of the source files in order of occurrence.
     * @type {string[]}
     */
    files = [
        './src/main.js'
    ],

    /**
     * The base name of the compiled files.
     * @type {string}
     */
    name = 'jquery-paginator',

    /**
     * The output directory of the compiled files.
     * @type {string}
     */
    output = './bin',

/* ---------------- *
 * Task definitions *
 * ---------------- */

    gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

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

gulp.task('default', ['compile', 'compile-minified']);
