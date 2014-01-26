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
                tasks: ['sass']
            }
        },
    });
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['watch']);
};