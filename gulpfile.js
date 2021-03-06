/**
 * Gulpfile for front-end developing with Bootstrap.
 *
 * Implements:
 *      1. Live reloads browser with BrowserSync.
 *      2. CSS: Less to CSS conversion, error catching, Autoprefixing,
 *         CSS minification.
 *      3. JS: Concatenates & uglifies Custom JS files.
 *      4. Images: Compresses PNG, JPEG, GIF and SVG images.
 *      5. Watches files for changes in CSS or JS.
 *      6. Watches files for changes in HTML.
 *      7. Corrects the line endings.
 *      8. InjectCSS instead of browser page reload.
 *
 * @author Jobayer Arman (@JobayerArman)
 * @version 1.2.1
 */

/**
 * Configuration.
 *
 * Project Configuration for gulp tasks.
 *
 * Edit the variables as per your project requirements.
 */
// Project root folders
var basePaths = {
  src: 'src/',
  dest: 'dist/'
};
// Styles folders and files
var styles = {
  src: {
    path      : basePaths.src + 'less/',
    mainFile  : basePaths.src + 'less/main.less',
    allFiles  : basePaths.src + 'less/**/*.less'
  },
  dest: {
    path      : basePaths.dest + 'css/',
    files     : basePaths.dest + 'css/*.css'
  }
};
// Scripts folders and files
var scripts = {
  src: {
    path      : basePaths.src + 'js/',
    files     : basePaths.src + 'js/*.js'
  },
  dest: {
    path      : basePaths.dest + 'js/',
    files     : basePaths.dest + 'js/*.js',
    filename  : 'script.js'
  }
};
// HTML folders and files
var html = {
  src: {
    path      : basePaths.src + 'site/',
    pages     : basePaths.src + 'site/pages/*.+(html|njk)',
    files     : basePaths.src + 'site/**/*.+(html|njk)',
    templates : basePaths.src + 'site/templates'
  },
  dest: {
    path      : basePaths.dest + 'public/',
    files     : basePaths.dest + 'public/*.html'
  }
};
// Image folders and files
var images = {
  src: {
    path      : basePaths.src + 'img/',
    files     : basePaths.src + 'img/*.{png,jpg,gif,svg}'
  },
  dest: {
    path      : basePaths.dest + 'img/',
    files     : basePaths.dest + 'img/*.{png,jpg,gif,svg}'
  }
};
// Watch variables
var watch = {
  styles    : styles.src.allFiles,
  scripts   : scripts.src.files,
  images    : images.src.files,
  html      : html.src.files
};

// Browsers you care about for autoprefixing.
// Browserlist https://github.com/ai/browserslist
const AUTOPREFIXER_BROWSERS = [
  'android >= 4',
  'bb >= 10',
  'chrome >= 34',
  'ff >= 30',
  'ie >= 9',
  'ie_mob >= 10',
  'ios >= 7',
  'opera >= 23',
  'safari >= 7',
];
// End of project variables

/**
 * Load Plugins.
 *
 * Load gulp plugins and assigning them semantic names.
 */
var gulp         = require('gulp');                  // Gulp of-course
var gutil        = require('gulp-util');             // Utility functions for gulp plugins

// CSS related plugins.
var less         = require('gulp-less');             // Gulp pluign for Sass compilation.
var cssmin       = require('gulp-cssmin');           // Minifies CSS files.
var autoprefixer = require('gulp-autoprefixer');     // Autoprefixing magic.

// JS related plugins.
var jshint       = require('gulp-jshint');           // JSHint plugin for gulp
var concat       = require('gulp-concat');           // Concatenates JS files
var uglify       = require('gulp-uglify');           // Minifies JS files

// HTML template engine
var htmlRender   = require('gulp-nunjucks-render');  // Render Nunjucks templates

// Image realted plugins.
var imagemin     = require('gulp-imagemin');         // Minify PNG, JPEG, GIF and SVG images with imagemin.

// Utility related plugins.
var browserSync  = require('browser-sync').create(); // Reloads browser and injects CSS. Time-saving synchronised browser testing.
var del          = require('del');                   // Delete files and folders
var gulpSequence = require('gulp-sequence');         // Run a series of gulp tasks in order
var notify       = require('gulp-notify');           // Sends message notification to you
var plumber      = require('gulp-plumber');          // Prevent pipe breaking caused by errors from gulp plugins
var reload       = browserSync.reload;               // For manual browser reload.
var rename       = require('gulp-rename');           // Renames files E.g. style.css -> style.min.css
var size         = require('gulp-size');             // Logs out the total size of files in the stream and optionally the individual file-sizes


/**
 * Notify Errors
 */
