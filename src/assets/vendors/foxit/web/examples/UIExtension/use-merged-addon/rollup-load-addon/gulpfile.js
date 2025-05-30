const gulp = require('gulp');
const mergeAddon = require('@foxitsoftware/gulp-merge-addon');

const libPath = '../../../../lib/';

gulp.task('merge-addon', () => {
    return gulp.src([libPath + 'uix-addons/*/addon.info.json'])
    .pipe(mergeAddon({
        library: 'UIExtensionAddons',
        filename: 'merged-addons.js',
        lazyInit: true
    }))
    .pipe(gulp.dest('./dist/'));
});
