# Make a beautiful class-based gulpfiles with Typescript and Gulpfile.ts

Allows to create a gulp files in classes, each method of which can be a gulp task.

## Simple Usage

1. Install module:

    `npm install --save gulpfile.ts`

2. Install depend tsd dependencies:

    `tsd install --save gulp`

3. Create a `gulpfile.ts` and describe your tasks
    
    ```typescript
    
        import {Gulpclass, Task} from "gulpfile.ts/Annotations";
        import * as gulp from "gulp";
        
        let del: any = require('del'); // you probably want to define a classes that does not have type definition this way
        
        @Gulpclass()
        export class Gulpfile {
        
            @Task()
            clean(cb: Function) {
                return del(['./dist/**'], cb);
            }
        
            @Task()
            copyFiles() {
                return gulp.src(['./README.md'])
                    .pipe(gulp.dest('./dist'));
            }
        
            @Task('copy-source-files') // you can specify custom task name if you need
            copySourceFiles() {
                return gulp.src(['./src/**.js'])
                    .pipe(gulp.dest('./dist/src'));
            }
        
            @SequenceTask() // this special annotation using "run-sequence" module to run returned tasks in sequence
            build() {
                return ['copyFiles', 'copy-source-files'];
            }
        
            @Task()
            default() { // because this task has "default" name it will be run as default gulp task
                return ['build'];
            }
        
        }
            
    ```
    
4. How to run

    The way you run gulp depend of your tsconfig configuration. If you are not using "outDir" in the tsconfig then
    you probably no need to do anything - since you are outputting .js code right to the same directory as your
    gulpfile.ts you will have gulpfile.js right at the same directory, so you can run `gulp` as you usually do.
     
     
    But if you are using "outDir" in your tsconfig, you need to do some extra stuff. 
    Lets say you have specified "build/" as "outDir" in tsconfig.
    There are two options what you can do:
    
    * create `gulpfile.js` and put there ```require('build/gulpfile')```
    * or run gulp in cmd with extra parameters: `gulp --gulpfile build/gulpfile.js --cwd .`
    
    First option is preferred because most probably it will be annoying for you to run gulp every time you need to run some task.


## Caveats

Its important to understand that you will not able to run your gulp tasks *until* you compile your `gulpfile.ts` file.
This means that if compiling is a part of your gulp process you will not be able to use it,
because there are no gulpfile.js compiled from gulpfile.ts file.

## Samples

This project itself using [gulpfile.ts](https://github.com/PLEEROCK/gulpfile.ts/blob/master/gulpfile.ts).
Take a look on it as an example.
    

[1]: https://github.com/PLEEROCK/microframework
[2]: https://github.com/gulpfile.tsjs/gulpfile.ts