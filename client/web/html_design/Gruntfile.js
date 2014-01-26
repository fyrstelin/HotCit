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
            sass: {
                files: 'styles/sass/*.scss',
                tasks: ['sass'],
                options: {
                    livereload:  true
                },
            },
            css: {
                files: 'styles/css/main.css',
            },
            html:{
                files: 'index.html',
                options: {
                    livereload:  true
                },
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['watch']);
};
