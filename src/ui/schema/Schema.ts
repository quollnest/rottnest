
/**
 * Interface for ui data schemas to keep track
 * and form a pattern on the kind of data and structure required.
 *
 * getDefaults() generate default data that is used by the container
 * getData() will retrieve the current data state
 * getOperations() will provide operations that can be used on the data
 *
 */
export interface ContainerSchema<ContainerData, DataOperations> {

  getDefaults(): ContainerData;

  getData(): ContainerData;

  getOperations(): DataOperations;
} 
