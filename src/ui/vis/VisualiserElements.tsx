import { ReactElement } from 'react';
import BellState from './assets/bell_state.svg'
import SurfaceCodeDouble from './assets/surface_code_double.svg'
import SurfaceCode from './assets/surface_code.svg'
import MagicState from './assets/magic_state.svg'


export type VisCell = {
  type: string
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

/**
 * SymbolKindMap
 */
export type SymbolKindMap = {
	bell: { patch: string }
	locked: { text: string }
	reg: { patch: string }
	route: { text: string }
	magic_state: { patch: string }
	cultivator: { text: string }
	reserved: { text: string }
	factory_output: { text: string }
	route_buffer: { text: string }
	other: { text: string }
	unused: { text: string }
}




/**
 * ColorConfigMap provides a description
 * for a few subtypes
 */
type ColorConfigMap = {
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
