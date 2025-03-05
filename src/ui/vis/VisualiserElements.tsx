import { ReactElement } from 'react';
import BellState from './assets/bell_state.svg'
import SurfaceCodeDouble from './assets/surface_code_double.svg'
import SurfaceCode from './assets/surface_code.svg'
import MagicState from './assets/magic_state.svg'



export type VisFactory = {	
	loc_tl: Array<number> 
	loc_br: Array<number>
}


export type VisRegion = {
	name: string
	loc_tl: Array<number>
	loc_br: Array<number>
	factories?: Array<VisFactory>
}

export type VisFrameData = {
  currentFrame: number
}


export type VisGate = {
	id: number
	type: string
	active_time?: number	
	holds?: Array<[number, number]>
} 


/**
 * The data layer that will contain the necessary components
 * TODO: Fix up types because WHO KNOWS WHAT IT IS
 */
export type VisDataLayer = {
	board: Array<Array<VisCell>>
	gates: Array<VisGate>
	//factories?: Array<VisFactory>
}


/**
 * VisCell that contains a locked_by field, it will
 * be associated by some gate?
 */
export type VisCell = {
  type: string
  locked_by?: number
} 

/**
 * Pre-Rendered version of a patch cell
 */
export type PatchRenderData = {
  element: ReactElement
  id: string
  width: number
  height: number
}

export type SymbolCell = {
  text?: string
  patch?: string
}

/**
 * TBH, no clue what the this is, it just apparently has
 * two numbers which resemble their coordinates
 */
export type CellComp = [number | null, number | null]

/**
 * SymbolKindMap
 */
export type SymbolKindMap = {
	bell: SymbolCell
	locked: SymbolCell
	reg: SymbolCell
	route: SymbolCell
	magic_state: SymbolCell
	cultivator: SymbolCell
	reserved: SymbolCell
	factory_output: SymbolCell
	route_buffer: SymbolCell
	other: SymbolCell
	unused: SymbolCell
}

/**
 * ColorConfigMap provides a description
 * for a few subtypes
 */
export type ColorConfigMap = {
	SingleRowRegisterRegion: string
	MagicStateFactoryRegion: string
  CombShapedRegisterRegion: string
  TCultivatorBufferRegion: string
  MagicStateBufferRegion: string
  BellRegion: string
  RouteBus: string
}

export const CELL_SIZE: number = 100;
export const GLOBAL_SCALE: number = 0.4;
export const FRAMERATE: number = 4;

export const PreRenderedPatches: Array<PatchRenderData> = [
  {
    element: <BellState />,
    id: "bell_state",
    width: 1,
    height: 1
  },
  {
    element: <SurfaceCode />,
    id: "surface_code",
    width: 1,
    height: 1
  },
  {
    element: <SurfaceCodeDouble />,
    id: "surface_code_double",
    width: 2,
    height: 1
  },
  {
    element: <MagicState />,
    id: "magic_state",
    width: 1,
    height: 1
  },
];

/**
 * SymbolMap is used as a look up for rendering
 * purposes.
 * Each element can either be: Text or Patch
 * Text is directly printable
 * Patch requires being looked up
 */
export const SymbolMap: SymbolKindMap = {
	bell: { patch: "🔔" },
	locked: { text: "🔒" },
	reg: { patch: "surface_code" },
	route: { text: "=" },
	magic_state: { patch: "✨" },
	cultivator: { text: "🌻" },
	reserved: { text: "⛔" },
	factory_output: { text: "@" },
	route_buffer: { text: "." },
	other: { text: "?" },
	unused: { text: " "},
};

export const ColorMap: ColorConfigMap = {
	SingleRowRegisterRegion: "yellow",
  CombShapedRegisterRegion: "yellow",
  MagicStateFactoryRegion: "blue",
  TCultivatorBufferRegion: "blue",
  MagicStateBufferRegion: "red",
  BellRegion: "magenta",
  RouteBus: "green",
};
