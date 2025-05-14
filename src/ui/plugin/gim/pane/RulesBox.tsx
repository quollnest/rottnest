import React from "react";
import RottnestContainer from "../../../container/RottnestContainer";
import { GimFCGraph, GimFCInternal, GimGraph } from "../../../../model/gim/Entity";


export type GimRulesProps = {
  header: string
  container: RottnestContainer
}


export type GimRulesState = {
   graph: GimGraph
}


export class GimRulesBox extends React.Component<GimRulesProps, GimRulesState> {

  state: GimRulesState = {
    graph: 
  }


  render() {

    return (<>
      
    </>)
  }
  
}
