import {TaskMetadata} from "./TaskMetadata";
import {GulpclassMetadata} from "./GulpclassMetadata";

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

        const gulpclassMetadata = this.gulpclassMetadatas.reduce((found, m) => {
            return m.classConstructor === metadata.classConstructor ? m : found;
        }, undefined);
        if (gulpclassMetadata)
            this.registerTasks(gulpclassMetadata, metadata);
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private registerTasks(gulpclassMetadata: GulpclassMetadata, taskMetadata: TaskMetadata) {
        if (!gulpclassMetadata.classInstance)
            gulpclassMetadata.classInstance = new (<any>gulpclassMetadata.classConstructor)();

        gulpclassMetadata.gulpInstance.task(taskMetadata.name, (cb: Function) => {
            const methodResult = (<any>gulpclassMetadata.classInstance)[taskMetadata.method](cb);
            if (taskMetadata.isSequence && methodResult instanceof Array) {
                return require("run-sequence").apply(this, methodResult.concat(cb));
            } else if (taskMetadata.isSequence && methodResult instanceof Array) {
                return require("merge2").apply(this);
            } else {
                return methodResult;
            }
        });
    }
}

/**
 * Default metadata storage is used as singleton and can be used to storage all metadatas.
 */
export let defaultMetadataStorage = new MetadataStorage();