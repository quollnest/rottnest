import {ProjectAssembly} from "../model/Project";
import {TSchedData, TSchedDataNode} from "../model/TSchedData";



export default class ArchConverter {
	
	static MakeKindIdxKey(kind: string, idx: number): string {
		return `${kind}${idx}`;
	}

	static ToTSched(proj: ProjectAssembly): TSchedData | null {
		//Assume the first element is a register
		
		//1. Get the project details and create them
		let tschedProject: TSchedData = {
			width: proj.projectDetails.width,
			height: proj.projectDetails.height,
			regions: []
		};
			
		const regionList = proj.regionList;
		const flattenList = regionList.flattenWithTags();
		
		let tmap: Map<string, TSchedDataNode> = new Map();
		let root = null; //Will be set to register
		
		let registerSet = false;
		
		for(let i = 0; i < flattenList.length; i++) {
			
			const r = flattenList[i];
			const dim = r.rdata.getDimensions();
			const tkey = ArchConverter
				.MakeKindIdxKey(r.kind, r.idx);	
			const obj: TSchedDataNode = {
				region_type: r.rdata.getSubKind(),
				x: dim.x,
				y: dim.y,
				width: dim.width,
				height: dim.height,
				downstream: []
			};

			const router_type = r.rdata.getRouterKind()
			if (router_type !== null) {
				obj.router_type = router_type;
			}

			//Collect all the regions
			tmap.set(tkey, obj);

			if(r.kind === 'factory') {
				obj.factory_type = 'cultivator'; 
				//TODO: This should be encoded
			}

			if(r.kind === 'bellstate') {
				obj.bell_rate = 1; 
				//TODO: This should be encoded
			}

			if(r.kind === 'register' && !registerSet) {
				root = obj;
				registerSet = true;
			}

			if(r.rdata.getSubKind() === 'CombShapedRegisterRegion') {
				obj.incl_top = false;
			}
		}
		
		//Resolve hierarchy 
		for(let i = 0; i < flattenList.length; i++) {

			const r = flattenList[i];
			const tkey = ArchConverter.MakeKindIdxKey(r.kind, r.idx);
			const obj = tmap.get(tkey);

			if(obj) {
				const conPair = r.rdata.getConnectionDataPair();
				if(conPair) {
					const parentKey = ArchConverter
						.MakeKindIdxKey(conPair.kind, 
								conPair.idx);
					console.log(parentKey);
					const parentRef = tmap.get(parentKey);
					if(parentRef) {
						parentRef.downstream.push(obj);
					}
				} else {
				}
				
			}
		}

		//console.log(tmap);
		if(root) {	
			tschedProject.regions.push(root);
			return tschedProject;
		} else {
			return null;
		}
	}

	//TODO
	/*static FromTSched(tschedData: TSchedData): RegionDataList {
		

	}*/
}
