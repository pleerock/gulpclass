import * as merge from "merge2";
import { GulpclassMetadata } from "./GulpclassMetadata";
import { TaskMetadata } from "./TaskMetadata";
import * as gulp from 'gulp';
import { TaskFunction } from "undertaker";

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
            .filter(taskMetadata => taskMetadata.classConstructor === metadata.classConstructor)
            .forEach(taskMetadata => this.registerTasks(metadata, taskMetadata));
    }

    addTaskMetadata(metadata: TaskMetadata) {
        this.taskMetadatas.push(metadata);

        const gulpclassMetadata = this.gulpclassMetadatas.reduce<GulpclassMetadata | undefined>((found, m) => {
            return m.classConstructor === metadata.classConstructor ? m : found;
        }, undefined);
        if (gulpclassMetadata)
            this.registerTasks(gulpclassMetadata, metadata);
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private registerTasks(gulpclassMetadata: GulpclassMetadata, taskMetadata: TaskMetadata) {
        if (!gulpclassMetadata.classInstance) {
            gulpclassMetadata.classInstance = new (<any>gulpclassMetadata.classConstructor)();
        }

        if (taskMetadata.dependencies && taskMetadata.dependencies.length) {
            const dependencies = [...taskMetadata.dependencies];
            let args: any[] = [];

            if (gulpclassMetadata.gulpInstance.series) {
                args = [taskMetadata.name, gulp.series(...dependencies, (cb: Function) => {
                    return this.executeTask(gulpclassMetadata, taskMetadata, cb);
                })];
            } else {
                args = [taskMetadata.name, ...dependencies, (cb: Function) => {
                    return this.executeTask(gulpclassMetadata, taskMetadata, cb);
                }]
            }

            gulpclassMetadata.gulpInstance.task.apply(gulpclassMetadata.gulpInstance, args);
        } else {
            gulpclassMetadata.gulpInstance.task(taskMetadata.name, (cb: Function) => {
                return this.executeTask(gulpclassMetadata, taskMetadata, cb);
            });
        }
    }

    private executeTask(gulpclassMetadata: GulpclassMetadata, taskMetadata: TaskMetadata, cb: Function) {
        const methodResult = (<any>gulpclassMetadata.classInstance)[taskMetadata.method](cb);
        if (taskMetadata.isSequence && methodResult instanceof Array) {
            return gulpclassMetadata.gulpInstance.series.apply(gulpclassMetadata.gulpInstance, methodResult)(cb);
        } else if (taskMetadata.isMerge && methodResult instanceof Array) {
            return merge.apply(null, methodResult);
        } else {
            return methodResult;
        }
    }

}

/**
 * Default metadata storage is used as singleton and can be used to storage all metadatas.
 */
export let defaultMetadataStorage = new MetadataStorage();
