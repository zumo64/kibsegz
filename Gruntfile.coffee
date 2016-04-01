module.exports = (grunt) ->

  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-watch"
  
  # Project configuration.
  grunt.initConfig
    
    pkg: grunt.file.readJSON('package.json')
     
    dirs:
      templates: "templates"
      src: "src"
      jscontrollers:"public/controllers"
      jsdirectives:"public/directives"
      jsroutes:"server/routes"

    
    clean_files:
      js:["<%= dirs.jscontrollers %>"]

    coffee:
      controllers:
        expand: true
        flatten: true
        src: ['./src/controllers/*.coffee']
        dest: "<%= dirs.jscontrollers %>"
        ext: '.js'
      directives:
        expand: true
        flatten: true
        src: ['./src/directives/*.coffee']
        dest: "<%= dirs.jsdirectives %>"
        ext: '.js'
     
        
    # Watch coffee files and rebuild using DEV mode
    watch:
      src:
        files: ['./src/controllers/*.coffee','./src/directives/*.coffee']
        tasks: ['coffee:controllers','coffee:directives']
        options:
          spawn: false
    
 
 
  grunt.renameTask 'clean','clean_files'
  
  grunt.registerTask 'clean', ['clean_files']
   
  grunt.registerTask 'make', ['clean','coffee:controllers']
  
  


