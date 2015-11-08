/**
 * Metadata of the Task annotation.
 */
export interface TaskMetadata {

    /**
     * Object that is called by this task.
     */
    classConstructor: Function;

    /**
     * Method called by this class.
     */
    method: string;

    /**
     * Task name.
     */
    name: string;

    /**
     * Indicates if this task will be run using run-sequence component.
     */
    isSequence?: boolean;

    /**
     * Indicates if this task will be run using merge2 component.
     */
    isMerge?: boolean;

}