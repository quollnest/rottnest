import React from "react";


//const exampleData = {};



//
// GimEventKind that outlines
// what kind of event was generated
// 
export type GimEventKind = {
  kind: string,
  factory_id?: number
  ancilla_id?: number
  register_id?: number
  states?: number
  n_states?: number
  
}


//
// An event that is recorded by the graph machine
// 
export type GimEvent = {
  cycles: number,
  step: number,
  eventkind: GimEventKind
}

//
// Visualiser Object produced by the Gim
// Model.
// 
export type VisualObj = {
  registers: number,
  ancilla: number,
  tfactories: number,
  events: Array<Array<GimEvent>>
}


//
// Represents the current position
// within the graph
// 
export type VisPosition = {
  x: number
  y: number
  radius: number
}

export type VisUsedNode = {
  position: VisPosition,
  text: string
}


///
// Used for generating a line and also light up lines
// 
export type VisLine = {
  x1: number,
  x2: number,
  y1: number,
  y2: number,
}

//
// Each frame contains information
// on the current frame number 
// 
export type VisualiserData = {
  frameNo: number
  registers: Array<VisPosition>
  ancilla: Array<VisPosition>
  tfactories: Array<VisPosition>
  factory_edges: Array<VisLine>
  used_factory_edges: Array<VisLine>
  ancilla_edges: Array<VisLine>
  used_ancilla_edges: Array<VisLine>
  usedNodes: Array<VisUsedNode>
  visualObj: VisualObj | null
  
  
}

//
// Based on the visual object given,
// it will construct data that the visualiser can consume
// for displaying the animation
// 
export function ConstructAnimData(visualObj: VisualObj)
  : VisualiserData {

  
  let registers: Array<VisPosition> = [];
  for(let i = 0; i < visualObj.registers; i++) {
    registers.push({x: 20 * (i + 1), y: 20, radius: 3 });
  }

  let ancilla: Array<VisPosition> = [];
  let ancilla_edges: Array<VisLine> = [];
  for(let i = 0; i < visualObj.registers; i++) {
    ancilla.push({x: 20 * (i + 1), y: 50, radius: 3 });
    for(let j = 0; j < registers.length; i++) {
      ancilla_edges.push(
        {x1: 20 * (i + 1), y1: 50, x2: registers[j].x,
          y2: registers[j].y });
    }
  }
  let tfactories: Array<VisPosition> = [];
  let factory_edges: Array<VisLine> = [];
  for(let i = 0; i < visualObj.registers; i++) {
    tfactories.push({x: 20 * (i + 1), y: 80, radius: 3 });
    for(let j = 0; j < ancilla.length; i++) {
      factory_edges.push(
        {x1: 20 * (i + 1), y1: 80, x2: ancilla[j].x,
          y2: ancilla[j].y });
    }
  }

  return {
    frameNo: 0,
    registers,
    ancilla,
    tfactories,
    factory_edges,
    used_factory_edges: [],
    ancilla_edges,
    used_ancilla_edges: [],
    usedNodes: [],
    visualObj
  }
}


export function VisualiserDataEmpty() {
  
  return {
    frameNo: 0,
    registers: [],
    ancilla: [],
    tfactories: [],
    factory_edges: [],
    used_factory_edges: [],
    ancilla_edges: [],
    used_ancilla_edges: [],
    usedNodes: [],
    visualObj: null
  }
}




//
// Will draw a node that will represent either a
// register, ancilla or factory
// 
export function DrawActiveNode(vp: VisUsedNode) {

  const node_circ = <circle cx={vp.position.x} cy={vp.position.y} r={vp.position.radius}
    stroke={"orange"} strokeWidth={2} fill="none" />
  const node_text = <text x={vp.position.x} y={vp.position.y} textAnchor="middle"
      >
      {vp.text}
      </text>

  return (<>
    {node_circ}
    {node_text}
    </>)
  
}

//
// Will draw a node that will represent either a
// register, ancilla or factory
// 
export function DrawNode(vp: VisPosition, textrepr: string) {

  const node_circ = <circle cx={vp.x} cy={vp.y} r={vp.radius}
    stroke={"black"} strokeWidth={2} fill="none" />
  const node_text = <text x={vp.x} y={vp.y} textAnchor="middle"
      >
      {textrepr}
      </text>

  return (<>
    {node_circ}
    {node_text}
    </>)
  
}

//
// Draws a line between two visual object
// that are part of an svg
// 
export function DrawLineFromPositions(vp1: VisPosition, vp2: VisPosition, stroke_col: string) {
  const node_line = <line x1={vp1.x} y1={vp1.y} x2={vp2.x} y2={vp2.y} stroke={stroke_col} strokeWidth={3} />

  return <>{node_line}</>;
  
}
//
// Draws a line between two visual object
// that are part of an svg
// 
export function DrawLine(vl: VisLine, stroke_col: string) {
  const node_line = <line x1={vl.x1} y1={vl.y1} x2={vl.x2} y2={vl.y2} stroke={stroke_col} strokeWidth={3} />

  return <>{node_line}</>;
  
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
export class VisualiserFrame extends React.Component<VisualObj, VisualiserData> {

  state = VisualiserDataEmpty();

  genData() {
    const vobj = this.props;
    const animdata = ConstructAnimData(vobj);
    return animdata;
  }

  updateState() {
    
    const vobj = this.props;
    const animdata = ConstructAnimData(vobj);
    this.setState(animdata);
  }

  drawLines() {
    let animdata = this.state;
    let lines = [];
    for(let i = 0; i < animdata.ancilla_edges.length; i++) {
      lines.push(DrawLine(animdata.ancilla_edges[i], "black"));
    }

    for(let i = 0; i < animdata.factory_edges.length; i++) {
      lines.push(DrawLine(animdata.factory_edges[i], "black"));
    }
    return lines;
  }

  drawNodes() {
    
    let animdata = this.state;
    let nodes = [];
    for(let i = 0; i < animdata.registers.length; i++) {
      nodes.push(DrawNode(animdata.registers[i], `r${i}`));
      
    }
    for(let i = 0; i < animdata.ancilla.length; i++) {
      nodes.push(DrawNode(animdata.ancilla[i], `a${i}`));
      
    }
    for(let i = 0; i < animdata.tfactories.length; i++) {
      nodes.push(DrawNode(animdata.tfactories[i], `t${i}`));
      
    }

    return nodes;
  }

  drawActiveNodes() {
    
    let animdata = this.state;
    let nodes = [];
    for(let i = 0; i < animdata.usedNodes.length; i++) {
      nodes.push(DrawActiveNode(animdata.usedNodes[i]));
      
    }

    return nodes;
  }

  drawActiveLines() {
    
    let animdata = this.state;
    let lines = [];
    for(let i = 0; i < animdata.used_ancilla_edges.length; i++) {
      lines.push(DrawLine(animdata.used_ancilla_edges[i], "orange"));
    }

    for(let i = 0; i < animdata.used_factory_edges.length; i++) {
      
      lines.push(DrawLine(animdata.used_factory_edges[i], "orange"));
    }
    return lines;
  }  

  render() {
    ///TODO:  You need to revise this 
    const lines = this.drawLines();
    const nodes = this.drawNodes();
    const activeLines = this.drawActiveLines();
    const ox = 20;
    const oy = 20;
    const vwidth = 500;
    const vheight = 500; 

    return (
      <>
        <svg viewBox={`${-100-ox} ${-100-oy} ${vwidth} ${vheight}`} width={'100%'} height={720}
          style={{backgroundColor: 'grey'}}>
        {lines}
        {activeLines}
        {nodes}
        </svg>
      </>)
  }

}
