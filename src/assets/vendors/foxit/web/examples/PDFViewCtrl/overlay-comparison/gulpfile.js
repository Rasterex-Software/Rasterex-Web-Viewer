const path = require('path');
const gulp = require('gulp');
const filter = require('gulp-filter');

const libPath = path.resolve(__dirname, './node_modules/@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib');
const fontPath = path.resolve(__dirname, '../../../external');

gulp.task('copy-libs', () => {
    return gulp.src([
        libPath + '/**/*.*'
    ]).pipe(
        filter(file => {
            if(/UIExtension|uix-addons|PDFViewCtrl\.(vendor|polyfills|js)/.test(file.path)) {
                return false;
            }
            return true;
        })
    ).pipe(gulp.dest('build/foxit-lib'))
})

gulp.task('copy-fonts', () => {
    return gulp.src([
        fontPath + '/**/*.*'
    ]).pipe(gulp.dest('build/external'))
})

gulp.task('copy', gulp.series(['copy-libs', 'copy-fonts']))
