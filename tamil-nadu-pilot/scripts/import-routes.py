"""Compile real bus route stop patterns into a static, attributed pilot snapshot.

Usage: python3 scripts/import-routes.py --gtfs /path/mtc-gtfs.zip --osm /path/routes.json
"""
import argparse
import collections
import csv
import datetime
import io
import json
import math
import pathlib
import zipfile

ROOT=pathlib.Path(__file__).resolve().parents[1]
GTFS_SOURCE='https://github.com/ungalsoththu/ChennaiGTFS'
OSM_ENDPOINT='https://maps.mail.ru/osm/tools/overpass/api/interpreter'
OSM_QUERY='[out:json][timeout:180];area["ISO3166-2"="IN-TN"]["admin_level"="4"]->.tn;rel["type"="route"]["route"="bus"](area.tn)->.routes;.routes out body;(node(r.routes);way(r.routes)["public_transport"="platform"];way(r.routes)["highway"="bus_stop"];);out center tags;'

def distance(a,b):
    rad=math.pi/180
    h=math.sin((b['lat']-a['lat'])*rad/2)**2+math.cos(a['lat']*rad)*math.cos(b['lat']*rad)*math.sin((b['lon']-a['lon'])*rad/2)**2
    return 12742000*math.atan2(math.sqrt(h),math.sqrt(max(0,1-h)))

def inside(point,boundary):
    def ring_contains(ring):
        x,y=point['lon'],point['lat']
        if not(min(p[0] for p in ring)<=x<=max(p[0] for p in ring) and min(p[1] for p in ring)<=y<=max(p[1] for p in ring)):return False
        result=False;previous=ring[-1]
        for xi,yi in ring:
            xj,yj=previous
            if(yi>y)!=(yj>y) and x<(xj-xi)*(y-yi)/(yj-yi)+xi:result=not result
            previous=(xi,yi)
        return result
    return any(ring_contains(r) for r in boundary['outer']) and not any(ring_contains(r) for r in boundary['inner'])

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--gtfs',required=True);parser.add_argument('--osm',required=True);args=parser.parse_args()
    boundary=json.loads((ROOT/'dist/data/boundary.json').read_text())
    stops={};routes=[]
    with zipfile.ZipFile(args.gtfs) as archive:
        def rows(name):return csv.DictReader(io.TextIOWrapper(archive.open(name),encoding='utf-8-sig'))
        for s in rows('stops.txt'):
            try:point={'lat':float(s['stop_lat']),'lon':float(s['stop_lon'])}
            except ValueError:continue
            if not s['stop_name'] or not inside(point,boundary):continue
            id='mtc-'+s['stop_id'];stops[id]={'id':id,'name':s['stop_name'],'ta':'','area':'Chennai','kind':'stop',**point,'url':GTFS_SOURCE,'source':'gtfs'}
        definitions={r['route_id']:r for r in rows('routes.txt') if r['route_type']=='3'}
        trips={t['trip_id']:t for t in rows('trips.txt') if t['route_id'] in definitions}
        sequences=collections.defaultdict(list)
        for s in rows('stop_times.txt'):
            id='mtc-'+s['stop_id']
            if s['trip_id'] in trips and id in stops:
                sequences[s['trip_id']].append((int(s['stop_sequence']),id))
        patterns=collections.defaultdict(set)
        for trip_id,sequence in sequences.items():
            ids=tuple(id for _,id in sorted(sequence))
            if len(set(ids))>=2:
                patterns[(trips[trip_id]['route_id'],trips[trip_id].get('direction_id',''))].add(ids)
        seen=set()
        for (route_id,direction),variants in sorted(patterns.items()):
            definition=definitions[route_id]
            for variant in sorted(variants):
                # Identical stop patterns reused by different timetable IDs are one suggestion.
                key=(definition['route_short_name'].strip(),variant)
                if key in seen:continue
                seen.add(key)
                routes.append({'id':f'mtc-route-{route_id}-{direction}-{len(routes)}','ref':definition['route_short_name'].strip() or route_id,'name':definition['route_long_name'],'from':stops[variant[0]]['name'],'to':stops[variant[-1]]['name'],'operator':'MTC','stopIds':list(variant),'source':'gtfs','url':GTFS_SOURCE,'sequenceKnown':True})
    osm=json.loads(pathlib.Path(args.osm).read_text())
    if osm.get('remark'):raise RuntimeError(osm['remark'])
    elements={f"osm-{e['type']}-{e['id']}":e for e in osm['elements'] if e['type']!='relation'}
    for id,e in elements.items():
        tags=e.get('tags',{});point=e.get('center',e)
        name=tags.get('name:en') or tags.get('name') or tags.get('name:ta')
        if not name or 'lat' not in point or not inside(point,boundary):continue
        stops[id]={'id':id,'name':name,'ta':tags.get('name:ta',''),'lat':point['lat'],'lon':point['lon'],'area':tags.get('addr:city',''),'kind':'stop','url':f"https://www.openstreetmap.org/{e['type']}/{e['id']}",'source':'osm'}
    for r in (e for e in osm['elements'] if e['type']=='relation'):
        tags=r.get('tags',{});ids=[]
        for member in r['members']:
            id=f"osm-{member['type']}-{member['ref']}"
            role=member.get('role','');point=elements.get(id,{});point_tags=point.get('tags',{})
            if id not in stops or not(role.startswith(('stop','platform')) or point_tags.get('highway')=='bus_stop'):continue
            if ids and (id==ids[-1] or distance(stops[id],stops[ids[-1]])<45):continue
            ids.append(id)
        if len(set(ids))<2:continue
        routes.append({'id':f"osm-route-{r['id']}",'ref':tags.get('ref') or tags.get('name') or str(r['id']),'name':tags.get('name',''),'from':tags.get('from') or stops[ids[0]]['name'],'to':tags.get('to') or stops[ids[-1]]['name'],'operator':tags.get('operator') or tags.get('network') or 'Community mapped','stopIds':ids,'source':'osm','url':f"https://www.openstreetmap.org/relation/{r['id']}",'sequenceKnown':tags.get('public_transport:version')=='2'})
    used={id for r in routes for id in r['stopIds']};stops={id:s for id,s in stops.items() if id in used}
    snapshot={'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'license':'ODbL 1.0','sources':[{'id':'gtfs','name':'UngalSoththu / ChennaiGTFS','url':GTFS_SOURCE,'download':'https://raw.githubusercontent.com/ungalsoththu/ChennaiGTFS/main/data/mtc-gtfs.zip','license':'ODbL/PDDL dataset declaration; repository code MIT','notice':'Community feed collected from MTC app; not live bus positions or a verified current timetable.'},{'id':'osm','name':'OpenStreetMap contributors','url':'https://www.openstreetmap.org/copyright','endpoint':OSM_ENDPOINT,'query':OSM_QUERY,'timestamp':osm.get('osm3s',{}).get('timestamp_osm_base'),'license':'ODbL 1.0','notice':'Community mapping; route coverage and stop order may be incomplete.'}],'stops':list(stops.values()),'routes':routes,'count':len(routes)}
    (ROOT/'dist/data/routes.json').write_text(json.dumps(snapshot,ensure_ascii=False,separators=(',',':')))
    print(json.dumps({'routes':len(routes),'routeStops':len(stops),'bySource':dict(collections.Counter(r['source'] for r in routes))}))

if __name__=='__main__':main()
