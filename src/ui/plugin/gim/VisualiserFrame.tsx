import React from "react";


const exampleData: FrameData = {

  
};

//
// Ancilla state is a case where it is locked/used by
// for an operation
//  
export enum GraphNodeState {
  InUse = "InUse",
  Free = "Free"
}


//
// Register is currently 1 qbit
// 
export type VisRegisters = {
  
}

export type VisAncilla = {
  
}

export type VisFactory = {
  
}




//
// Each frame contains information
// on the current frame number 
// 
export type FrameData = {
  frameNo: number,
  registers: Array<VisRegisters>,
}


//
// 1. Generate the positions on 3 rows
//   * Registers on top row
//   * Ancilla in the mid row
//   * Factories on the bottom row
//
// 2. Construct lines for every ancilla to all registers
//
// 3. Construct lines for every factory to all ancilla
//
// 4. The frame has a set of states that reflect what has changed between the two. 
//    * We need to detect the change between state
// 
// 
// 
export class VisualiserFrame extends React.Component<FrameData, {}> {


  render() {


    return (<>
      
      </>)
  }

}
