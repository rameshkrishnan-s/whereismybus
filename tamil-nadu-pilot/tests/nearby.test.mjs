import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {regionAt,nearbyStops,routesNear,stopsOnRoute,inTamilNadu,destinationMatches,parseCoordinates,searchStops} from '../dist/geo.js';
const origin={lat:13.0827,lon:80.2707};
const stop=(id,metres,name=id)=>({id,name,ta:id==='b'?'அருகில்':'',lat:origin.lat+metres/111195,lon:origin.lon});

test('GPS selects the local region rather than a stored Chennai default',()=>{
  assert.equal(regionAt({lat:11.0168,lon:76.9558}).id,'coimbatore');
  assert.equal(regionAt({lat:9.9252,lon:78.1198}).id,'madurai');
  assert.equal(regionAt(origin).id,'chennai');
  assert.equal(regionAt({lat:11.5,lon:78.5}).id,'all');
  assert.equal(regionAt(null).id,'all');
});
test('nearby suggestions sort by distance and reject stops outside 5 km',()=>{
  const stops=[{...stop('a',2000,'A Terminal'),kind:'terminal'},stop('b',100,'B Stop'),stop('c',6000,'C Stop')];
  assert.deepEqual(nearbyStops(stops,origin).map(x=>x.stop.id),['b','a']);
  assert.deepEqual(nearbyStops(stops,origin,{query:'அருகில்'}).map(x=>x.stop.id),['b']);
  assert.deepEqual(nearbyStops(stops,null),[]);
  assert.deepEqual(nearbyStops(stops,{lat:NaN,lon:80}),[]);
});
test('routes require a nearby boarding stop and provide only onward stops in order',()=>{
  const stops=new Map([stop('a',3000),stop('b',100),stop('c',4000),stop('d',6000)].map(s=>[s.id,s]));
  const route={id:'r',operator:'MTC',ref:'1',stopIds:['a','b','c','d'],sequenceKnown:true};
  const far={...route,id:'far',stopIds:['a','c','d']};
  const ending={...route,id:'ending',stopIds:['a','b']};
  const results=routesNear([far,ending,route],stops,origin);
  assert.equal(results.length,1);assert.equal(results[0].boardingStop.id,'b');
  assert.deepEqual(stopsOnRoute(results[0],stops).map(x=>[x.stop.id,x.sequence]),[['c',3],['d',4]]);
  assert.deepEqual(stopsOnRoute(results[0],stops,'d').map(x=>x.stop.id),['d']);
  assert.equal(routesNear([route],stops,{lat:11.0168,lon:76.9558}).length,0);
});
test('different onward route variants remain available but repeated patterns collapse',()=>{
  const stops=new Map([stop('a',100),stop('b',2000),stop('c',3000),stop('d',4000)].map(s=>[s.id,s]));
  const route={id:'r',operator:'MTC',ref:'1',from:'A',to:'D',stopIds:['a','b','d'],sequenceKnown:true};
  assert.equal(routesNear([route,{...route,id:'same'},{...route,id:'variant',stopIds:['a','c','d']}],stops,origin).length,2);
});
test('unordered OSM routes do not invent onward direction',()=>{
  const stops=new Map([stop('a',2000),stop('b',100)].map(s=>[s.id,s]));
  const route={id:'r',operator:'Community mapped',ref:'1',stopIds:['a','b'],sequenceKnown:false};
  const candidate=routesNear([route],stops,origin)[0];
  assert.ok(candidate);assert.deepEqual(stopsOnRoute(candidate,stops).map(x=>x.stop.id),['a','b']);
});
test('real route snapshot contains attributed patterns with valid stop references',()=>{
  const data=JSON.parse(fs.readFileSync(new URL('../dist/data/routes.json',import.meta.url)));
  const boundary=JSON.parse(fs.readFileSync(new URL('../dist/data/boundary.json',import.meta.url)));
  assert.equal(data.count,data.routes.length);assert.ok(data.count>100);
  assert.ok(data.license&&data.retrievedAt);assert.deepEqual(data.sources.map(s=>s.id),['gtfs','osm']);
  const map=new Map(data.stops.map(s=>[s.id,s]));assert.equal(map.size,data.stops.length);
  assert.equal(new Set(data.routes.map(r=>r.id)).size,data.routes.length);
  for(const s of data.stops){assert.ok(s.name);assert.ok(inTamilNadu(s,boundary),s.id);}
  for(const r of data.routes){assert.ok(r.ref&&r.url.startsWith('https://'));assert.ok(r.stopIds.length>=2);for(const id of r.stopIds)assert.ok(map.has(id),id);}
  const nearby=routesNear(data.routes,map,origin);assert.ok(nearby.length>0);
  for(const c of nearby)assert.ok(c.distance<=1500);
});

test('typed destinations find Tirupur Old Bus Stand statewide and support spelling variants',()=>{
  const data=JSON.parse(fs.readFileSync(new URL('../dist/data/stops.json',import.meta.url)));
  for(const query of ['tirupur old bus stand','Tiruppur old busstand','திருப்பூர் பழைய பேருந்து நிலையம்']){
    const matches=destinationMatches(data.stops,query,origin);
    assert.ok(matches.length);assert.equal(matches[0].stop.id,'osm-way-1363614386');
    assert.ok(matches[0].distance>100000);
  }
  assert.equal(searchStops(data.stops,'tirupur old bus stand','chennai').length,0);
  assert.equal(regionAt(data.stops.find(s=>s.id==='osm-way-1363614386')).id,'tiruppur');
});
test('exact destination name is ranked before a nearer partial match',()=>{
  const stops=[stop('near',100,'Old Bus Stand Road Stop'),stop('exact',10000,'Old Bus Stand')];
  assert.equal(destinationMatches(stops,'old busstand',origin)[0].stop.id,'exact');
  assert.deepEqual(destinationMatches(stops,''),[]);
});
test('manual coordinate parser rejects empty, malformed and out of range values',()=>{
  assert.deepEqual(parseCoordinates('11.09818, 77.34826'),{lat:11.09818,lon:77.34826});
  assert.deepEqual(parseCoordinates(' 11.09818 77.34826 '),{lat:11.09818,lon:77.34826});
  for(const value of ['',',','11.2,','91,77','11,181','abc,77','11,77,8'])assert.equal(parseCoordinates(value),null);
});
