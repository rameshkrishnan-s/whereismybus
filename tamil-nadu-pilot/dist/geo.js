export const haversine = (a, b) => {
  const rad = x => x * Math.PI / 180;
  const dlat = rad(b.lat-a.lat), dlon=rad(b.lon-a.lon);
  const h = Math.sin(dlat/2)**2 + Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dlon/2)**2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
};

function inRing(point, ring) {
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
    const [xi,yi]=ring[i], [xj,yj]=ring[j];
    if ((yi>point.lat)!==(yj>point.lat) && point.lon<(xj-xi)*(point.lat-yi)/(yj-yi)+xi) inside=!inside;
  }
  return inside;
}
const ringBounds=new WeakMap();
function ringContains(point,ring){
  let bounds=ringBounds.get(ring);
  if(!bounds){bounds={minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};for(const [x,y] of ring){bounds.minX=Math.min(bounds.minX,x);bounds.maxX=Math.max(bounds.maxX,x);bounds.minY=Math.min(bounds.minY,y);bounds.maxY=Math.max(bounds.maxY,y);}ringBounds.set(ring,bounds);}
  return point.lon>=bounds.minX&&point.lon<=bounds.maxX&&point.lat>=bounds.minY&&point.lat<=bounds.maxY&&inRing(point,ring);
}
export function inTamilNadu(point,boundary) {
  return Number.isFinite(point.lat) && Number.isFinite(point.lon) && boundary.outer.some(r=>ringContains(point,r)) && !boundary.inner.some(r=>ringContains(point,r));
}

export const CITIES = [
  {id:'all',name:'All Tamil Nadu',ta:'தமிழ்நாடு முழுவதும்'},
  {id:'chennai',name:'Chennai region',ta:'சென்னை பகுதி',lat:13.0827,lon:80.2707,radius:50000},
  {id:'coimbatore',name:'Coimbatore region',ta:'கோயம்புத்தூர் பகுதி',lat:11.0168,lon:76.9558,radius:35000},
  {id:'tiruppur',name:'Tiruppur region',ta:'திருப்பூர் பகுதி',lat:11.0981849,lon:77.3482607,radius:35000},
  {id:'madurai',name:'Madurai region',ta:'மதுரை பகுதி',lat:9.9252,lon:78.1198,radius:35000},
  {id:'trichy',name:'Tiruchirappalli region',ta:'திருச்சிராப்பள்ளி பகுதி',lat:10.7905,lon:78.7047,radius:35000},
  {id:'salem',name:'Salem region',ta:'சேலம் பகுதி',lat:11.6643,lon:78.146,radius:35000},
  {id:'tirunelveli',name:'Tirunelveli region',ta:'திருநெல்வேலி பகுதி',lat:8.7139,lon:77.7567,radius:35000},
  {id:'vellore',name:'Vellore region',ta:'வேலூர் பகுதி',lat:12.9165,lon:79.1325,radius:35000},
  {id:'erode',name:'Erode region',ta:'ஈரோடு பகுதி',lat:11.341,lon:77.7172,radius:35000},
  {id:'thanjavur',name:'Thanjavur region',ta:'தஞ்சாவூர் பகுதி',lat:10.787,lon:79.1378,radius:35000}
];
export const BUS_TYPES = {
  town:{radius:500,label:'town'},
  express:{radius:1000,label:'express'},
  intercity:{radius:2000,label:'intercity'},
  deluxe:{radius:2000,label:'deluxe'},
  other:{radius:1000,label:'otherBus'}
};
export function regionFor(stop) {
  return CITIES.slice(1).map(c=>({city:c,d:haversine(stop,c)})).sort((a,b)=>a.d-b.d).find(x=>x.d<=x.city.radius)?.city.name.replace(' region','') || stop.area || 'Tamil Nadu';
}
export function normaliseSearch(value='') {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/\btirup+ur\b/g,'tiruppur').replace(/\btrichy\b/g,'tiruchirappalli').replace(/\btuticorin\b/g,'thoothukudi').replace(/[^\p{L}\p{M}\p{N}\s]/gu,' ').replace(/\bbus\s*(?:stand|station|terminal)\b/g,'busstand').replace(/\bbus\s*stop\b/g,'busstop').replace(/\s+/g,' ').trim();
}
export function matchesStop(stop,query) {
  const haystack=normaliseSearch([stop.name,stop.ta,stop.area,regionFor(stop),...(stop.aliases||[])].join(' '));
  return normaliseSearch(query).split(' ').filter(Boolean).every(token=>haystack.includes(token));
}
export function parseCoordinates(value) {
  const parts=value.trim().split(/[\s,]+/);
  if(parts.length!==2||parts.some(p=>!/^[-+]?\d+(?:\.\d+)?$/.test(p)))return null;
  const [lat,lon]=parts.map(Number);
  return Math.abs(lat)<=90&&Math.abs(lon)<=180?{lat,lon}:null;
}
export function searchStops(stops,query,city='all') {
  const region=CITIES.find(c=>c.id===city) || CITIES[0];
  return stops.filter(s=>(region.id==='all'||haversine(s,region)<=region.radius) && matchesStop(s,query)).sort((a,b)=>{
    const exactA=normaliseSearch(a.name)===normaliseSearch(query);
    const exactB=normaliseSearch(b.name)===normaliseSearch(query);
    return Number(exactB)-Number(exactA) || Number(b.kind==='terminal')-Number(a.kind==='terminal') || a.name.localeCompare(b.name);
  });
}
export function destinationMatches(stops,query,point=null) {
  if(!query.trim())return [];
  const q=normaliseSearch(query);
  const rank=s=>Number([s.name,s.ta,...(s.aliases||[])].some(name=>normaliseSearch(name)===q));
  return searchStops(stops,query,'all').map(stop=>({stop,distance:point?haversine(point,stop):null})).sort((a,b)=>rank(b.stop)-rank(a.stop)||(point?a.distance-b.distance:0));
}

