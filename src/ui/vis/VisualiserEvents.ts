import { SchedulerVisualiser } from "./VisualiserOperations";

/**
 * Shifts the location of the visualiser that is in the workspace
 */
export function OnVisualiserCursorShift(visualiser: SchedulerVisualiser) {
  
}

/**
 * The visualiser is playing, it will step through frames at a particular rate
 * this rate will be defined by the player at the moment un we specify a form
 */
export function OnVisualiserPlay(visualiser: SchedulerVisualiser) {
  
}



/**
 *
 * Is used by the OnClick call when the next button is clicked
 *
 */
export function OnVisualiserFrameNext(_visualiser: SchedulerVisualiser) {
  
}

/**
 *
 * Sets the previous frame that the visualiser is to be set at when the mouse is clicked
 *
 */
export function OnVisualiserFramePrev(_visualiser: SchedulerVisualiser) {
  
}


/**
 * Specifies the pause of the visualiser, sets "isPlaying" to false
 */
export function OnVisualiserPause(visualiser: SchedulerVisualiser) {
  
}


/**
 * Saves an SVG frame from the current animation
 */
export function OnVisualiserSaveFrame(visualiser: SchedulerVisualiser) {
  
}

/**
 * SVG animation will be dumped in its entirity
 */
export function OnVisualiserSaveAnimation(visualiser: SchedulerVisualiser) {
  
}

/**
 * Will export the JSON file that had been attached and used part of the recording
 * process for the architecture constructed
 */
export function OnVisualiserExportJSON(visualiser: SchedulerVisualiser) {
  
}
