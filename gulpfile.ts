import {Gulpclass, Task, SequenceTask} from "./src/index";

const gulp = require("gulp");
const del = require("del");
const shell = require("gulp-shell");
const replace = require("gulp-replace");

@Gulpclass()
export class Gulpfile {

    /**
     * Cleans compiled files.
     */
    @Task()
    cleanCompiled(cb: Function) {
        return del(["./build/es5/**"], cb);
    }

    /**
     * Publishes a package to npm from ./build/package directory.
     */
    @Task()
    npmPublish() {
        return gulp.src("*.js", { read: false })
            .pipe(shell([
                "cd ./build/package && npm publish"
            ]));
    }

    /**
     * Cleans generated package files.
     */
    @Task()
    cleanPackage(cb: Function) {
        return del(["./build/package/**"], cb);
    }

    /**
     * Runs typescript files compilation.
     */
    @Task()
    compile() {
        return gulp.src("*.js", { read: false })
            .pipe(shell(["tsc"]));
    }

    /**
     * Copies all files that will be in a package.
     */
    @Task()
    packageFiles() {
        return gulp.src("./build/es5/src/**/*")
            .pipe(gulp.dest("./build/package"));
    }

    /**
     * Change the "private" state of the packaged package.json file to public.
     */
    @Task()
    packagePreparePackageFile() {
        return gulp.src("./package.json")
            .pipe(replace("\"private\": true,", "\"private\": false,"))
            .pipe(gulp.dest("./build/package"));
    }

    /**
     * This task will replace all typescript code blocks in the README (since npm does not support typescript syntax
     * highlighting) and copy this README file into the package folder.
     */
    @Task()
    packageReadmeFile() {
        return gulp.src("./README.md")
            .pipe(replace(/```typescript([\s\S]*?)```/g, "```javascript$1```"))
            .pipe(gulp.dest("./build/package"));
    }

    /**
     * Creates a package that can be published to npm.
     */
    @SequenceTask()
    package() {
        return [
            ["cleanCompiled", "cleanPackage"],
            "compile",
            ["packageFiles", "packagePreparePackageFile", "packageReadmeFile"]
        ];
    }

    /**
     * Creates a package and publishes it to npm.
     */
    @SequenceTask()
    publish() {
        return ["package", "npmPublish"];
    }

}