export function regionAt(point) {
  if(!point||!Number.isFinite(point.lat)||!Number.isFinite(point.lon))return CITIES[0];
  return CITIES.slice(1).map(city=>({city,distance:haversine(point,city)})).filter(x=>x.distance<=x.city.radius).sort((a,b)=>a.distance-b.distance)[0]?.city||CITIES[0];
}
export function nearbyStops(stops,point,{maxDistance=5000,query=''}={}) {
  if(!point||![point.lat,point.lon].every(Number.isFinite))return [];
  return stops.filter(s=>matchesStop(s,query)).map(stop=>({stop,distance:haversine(point,stop)})).filter(x=>x.distance<=maxDistance).sort((a,b)=>a.distance-b.distance||a.stop.id.localeCompare(b.stop.id));
}
export function routesNear(routes,stopMap,point,maxDistance=1500) {
  if(!point)return [];
  const distances=new Map();
  const at=id=>{if(!distances.has(id)){const s=stopMap.get(id);distances.set(id,s?haversine(point,s):Infinity);}return distances.get(id);};
  const candidates=[];
  for(const route of routes){let boardingIndex=-1,distance=Infinity;for(let i=0;i<route.stopIds.length;i++){const d=at(route.stopIds[i]);if(d<distance){distance=d;boardingIndex=i;}}
    // An ordered route ending here has no onward destinations in this direction.
    if(distance<=maxDistance&&boardingIndex>=0&&(!route.sequenceKnown||boardingIndex<route.stopIds.length-1))candidates.push({route,distance,boardingIndex,boardingStop:stopMap.get(route.stopIds[boardingIndex])});
  }
  // Only identical onward stop patterns are collapsed; different route variants stay selectable.
  const seen=new Set();
  return candidates.sort((a,b)=>a.distance-b.distance||a.route.ref.localeCompare(b.route.ref)).filter(x=>{const key=[x.route.operator,x.route.ref,...x.route.stopIds.slice(x.route.sequenceKnown?x.boardingIndex:0)].join('|');if(seen.has(key))return false;seen.add(key);return true;});
}
export function stopsOnRoute(candidate,stopMap,query='') {
  if(!candidate)return [];
  const ids=candidate.route.sequenceKnown?candidate.route.stopIds.slice(candidate.boardingIndex+1):candidate.route.stopIds;
  return ids.map((id,index)=>({stop:stopMap.get(id),sequence:candidate.route.sequenceKnown?candidate.boardingIndex+index+2:index+1})).filter(x=>x.stop&&matchesStop(x.stop,query));
}

// Estimates radial approach time, not bus-route or traffic-aware arrival time.
// Invalid, stale, or inaccurate fixes never trigger an alarm.
export class JourneyTracker {
  constructor(destination,{minutes=5,radius=1000}={}) {
    this.destination=destination;this.minutes=minutes;this.radius=radius;this.samples=[];this.alerted=false;this.initialDistance=null;
  }
  update(fix,now=Date.now()) {
    if(![fix.lat,fix.lon,fix.accuracy,fix.timestamp].every(Number.isFinite)||fix.accuracy<0||Math.abs(fix.lat)>90||Math.abs(fix.lon)>180) return {valid:false,reason:'invalid'};
    if(now-fix.timestamp>20000 || fix.timestamp-now>5000) return {valid:false,reason:'stale'};
    if(fix.accuracy>100) return {valid:false,reason:'accuracy',accuracy:fix.accuracy};
    const distance=haversine(fix,this.destination);
    if(this.initialDistance===null) this.initialDistance=distance;
    const last=this.samples.at(-1);
    if(last&&fix.timestamp<=last.timestamp) return {valid:false,reason:'stale'};
    this.samples.push({...fix,distance});
    this.samples=this.samples.filter(s=>fix.timestamp-s.timestamp<=60000);
    let closingSpeed=null,eta=null;
    const first=this.samples[0],span=(fix.timestamp-first.timestamp)/1000;
    if(this.samples.length>=3&&span>=15) {
      const gain=first.distance-distance;
      // Ignore changes smaller than GPS uncertainty and implausible motion.
      if(gain>Math.max(30,(first.accuracy+fix.accuracy)/2)) {
        const speed=gain/span;
        const recent=this.samples.at(-2);
        if(speed>=0.7&&speed<=40&&distance<=recent.distance+fix.accuracy) {closingSpeed=speed;eta=distance/speed/60;}
      }
    }
    let reason=null;
    if(distance<=this.radius) reason='distance';
    else if(eta!==null&&eta<=this.minutes) reason='time';
    const shouldAlert=!!reason&&!this.alerted;
    if(shouldAlert) this.alerted=true;
    return {valid:true,distance,eta,closingSpeed,shouldAlert,reason,accuracy:fix.accuracy,progress:Math.min(1,Math.max(0,1-distance/Math.max(this.initialDistance,1)))};
  }
}
