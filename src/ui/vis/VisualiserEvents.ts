import { SchedulerVisualiser } from "./VisualiserOperations.tsx";


export function OnRangeChange(visualiser: SchedulerVisualiser, value: number) {
  visualiser.changeFrame(value);
}


/**
 * The visualiser is playing, it will step through frames at a particular rate
 * this rate will be defined by the player at the moment un we specify a form
 */
export function OnVisualiserPlay(visualiser: SchedulerVisualiser) {
  visualiser.togglePlay();
}

/**
 * Is used by the OnClick call when the next button is clicked
 */
export function OnVisualiserFrameNext(visualiser: SchedulerVisualiser) {

 visualiser.nextFrame();
}

/**
 * Sets the previous frame that the visualiser is to be set at when the mouse is clicked
 */
export function OnVisualiserFramePrev(visualiser: SchedulerVisualiser) {
 
 visualiser.prevFrame();
}

/**
 * Resets the frame counter
 */
export function OnVisualiserReset(visualiser: SchedulerVisualiser) {
 
 visualiser.reset();
}

/**
 * Saves an SVG frame from the current animation
 */
export function OnVisualiserSaveFrame(visualiser: SchedulerVisualiser) {
 
 visualiser.saveFrame();
}

/**
 * SVG animation will be dumped in its entirity
 */
export function OnVisualiserSaveAnimation(visualiser: SchedulerVisualiser) {
 
 visualiser.saveAnimation();
}

/**
 * Will export the JSON file that had been attached and used part of the recording
 * process for the architecture constructed
 */
export function OnVisualiserExportJSON(visualiser: SchedulerVisualiser) {
 
 visualiser.saveJSON();
}
