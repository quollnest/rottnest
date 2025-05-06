import React, { useEffect, useState, useRef } from "react";
import styles from '../styles/HelpContainer.module.css';

export type HelpBoxData = {
	id?: string;
	title: string;
	content: string;
	coords?: [number, number];
	rightPointer?: boolean;
	targetSelector?: string;
}

type HelpContainerProps = {
  	toggleOff: () => void;
  	helpData: Array<HelpBoxData>;
}

export const HelpContainer: React.FC<HelpContainerProps> = ({ toggleOff, helpData }) => {
  	const [activeTooltip, setActiveTooltip] = useState<HelpBoxData | null>(null);
  	const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  	const [isInitialized, setIsInitialized] = useState(false);
  	const tooltipRef = useRef<HTMLDivElement>(null);

  	// Debounce function to make hover smoother
  	const debounce = (func: Function, wait: number) => {
    		let timeout: NodeJS.Timeout;
    		return (...args: any[]) => {
      			clearTimeout(timeout);
      			timeout = setTimeout(() => func(...args), wait);
    		};
  	};

  	useEffect(() => {
    
    	document.querySelectorAll('input[type="file"]').forEach(input => {
      		if (input instanceof HTMLElement) {
        		input.style.display = 'none';
        		input.style.visibility = 'hidden';
        		input.style.opacity = '0';
        		input.style.position = 'absolute';
        		input.style.pointerEvents = 'none';
      		}
    	});
    
    	// Prevent initial "flash" effect
    	setTimeout(() => {
      		setIsInitialized(true);
    	}, 50);
    
    	const handleKeyDown = (event: KeyboardEvent) => {
      		if (event.key === 'Escape') {
        		toggleOff();
      		}
    	};
	
    	const helpItemsMap = new Map();
    	helpData.forEach(item => {
      		if (item.id) {
        		helpItemsMap.set(item.id, item);
      		}
    	});
    
    	// Event listener
    	document.addEventListener('keydown', handleKeyDown);
    
    	let currentHighlightedElement: Element | null = null;
    	let currentHelpItem: HelpBoxData | null = null;
    
    	// Debounced tooltip update to avoid rapid changes
    	const updateTooltip = debounce((element: Element, helpItem: HelpBoxData) => {
      		if (element === currentHighlightedElement) {
        		const rect = element.getBoundingClientRect();
        		const viewportWidth = window.innerWidth;
        		const viewportHeight = window.innerHeight;
        
        		let x = rect.right + 10;
        		let y = rect.top;
        
        		const tooltipWidth = 320; // Max tooltip width
        		
			if (x + tooltipWidth > viewportWidth) {
          			x = Math.max(0, rect.left - tooltipWidth - 10);
          
          			if (x <= 0) {
            				x = Math.max(0, Math.min(viewportWidth - tooltipWidth, rect.left));
            					if (rect.top > viewportHeight / 2) {
              						y = rect.top - 150; // Height of tooltip + margin
            					} else {
              						y = rect.bottom + 10;
            					}
          			}			
        		}
        
        		if (y + 150 > viewportHeight - 60) {
          			y = Math.max(10, viewportHeight - 210); 
        		}
        
        		setTooltipPosition({ x, y });
        		setActiveTooltip(helpItem);
      		}
    	}, 50); // 50ms debounce
    
    	// Main mouse move handler
    	const handleGlobalMouseMove = (e: MouseEvent) => {
      
		if (!isInitialized) return;
      
      		const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
      
      		let helpElement: Element | null = null;
      		let helpItem: HelpBoxData | null = null;
      
      		for (const el of elementsUnderCursor) {
        		if (el instanceof HTMLInputElement && el.type === 'file') {
          			continue;
        		}
        
			if (tooltipRef.current && (tooltipRef.current === el || tooltipRef.current.contains(el))) {
				continue;
			}
		
			if (el instanceof HTMLElement) {
				const helpId = el.getAttribute('data-help-id') || el.getAttribute('data-component');
				if (helpId && helpItemsMap.has(helpId)) {
					helpElement = el;
					helpItem = helpItemsMap.get(helpId);
					break;
				}
			}
      		}
      
      		if (helpElement && helpItem) {
        		if (helpElement !== currentHighlightedElement) {
          			if (currentHighlightedElement) {
            				currentHighlightedElement.classList.remove(styles.helpHighlighted);
          			}
          
          			if (!(helpElement instanceof HTMLInputElement && helpElement.type === 'file')) {
            				helpElement.classList.add(styles.helpHighlighted);
            				currentHighlightedElement = helpElement;
           	 			currentHelpItem = helpItem;
            
            				updateTooltip(helpElement, helpItem);
          			}
        		}	
      		} else if (currentHighlightedElement) {
        		currentHighlightedElement.classList.remove(styles.helpHighlighted);
        		currentHighlightedElement = null;
        		currentHelpItem = null;
        		setActiveTooltip(null);
      		}
    	};
    
    	document.addEventListener('mousemove', handleGlobalMouseMove);
    
    	// Clean up 
    	return () => {
      		document.removeEventListener('keydown', handleKeyDown);
      		document.removeEventListener('mousemove', handleGlobalMouseMove);
      
      		if (currentHighlightedElement) {
        		currentHighlightedElement.classList.remove(styles.helpHighlighted);
      		}
      
      		document.querySelectorAll('input[type="file"]').forEach(input => {
        		if (input instanceof HTMLElement) {
          			input.style.display = '';
          			input.style.visibility = '';
          			input.style.opacity = '';
          			input.style.position = '';
          			input.style.pointerEvents = '';
        		}
      		});
    	};
  
	}, [helpData, toggleOff, isInitialized]);

  	return (
		<div className={styles.helpContainer}>
			{/* Semi-transparent overlay - no interactivity */}
			<div 
				className={styles.helpOverlay} 
				onClick={toggleOff}
				style={{ 
				pointerEvents: 'none', // Allow mouse events to pass help overlay
				opacity: isInitialized ? 0.3 : 0
				}}
			>
			
			{/* Active tooltip - this needs to be interactive */}
			{activeTooltip && (
			<div 
				ref={tooltipRef}
				className={styles.tooltip} 
				style={{ 
					left: tooltipPosition.x, 
					top: tooltipPosition.y,
					pointerEvents: 'auto', 
					opacity: isInitialized ? 1 : 0
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<h4>{activeTooltip.title}</h4>
				<p>{activeTooltip.content}</p>
			</div>
			)}
		</div>
      
      		{/* Fixed footer that's always visible but fades in */}
      		<div 
        		className={styles.helpOverlayHeader} 
        		style={{ 
          			pointerEvents: 'auto',
          			opacity: isInitialized ? 1 : 0,
          			transition: 'opacity 0.2s ease-in-out'
        		}}
      		>
        	<div className={styles.helpInstructions}>
          		Hover over elements to see help information
        	</div>
        	<button 
          		onClick={toggleOff} 
          		className={styles.closeButton}
          		style={{ pointerEvents: 'auto' }}
        	>
          		Close Help (ESC)
        	</button>
      		</div>
    	</div>
  	);
};
