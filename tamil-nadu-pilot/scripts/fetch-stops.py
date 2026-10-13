"""Refresh the bundled Tamil Nadu OSM stop snapshot; no API calls during rides."""
import json
import urllib.request
import urllib.parse
import pathlib
import datetime
import argparse

ROOT = pathlib.Path(__file__).resolve().parents[1]
QUERY = '''[out:json][timeout:180];
area["ISO3166-2"="IN-TN"]["admin_level"="4"]->.tn;
(
 nwr["highway"="bus_stop"](area.tn);
 nwr["amenity"="bus_station"](area.tn);
 nwr["public_transport"="platform"]["bus"="yes"](area.tn);
);out center tags;'''
ENDPOINT = 'https://maps.mail.ru/osm/tools/overpass/api/interpreter'

def fetch(query):
    req = urllib.request.Request(ENDPOINT+'?'+urllib.parse.urlencode({'data':query}), headers={'User-Agent':'WhereIsMyStop-TamilNadu-Pilot/1.0 (one-off stop snapshot)'})
    with urllib.request.urlopen(req, timeout=240) as response:
        data = json.load(response)
    if data.get('remark'):
        raise RuntimeError(data['remark'])
    return data

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--raw',help='Use a previously downloaded Overpass JSON file')
    args=parser.parse_args()
    boundary=json.loads((ROOT/'dist/data/boundary.json').read_text())
    def inside_ring(point,ring):
        x,y=point['lon'],point['lat'];inside=False
        previous=ring[-1]
        for current in ring:
            xi,yi=current;xj,yj=previous
            if (yi>y)!=(yj>y) and x<(xj-xi)*(y-yi)/(yj-yi)+xi:
                inside=not inside
            previous=current
        return inside
    def inside_state(point):
        return any(inside_ring(point,r) for r in boundary['outer']) and not any(inside_ring(point,r) for r in boundary['inner'])
    data = json.loads(pathlib.Path(args.raw).read_text()) if args.raw else fetch(QUERY)
    stops = []
    for el in data['elements']:
        tags = el.get('tags', {})
        point = el.get('center', el)
        if 'lat' not in point or 'lon' not in point:
            continue
        name = tags.get('name:en') or tags.get('name') or tags.get('name:ta')
        if not name:
            continue
        if not inside_state(point):
            continue
        stops.append({'id':f"osm-{el['type']}-{el['id']}", 'name':name, 'ta':tags.get('name:ta',''), 'lat':point['lat'], 'lon':point['lon'], 'area':tags.get('addr:city') or tags.get('addr:district') or '', 'kind':'terminal' if tags.get('amenity')=='bus_station' else 'stop', 'url':f"https://www.openstreetmap.org/{el['type']}/{el['id']}"})
    stops.sort(key=lambda s:s['name'].casefold())
    if len(stops) < 100:
        raise RuntimeError('Unexpectedly small dataset; refusing to replace snapshot.')
    snapshot={'source':'OpenStreetMap contributors', 'license':'ODbL 1.0', 'licenseUrl':'https://www.openstreetmap.org/copyright', 'endpoint':ENDPOINT, 'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(), 'osmTimestamp':data.get('osm3s',{}).get('timestamp_osm_base'), 'query':QUERY, 'boundaryFilter':{'source':boundary['source'],'license':boundary['license']},'count':len(stops), 'stops':stops}
    target=ROOT/'dist/data/stops.json'
    temporary=target.with_suffix('.tmp')
    temporary.write_text(json.dumps(snapshot,ensure_ascii=False,separators=(',',':')))
    temporary.replace(target)
    print(json.dumps({'namedStops':len(stops),'examples':stops[:3]},ensure_ascii=False))

if __name__ == '__main__':
    main()
