
/**
 * Enum that outlines the kind of the node it is
 * Used to identify the kind of node that is to be represented
 * in the visualiser 
 */
export enum GimNodeKind {
  Register = "Register",
  Ancilla = "Ancilla",
  Factory = "Factory",
}

export interface GimGraph {
}

/*
 * GimNode is a GraphIonModel Node which
 * will be used to represent the model internall for the
 * the visualsier
 *
 * GimNode will need to have a information
 * about what nodes it needs to connect to in order to
 * demonstrate that we have connection.
 *
 */
export type GimNode = {
  kind: GimNodeKind
  connections: Array<number>
}

export enum GimGraphKind {
  FullyConnected = "FullyConnected",
  PartiallyConnected = "PartiallyConnected",
  Mapped = "Mapped",
}
/**
 * Fully Connected Graph representation
 * as part of the desig of it
 */
export type GimFCInternal = {
  registers: number
  factories: number
  ancilla: number
}

/**
 * The visualisation of the fully connected graph
 * that is to be used within the visualiser plugin
 */
export class GimFCGraph {
  internal: GimFCInternal = GimFCGraph.empty();
  nodes: Array<GimNode> = [];


  static empty(): GimFCInternal {
    return {
      registers: 0,
      factories: 0,
      ancilla: 0
    }
  }
}

export class GimPCGraph {
  internal: GimFCInternal = GimFCGraph.empty();
  nodes: Array<GimNode> = [];


  static empty(): GimFCInternal {
    return {
      registers: 0,
      factories: 0,
      ancilla: 0
    }
  }
}
export class GimMappedGraph {
  internal: GimFCInternal = GimFCGraph.empty();
  nodes: Array<GimNode> = [];



  static empty(): GimFCInternal {
    return {
      registers: 0,
      factories: 0,
      ancilla: 0
    }
  }
}

/**
 * The GimGraph is container for the graph
 * and allows the outline of a particular kind
 */
export type GimGraphContainer<T extends GimGraph> = {
  kind: GimGraphKind
  graph: T
}



/**
 * Constructs an empty graph of a particular type
 */
export function GimGraphEmpty(kind: GimGraphKind): GimGraph | null {
  if(kind === GimGraphKind.FullyConnected) {
    return new GimFCGraph();
  } else if(kind === GimGraphKind.PartiallyConnected) {

    return new GimPCGraph();
  } else if(kind === GimGraphKind.Mapped) {
    
    return new GimMappedGraph();
  } else {
    return null;
  }
}
