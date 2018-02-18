var gulp = require('gulp');
var browserSync = require('browser-sync').create();

// gulp.task('test', function() {
//     return gulp
//         .src('source/**/*.js')
//         .pipe(uglify())
//         .pipe(gulp.dest('build'));
// });

// gulp.task('browserReload', function() {
//     browserSync({
//         server: {
//             baseDir: './build/'
//         }
//     });
// });

// gulp.task('watch', ['browserReload'], function() {
//     // gulp.watch('source/*', ['test']);
//     gulp.watch('./build/index.html', browserSync.reload());
// });

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            // baseDir: ""
        },
        notify: false
    });
});

gulp.task('watch', ['browser-sync'], function() {
    gulp.watch('bundle.js').on("change", browserSync.reload);
});