function errorLog(err) {
  notify.onError({title: "Gulp Task Error", message: "Check your terminal"})(err); //Error Notification
  console.log(err.toString()); //Prints Error to Console
  this.emit('end');
};


/**
 * Task: Cleanup
 *
 * Cleanups dest files
 */
gulp.task('clean', function() {
  return del([styles.dest.path, scripts.dest.path]);
});


/**
 * Task: `styles`.
 *
 * Compiles Less, Autoprefixes it and Minifies CSS.
 *
 */
 gulp.task('styles', function() {
  return gulp.src( styles.src.mainFile )
    .pipe( plumber( {errorHandler: errorLog}) )

    .pipe( less() )

    .pipe( autoprefixer( AUTOPREFIXER_BROWSERS ) )
    .pipe( gulp.dest( styles.dest.path ) )
    .pipe( size({
      showFiles: true
    }) )
    .pipe( browserSync.stream() ) // Injects style.css if that is enqueued

    .pipe( rename({suffix: '.min'}))
    .pipe( cssmin({
      keepSpecialComments: false
    }))
    .pipe( gulp.dest( styles.dest.path ) )
    .pipe( size({
      showFiles: true
    }) )
    .pipe( browserSync.stream() ); // Injects style.css if that is enqueued
});


/**
  * Task: `scripts`.
  *
  * Concatenate and uglify custom scripts.
  *
  */
gulp.task( 'scripts', function() {
  return gulp.src( scripts.src.files )
    .pipe( plumber({errorHandler: errorLog}) )

    .pipe( jshint() )
    .pipe( jshint.reporter('jshint-stylish') )

    .pipe( concat( scripts.dest.filename ) )
    .pipe( gulp.dest( scripts.dest.path ) )
    .pipe( size({
      showFiles: true
    }) )

    .pipe( rename( {
      basename: 'script',
      suffix: '.min'
    }))
    .pipe( uglify() )
    .pipe( gulp.dest( scripts.dest.path ) )
    .pipe( size({
      showFiles: true
    }) );
});


/**
 * Task: render HTML template
 */
gulp.task( 'render-html', function() {
  return gulp.src( html.src.pages )
    .pipe( plumber({errorHandler: errorLog}) )
    .pipe(htmlRender({
      path: html.src.templates
    }))
    .pipe( gulp.dest( html.dest.path ))
    .pipe( size({
      showFiles: true
    }) );
});


/**
  * Task: `images`.
  *
  * Compresses PNG, JPEG, GIF and SVG images.
  *
  * This task does the following:
  *     1. Gets the images from src folder
  *     2. Compresses PNG, JPEG, GIF and SVG images
  *     3. Generates and saves the optimized images in dist folder
  *
  */
gulp.task( 'image:compress', function() {
  return gulp.src( images.src.files )
    .pipe( plumber({errorHandler: errorLog}) )
    .pipe( imagemin( {
      optimizationLevel: 5, // 0-7 low-high
      progressive: true,
      interlaced: true,
      svgoPlugins: [{removeViewBox: false}]
    }))

    .pipe(gulp.dest( images.dest.path ));
});


/**
 * Task: `browser-sync`.
 *
 * Live Reloads, CSS injections, Localhost tunneling.
 *
 * This task does the following:
 *    1. Sets the project URL
 *    2. Sets inject CSS
 *    3. You may want to stop the browser from openning automatically
 */
gulp.task( 'browser-sync', function() {
  browserSync.init( {

    // built-in static server for basic HTML/JS/CSS websites
    server: {
      baseDir: html.dest.path,
      routes: {
        '/dist': 'dist/'
      }
    },

    // Open the site in Chrome
    browser: "chrome.exe",

    // `true` Automatically open the browser with BrowserSync live server.
    // `false` Stop the browser from automatically opening.
    open: false,

    // Inject CSS changes.
    // Commnet it to reload browser for every CSS change.
    injectChanges: true,

    // Console log connections
    logConnections: false,

    // The small pop-over notifications in the browser are not always needed/wanted
    notify: false,
  });
});


/**
 * Default Gulp task
 */
gulp.task( 'default', gulpSequence('clean', 'render-html', 'styles', 'scripts', 'image:compress'));


/**
  * Watch Tasks.
  *
  * Watches for file changes and runs specific tasks.
  */
gulp.task( 'serve', ['render-html', 'styles', 'scripts', 'browser-sync'], function() {
  gulp.watch( watch.html, [ 'render-html', reload] );       // Render files and reload on HTML file changes.
  gulp.watch( watch.styles, [ 'styles' ] );                 // Run LESS task on file changes.
  gulp.watch( watch.scripts, [ 'scripts', reload ] );       // Reload on customJS file changes.
  gulp.watch( watch.images, [ 'image:compress', reload ] ); // Reload on image file changes.
});
