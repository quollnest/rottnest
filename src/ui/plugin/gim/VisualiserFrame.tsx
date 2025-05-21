import React from "react";
import testdata from './assets/test.json';


export type GimVisualProps = {
  frameNo: number
  //obj: VisualObj
}

//
// GimEventKind that outlines
// what kind of event was generated
// 
export type GimEventKind = {
  kind: string,
  data: {
    factory_id?: number
    ancilla_id?: number
    register_id?: number
    states?: number
    n_states?: number
  }
}

//
// An event that is recorded by the graph machine
// 
export type GimEvent = {
  cycles: number,
  step: number,
  kind: GimEventKind
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

export type VisUsedEdge = {
  edge: VisLine,
  colour: string
}

//
// Each frame contains information
// on the current frame number 
// 
export type VisualiserData = {
  frameNo: number
  cycles: Array<number>
  registers: Array<VisPosition>
  ancilla: Array<VisPosition>
  tfactories: Array<VisPosition>
  factory_edges: Array<VisLine>
  ancilla_edges: Array<VisLine>
  usedEdges: Array<Array<GimVisEvent>>
  usedNodes: Array<Array<GimVisEvent>>
  visualObj: VisualObj | null
  
  
}

export type EVKey = "Node" | "Edge"

export type EVMap = {
  [key: string]: EVKey
}

const EventToVisMap: EVMap = {
  "Idle" : "Node",
  "FactoryGeneration" : "Node",
  "AncillaIdle" : "Node",
  "AncillaStateReset" : "Node",
  "RegisterConsume" : "Node",
  "RegisterIdle" : "Node",
  "RegisterReset" : "Node",
  "FactoryStatesMove" : "Edge",
  "AncillaStateMove" : "Edge"
}

export type EVTag = {
  kind: string,
  idx: number
  cnt?: number
}

export type EVTagMap = {
  [key: string]: (event: GimEvent, data: VisualiserData) => EVTag
}

const EventToTag: EVTagMap = {
  "Idle" : (_event, _data): EVTag => {
    return { kind: 'Factory', idx: 0 } },
  "FactoryGeneration" : (e, _d): EVTag => {
    return { kind: 'Factory', idx: e.kind.data.factory_id ? e.kind.data.factory_id : -1 } },
  "AncillaIdle" : (e, _d): EVTag => {
    return { kind: 'Ancilla', idx: e.kind.data.ancilla_id ? e.kind.data.ancilla_id : -1 } },
  "AncillaStateReset" : (e, _d): EVTag => {
    return { kind: 'Ancilla', idx: e.kind.data.ancilla_id ? e.kind.data.ancilla_id : -1 } }, 
  "RegisterConsume" : (e, _d): EVTag => {
    return { kind: 'Register', idx: e.kind.data.register_id ? e.kind.data.register_id : -1 } },
  "RegisterIdle" : (e, _d): EVTag => {
    return { kind: 'Register', idx: e.kind.data.register_id ? e.kind.data.register_id : -1 } },
  "RegisterReset" : (e, _d): EVTag => {
    return { kind: 'Register', idx: e.kind.data.register_id ? e.kind.data.register_id : -1 } },
  "FactoryStatesMove" : (e, _d): EVTag => {
    return { kind: 'Factory', idx: e.kind.data.factory_id ? e.kind.data.factory_id : -1,
    cnt: e.kind.data.n_states } },
  "AncillaStateMove" : (e, _d): EVTag => {
    return { kind: 'Ancilla', idx: e.kind.data.ancilla_id || -1,
    cnt: e.kind.data.register_id } },  
}

function NodeTagToPosition(tag: EVTag, data: VisualiserData): VisPosition {
  if(tag.kind === "Factory") {
    return data.tfactories[tag.idx];
  }
  else if(tag.kind === "Register") {
    return data.registers[tag.idx];
  } else {
    return data.ancilla[tag.idx];
  }
}

function EdgeTagToPosition(tag: EVTag, data: VisualiserData): VisLine {
  if(tag.kind === "Factory") {
    return data.factory_edges[tag.idx];
  } else {
    return data.ancilla_edges[tag.idx];
  }
}
export type GimVisEvent = {
  kind: EVKey,
  event: GimEvent,
  nodevis?: VisUsedNode
  edgevis?: VisUsedEdge
}


export function FrameEventBuilder(event: GimEvent, data: VisualiserData): GimVisEvent {
  const mkey = event.kind.kind;
  const ekind = EventToVisMap[mkey];

  const evtag = EventToTag[mkey](event, data);

  let fev: GimVisEvent = {
    kind: ekind,
    event
  };
  
  if(ekind === "Node") {
    
    fev = {
      kind: ekind,
      event,
      nodevis: {
        position: NodeTagToPosition(evtag, data),
        text: '' //TODO: Just empty for now

      }
    }
  } else if(ekind === "Edge") {
    
    fev = {
      kind: ekind,
      event,
      edgevis: {
        edge: EdgeTagToPosition(evtag, data),
        colour: 'orange'
      }
    }
  }

  return fev;
}

export type CyclesAggr = {
  frameNodeEvents: Array<GimVisEvent>;
  frameEdgeEvents: Array<GimVisEvent>;
}

export function AttachFrameActivities(data: VisualiserData, obj: VisualObj, frameNo: number) {
  let isFinished = false;
  const cyclesList = [];
  let frameNodeEvents = [];
  let frameEdgeEvents = [];

  let currentCycles = 0;
  
  for(let i = 0; i < obj.events.length && !isFinished; i++) {
    //Find events for step == frameNo

    for(let j = 0; j < obj.events[i].length; j++) {
      //
      const e = obj.events[i][j];

      if(e.step === frameNo) {
        //We need to switch it
        if (currentCycles != e.cycles) {
          currentCycles = e.cycles;
          if(frameNodeEvents.length > 0 || frameEdgeEvents.length > 0) {
            const cycaggr = {
              frameNodeEvents,
              frameEdgeEvents
            };
            cyclesList.push(cycaggr);
            frameNodeEvents = [];
            frameEdgeEvents = [];
          }
          
        }
        
        const fev = FrameEventBuilder(e, data);
        if(fev.kind === "Node") {
          frameNodeEvents.push(fev);
        } else if(fev.kind === "Edge") {
          frameEdgeEvents.push(fev);
          
        }
      } else if(e.step > frameNo) {
        //We should break here
        isFinished = true;
        break;
      }
    
    }

  }

  //Last check
  if(frameNodeEvents.length > 0 || frameEdgeEvents.length > 0) {
    const cycaggr = {
      frameNodeEvents,
      frameEdgeEvents
    };
    cyclesList.push(cycaggr);
    frameNodeEvents = [];
    frameEdgeEvents = [];
  }

  for(let i = 0; i < cyclesList.length; i++) {
    data.usedEdges.push(cyclesList[i].frameEdgeEvents);
    data.usedNodes.push(cyclesList[i].frameNodeEvents);
  }
  //We have everything with the aggregates
  
}

//
// Based on the visual object given,
// it will construct data that the visualiser can consume
// for displaying the animation
// 
export function ConstructAnimData(visualObj: VisualObj, frameNo: number): VisualiserData {

  
  let registers: Array<VisPosition> = [];
  for(let i = 0; i < visualObj.registers; i++) {
    registers.push({x: 50 * (i + 1), y: 20, radius: 10 });
  }

  let ancilla: Array<VisPosition> = [];
  let ancilla_edges: Array<VisLine> = [];
  for(let i = 0; i < visualObj.ancilla; i++) {
    ancilla.push({x: 50 * (i + 1), y: 100, radius: 10 });
    for(let j = 0; j < registers.length; j++) {
      ancilla_edges.push(
        {x1: 50 * (i + 1), y1: 100, x2: registers[j].x,
          y2: registers[j].y });
    }
  }
  let tfactories: Array<VisPosition> = [];
  let factory_edges: Array<VisLine> = [];
  for(let i = 0; i < visualObj.tfactories; i++) {
    
    tfactories.push({x: 50 * (i + 1), y: 180, radius: 10 });
    for(let j = 0; j < ancilla.length; j++) {
      factory_edges.push(
        {x1: 50 * (i + 1), y1: 180, x2: ancilla[j].x,
          y2: ancilla[j].y });
    }
  }


  let current_data = {
    frameNo: 0,
    cycles: [],
    registers,
    ancilla,
    tfactories,
    factory_edges,
    ancilla_edges,
    usedEdges: [],
    usedNodes: [],
    visualObj
  }

  

  //Construct the activity edges
  //Grouping are in pairs
  AttachFrameActivities(current_data, visualObj, frameNo)  

  return current_data;
}


export function VisualiserDataEmpty() {
  
  return {
    frameNo: 0,
    cycles: [],
    registers: [],
    ancilla: [],
    tfactories: [],
    factory_edges: [],
    ancilla_edges: [],
    usedEdges: [],
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
    stroke={"orange"} strokeWidth={3} fill="none" />
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
    stroke={"black"} strokeWidth={2} fill="white" />
  const node_text = <text x={vp.x} y={vp.y+(vp.radius/2)} textAnchor="middle"
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
  const node_line = <line x1={vp1.x} y1={vp1.y} x2={vp2.x} y2={vp2.y} stroke={stroke_col} strokeWidth={2} />

  return <>{node_line}</>;
  
}
//
// Draws a line between two visual object
// that are part of an svg
// 
export function DrawLine(vl: VisLine, stroke_col: string) {
  const node_line = <line x1={vl.x1} y1={vl.y1} x2={vl.x2} y2={vl.y2} stroke={stroke_col} strokeWidth={2} />

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
export class VisualiserFrame extends React.Component<GimVisualProps, VisualiserData> {

  state = VisualiserDataEmpty();

  genData(frameNo: number) {
    const vobj = testdata;
    const animdata = ConstructAnimData(vobj, frameNo);
    return animdata;
  }

  updateState(frameNo: number) {
    
    const vobj = testdata;
    const animdata = ConstructAnimData(vobj, frameNo);
    this.setState(animdata);
  }

  drawLines(animdata: VisualiserData) {
    let lines = [];
    for(let i = 0; i < animdata.ancilla_edges.length; i++) {
      lines.push(DrawLine(animdata.ancilla_edges[i], "black"));
    }

    for(let i = 0; i < animdata.factory_edges.length; i++) {
      lines.push(DrawLine(animdata.factory_edges[i], "black"));
    }
    return lines;
  }

  drawNodes(animdata: VisualiserData) {
    
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

  drawActiveNodes(animdata: VisualiserData, step: number) {
    
    //Use the event information to construct activities
    let nodes = [];
    if(animdata.usedNodes.length > 0) {
      for(let i = 0; i < animdata.usedNodes[step].length; i++) {
        const vis = animdata.usedNodes[step][i].nodevis;
        if(vis) {
          if(vis.position) {
            nodes.push(DrawActiveNode(vis));
          } else {
            
            console.warn("undefined node, ", vis);
          }
        }
      }
    } else {
      console.warn("No Active Nodes Here");
    }
    return nodes;
  }

  drawActiveLines(animdata: VisualiserData, step: number) {
    //Use the event information to construct activities
    let lines = [];
    if(animdata.usedEdges.length > 0) {
      for(let i = 0; i < animdata.usedEdges[step].length; i++) {
        const vis = animdata.usedEdges[step][i].edgevis;
        if(vis) {
          if(vis.edge) {
            lines.push(DrawLine(vis.edge, "orange"));
            
          } else {
            console.warn("undefined edge, ", vis);
          }
        }
      }
    } else {
      console.warn("No Active Edges Here");
    }

    return lines;
  }  

  render() {
    // TODO:  You need to revise this

    const frameNo = this.props.frameNo;
    const animdata = this.genData(frameNo);
    const lines = this.drawLines(animdata);
    const nodes = this.drawNodes(animdata);
    const activeLines = this.drawActiveLines(animdata, 0);
    const activeNodes = this.drawActiveNodes(animdata, 0);
    const ox = 20;
    const oy = 20;
    const vwidth = 500;
    const vheight = 500; 

    return (
      <>
        <svg viewBox={`${-100-ox} ${-100-oy} ${vwidth} ${vheight}`} width={'100%'} height={720}
          style={{backgroundColor: '#dddddd'}}>
        {lines}
        {activeLines}
        {nodes}
        {activeNodes}
        </svg>
      </>)
  }

}
