import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {haversine,inTamilNadu,searchStops,JourneyTracker,BUS_TYPES} from '../dist/geo.js';

const destination={lat:13.05,lon:80.2};
const now=1_000_000;
const fix=(metres,seconds=0,accuracy=10)=>({lat:destination.lat+metres/111195,lon:destination.lon,accuracy,timestamp:now+seconds*1000});

test('distance calculation handles same location and Chennai scale',()=>{
  assert.equal(haversine(destination,destination),0);
  assert.ok(Math.abs(haversine(destination,fix(1000))-1000)<1);
});
test('distance fallback alerts even when stopped and only once',()=>{
  const tracker=new JourneyTracker(destination);
  assert.equal(tracker.update(fix(900),now).shouldAlert,true);
  assert.equal(tracker.update(fix(800,1),now+1000).shouldAlert,false);
});
test('five-minute estimate alerts before reaching distance fallback',()=>{
  const tracker=new JourneyTracker(destination,{minutes:5,radius:500});
  assert.equal(tracker.update(fix(6000),now).shouldAlert,false);
  assert.equal(tracker.update(fix(5000,30),now+30000).shouldAlert,false);
  const result=tracker.update(fix(4000,60),now+60000);
  assert.ok(Math.abs(result.eta-2)<.01);
  assert.equal(result.shouldAlert,true);assert.equal(result.reason,'time');
});
test('time cannot be inferred from stationary or receding positions',()=>{
  const tracker=new JourneyTracker(destination,{radius:500});
  tracker.update(fix(2000),now);tracker.update(fix(2010,15),now+15000);
  const result=tracker.update(fix(2020,30),now+30000);
  assert.equal(result.eta,null);assert.equal(result.shouldAlert,false);
});
test('noise smaller than accuracy is not treated as approach speed',()=>{
  const tracker=new JourneyTracker(destination,{radius:500});
  tracker.update(fix(2000,0,80),now);tracker.update(fix(1970,15,80),now+15000);
  assert.equal(tracker.update(fix(1940,30,80),now+30000).eta,null);
});
test('stale, future, inaccurate and malformed fixes cannot alert',()=>{
  for(const input of [fix(200,-30),fix(200,30),fix(200,0,101),{...fix(200),lat:NaN},{...fix(200),accuracy:-1},{...fix(200),lon:181}]){
    const tracker=new JourneyTracker(destination);
    assert.equal(tracker.update(input,now).valid,false);
    assert.equal(tracker.alerted,false);
  }
});
test('duplicate timestamps are rejected and do not distort the estimate',()=>{
  const tracker=new JourneyTracker(destination);
  tracker.update(fix(5000),now);
  assert.equal(tracker.update(fix(200),now).valid,false);
  assert.equal(tracker.alerted,false);
});
test('starting inside the radius gives an immediate warning',()=>{
  const result=new JourneyTracker(destination,{radius:500}).update(fix(100),now);
  assert.equal(result.shouldAlert,true);assert.equal(result.reason,'distance');assert.equal(result.eta,null);
});
test('a new journey resets its alarm',()=>{
  assert.equal(new JourneyTracker(destination).update(fix(200),now).shouldAlert,true);
  assert.equal(new JourneyTracker(destination).update(fix(200),now).shouldAlert,true);
});
test('implausible approach speeds cannot produce time estimates',()=>{
  const tracker=new JourneyTracker(destination,{radius:500});
  tracker.update(fix(9000),now);tracker.update(fix(5000,10),now+10000);
  assert.equal(tracker.update(fix(2000,20),now+20000).eta,null);
});
test('polygon containment rejects holes and outside points',()=>{
  const b={outer:[[[0,0],[10,0],[10,10],[0,10],[0,0]]],inner:[[[3,3],[4,3],[4,4],[3,4],[3,3]]]};
  assert.equal(inTamilNadu({lat:2,lon:2},b),true);
  assert.equal(inTamilNadu({lat:3.5,lon:3.5},b),false);
  assert.equal(inTamilNadu({lat:20,lon:20},b),false);
});
test('bus categories offer progressively earlier distance presets',()=>{
  assert.equal(BUS_TYPES.town.radius,500);assert.equal(BUS_TYPES.express.radius,1000);
  assert.equal(BUS_TYPES.intercity.radius,2000);assert.equal(BUS_TYPES.deluxe.radius,2000);
  const nearby=fix(800);
  assert.equal(new JourneyTracker(destination,{radius:BUS_TYPES.town.radius}).update(nearby,now).shouldAlert,false);
  assert.equal(new JourneyTracker(destination,{radius:BUS_TYPES.express.radius}).update(nearby,now).shouldAlert,true);
});
test('search supports Tamil, English, multiple words and city filtering',()=>{
  const stops=[{id:'1',name:'Koyambedu Bus Terminal',ta:'கோயம்பேடு',lat:13.07,lon:80.2},{id:'2',name:'Madurai Bus Terminal',ta:'மதுரை',lat:9.92,lon:78.11}];
  assert.equal(searchStops(stops,' BUS koyam ','all')[0].id,'1');
  assert.equal(searchStops(stops,'மதுரை','all')[0].id,'2');
  assert.equal(searchStops(stops,'Madurai','chennai').length,0);
});
test('bundled stop dataset is real, unique, licensed and restricted to Tamil Nadu',()=>{
  const data=JSON.parse(fs.readFileSync(new URL('../dist/data/stops.json',import.meta.url)));
  const boundary=JSON.parse(fs.readFileSync(new URL('../dist/data/boundary.json',import.meta.url)));
  assert.ok(data.count>100);assert.equal(data.count,data.stops.length);
  assert.ok(data.license&&data.retrievedAt&&data.source);
  assert.equal(new Set(data.stops.map(s=>s.id)).size,data.count);
  for(const s of data.stops){assert.ok(s.name);assert.ok(inTamilNadu(s,boundary),s.name);assert.ok(s.url.startsWith('https://'));}
  assert.equal(inTamilNadu({lat:13.0827,lon:80.2707},boundary),true);
  assert.equal(inTamilNadu({lat:11.0168,lon:76.9558},boundary),true);
  assert.equal(inTamilNadu({lat:9.9252,lon:78.1198},boundary),true);
  assert.equal(inTamilNadu({lat:12.9716,lon:77.5946},boundary),false);
  assert.equal(inTamilNadu({lat:11.93,lon:79.83},boundary),false);
});
