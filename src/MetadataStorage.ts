import {TaskMetadata} from "./TaskMetadata";
import {GulpclassMetadata} from "./GulpclassMetadata";
import * as merge from "merge2";
import * as runSequence from "run-sequence";

/**
 * Storages and registers all gulp classes and their tasks.
 */
export class MetadataStorage {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private gulpclassMetadatas: GulpclassMetadata[] = [];
    private taskMetadatas: TaskMetadata[] = [];

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    addGulpclassMetadata(metadata: GulpclassMetadata) {
        this.gulpclassMetadatas.push(metadata);
        this.taskMetadatas
            .filter((taskMetadata: TaskMetadata) => {
                return this.isOrInherits(taskMetadata.classConstructor, metadata.classConstructor, taskMetadata.name);
            })
            .forEach((taskMetadata: TaskMetadata) => this.registerTasks(metadata, taskMetadata));
    }

    addTaskMetadata(metadata: TaskMetadata) {
        this.taskMetadatas.push(metadata);
        var gulpclassMetadata: GulpclassMetadata;
        
        this.gulpclassMetadatas.forEach((element) => {
            if (this.isOrInherits(metadata.classConstructor, element.classConstructor, metadata.name)) {
                gulpclassMetadata = element;
            }
        });

        if (gulpclassMetadata) {
            this.registerTasks(gulpclassMetadata, metadata);
        }
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private isOrInherits(pBase: Function, pSubclass: Function, name: string): boolean {
        if (pSubclass === pBase) {
            return true;
        } else {
            let current: any = pSubclass;
            while (current.__proto__.name != 'Object') {
                if (current === pBase) {
                    return true;
                }
                current = current.__proto__;
            }
            return false;
        }
    }

    private registerTasks(gulpclassMetadata: GulpclassMetadata, taskMetadata: TaskMetadata) {
        if (!gulpclassMetadata.classInstance)
            gulpclassMetadata.classInstance = new (<any>gulpclassMetadata.classConstructor)();

        if (taskMetadata.dependencies && taskMetadata.dependencies.length) {
            gulpclassMetadata.gulpInstance.task(taskMetadata.name, taskMetadata.dependencies, (cb: Function) => {
                return this.executeTask(gulpclassMetadata, taskMetadata, cb);
            });
        } else {
            gulpclassMetadata.gulpInstance.task(taskMetadata.name, (cb: Function) => {
                return this.executeTask(gulpclassMetadata, taskMetadata, cb);
            });
        }
    }

    private executeTask(gulpclassMetadata: GulpclassMetadata, taskMetadata: TaskMetadata, cb: Function) {
        const methodResult = (<any>gulpclassMetadata.classInstance)[taskMetadata.method](cb);

        if (taskMetadata.isSequence && methodResult instanceof Array) {
            if (typeof methodResult[methodResult.length - 1] !== "function") {
                methodResult.push(cb);
            }

            return runSequence.apply(this, methodResult);
        } else if (taskMetadata.isMerge && methodResult instanceof Array) {
            return merge.apply(this, methodResult);
        } else {
            return methodResult;
        }
    }

}

/**
 * Default metadata storage is used as singleton and can be used to storage all metadatas.
 */
export let defaultMetadataStorage = new MetadataStorage();
