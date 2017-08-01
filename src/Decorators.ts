import {defaultMetadataStorage} from "./MetadataStorage";

/**
 * Registers a class from which tasks will be loaded.
 * You can optionally specify your gulp instance if you want to register tasks specifically there.
 */
export function Gulpclass(gulpInstance?: any): Function {
    return function(target: Function) {
        if (!gulpInstance)
            gulpInstance = require("gulp");

        defaultMetadataStorage.addGulpclassMetadata({
            gulpInstance: gulpInstance,
            classConstructor: target
        });

    }
}

/**
 * Registers a class from which tasks will be loaded, and from whose less-derived base classes
 * tasks will also be loaded.
 * You must specify your gulp instance so that the correct instance is used for inherited tasks
 * when the base class is in another module/scope.
 */
export function GulpSubclass(gulpInstance: any): Function {
    return function(target: Function) {
        if (!gulpInstance)
            gulpInstance = require("gulp");

        defaultMetadataStorage.addGulpclassMetadata({
            gulpInstance: gulpInstance,
            classConstructor: target
        });

    }
}

/**
 * Registers a task with the given name. If name is not specified then object's method name will be used.
 */
export function Task(name?: string, dependencies?: string[]): Function {
    return function(target: Function, key: string) {
        defaultMetadataStorage.addTaskMetadata({
            classConstructor: target.constructor,
            method: key,
            name: name || key,
            dependencies: dependencies || []
        });
    }
}

/**
 * Tasks will be run in sequence when using this annotation.
 */
export function SequenceTask(name?: string): Function {
    return function(target: Function, key: string) {
        defaultMetadataStorage.addTaskMetadata({
            classConstructor: target.constructor,
            method: key,
            name: name || key,
            dependencies: [],
            isSequence: true
        });
    }
}

/**
 * Tasks will be run merged when using this annotation.
 */
export function MergedTask(name?: string): Function {
    return function(target: Function, key: string) {
        defaultMetadataStorage.addTaskMetadata({
            classConstructor: target.constructor,
            method: key,
            name: name || key,
            dependencies: [],
            isMerge: true
        });
    }
}
