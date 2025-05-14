import { GimFCVisualiser } from "./Visualiser.tsx";


export function OnRangeChange(visualiser: GimFCVisualiser, value: number) {
  visualiser.changeFrame(value);
}


/**
 * The visualiser is playing, it will step through frames at a particular rate
 * this rate will be defined by the player at the moment un we specify a form
 */
export function OnVisualiserPlay(visualiser: GimFCVisualiser) {
  visualiser.togglePlay();
}

/**
 * Is used by the OnClick call when the next button is clicked
 */
export function OnVisualiserFrameNext(visualiser: GimFCVisualiser) {

 visualiser.nextFrame();
}

/**
 * Sets the previous frame that the visualiser is to be set at when the mouse is clicked
 */
export function OnVisualiserFramePrev(visualiser: GimFCVisualiser) {
 
 visualiser.prevFrame();
}

/**
 * Resets the frame counter
 */
export function OnVisualiserReset(visualiser: GimFCVisualiser) {
 
 visualiser.reset();
}

/**
 * Saves an SVG frame from the current animation
 */
export function OnVisualiserSaveFrame(visualiser: GimFCVisualiser) {
 
 visualiser.saveFrame();
}

/**
 * SVG animation will be dumped in its entirity
 */
export function OnVisualiserSaveAnimation(visualiser: GimFCVisualiser) {
 
 visualiser.saveAnimation();
}

/**
 * Will export the JSON file that had been attached and used part of the recording
 * process for the architecture constructed
 */
export function OnVisualiserExportJSON(visualiser: GimFCVisualiser) {
 
 visualiser.saveJSON();
}
