import {Gulpclass, Task, SequenceTask} from "./src/Annotations";
import * as gulp from "gulp";

const del: any = require('del');
const plumber: any = require('gulp-plumber');
const ts: any = require('gulp-typescript');
const shell: any = require('gulp-shell');
const fs: any = require('fs');
const dtsGenerator: any = require('dts-generator').default;

@Gulpclass()
export class Gulpfile {

    @Task()
    clean(cb: Function) {
        return del(['./build/**', '!./build/es5/gulpfile.js'], cb);
    }

    @Task()
    compile() {
        var tsProject = ts.createProject('./tsconfig.json', {
            sortOutput: true,
            typescript: require('typescript')
        });
        return tsProject.src()
            .pipe(plumber())
            .pipe(ts(tsProject))
            .js
            .pipe(gulp.dest('./build/es5'));
    }

    @Task()
    tsd() {
        return gulp.src('*.js', { read: false })
            .pipe(shell([
                './node_modules/.bin/tsd install',
                './node_modules/.bin/tsd rebundle',
                './node_modules/.bin/tsd link'
            ]));
    }

    @Task()
    buildPackageCopySrc() {
        return gulp.src('./build/es5/src/*')
            .pipe(gulp.dest('./build/package'));
    }

    @Task()
    buildPackageCopyFiles() {
        return gulp.src(['./package.json', './README.md'])
            .pipe(gulp.dest('./build/package'));
    }

    @Task()
    buildPackageGenerateDts(cb: Function) {
        let name = require(__dirname + '/../../package.json').name;
        dtsGenerator({
            name: name,
            baseDir: './src',
            files: this.getFiles('./src'),
            out: './build/package/' + name + '.d.ts'
        });
        cb();
    }

    @SequenceTask()
    package() {
        return [
            'clean',
            'compile',
            ['buildPackageCopySrc', 'buildPackageCopyFiles', 'buildPackageGenerateDts']
        ];
    }

    @SequenceTask()
    default() {
        return ['clean', 'compile'];
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private getFiles(dir: string, files: string[] = []): string[] {
        var filesInDir = fs.readdirSync(dir);
        for (var i in filesInDir) {
            var name = dir + '/' + filesInDir[i];
            if (fs.statSync(name).isDirectory()) {
                this.getFiles(name, files);
            } else {
                files.push(name);
            }
        }
        return files;
    }

}