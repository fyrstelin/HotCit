/*
    TODO: USE UGLIFY; CONCAT, UGLIFY, JSLINT, MINIMIZE AND ALL THE OTHER FUN TOOLS
*/
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                files: {
                    'styles/css/main.css': 'styles/sass/main.scss'
                },
            }
        },
        watch: {
            options: {
                livereload: true,
            },
            sass: {
                files: 'styles/sass/*.scss',
                tasks: ['sass'],
            },
            html: {
                files: 'index.html',
            },
            js: {
                files: 'js/**/*',
            },
            // resources: {
            //    files: 'img/**/*',
            // } 
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['watch']);
};