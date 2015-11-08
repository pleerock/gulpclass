import {Gulp} from "gulp";

/**
 * Metadata of the Gulpclass annotation.
 */
export interface GulpclassMetadata {

    gulpInstance: Gulp;
    classConstructor: Function;
    classInstance?: Object;

}