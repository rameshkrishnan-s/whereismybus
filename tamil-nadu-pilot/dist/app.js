import {haversine,inTamilNadu,searchStops,CITIES,BUS_TYPES,regionFor,JourneyTracker,regionAt,nearbyStops,routesNear,stopsOnRoute,destinationMatches,normaliseSearch,parseCoordinates} from './geo.js';

const $=id=>document.getElementById(id);
const I18N={
  en:{journey:'Your journey',saved:'Saved stops',how:'How it works',eyebrow:'A LITTLE LESS WORRY. A BETTER BUS RIDE.',headline:'Enjoy the ride.\nWe’ll watch your stop.',subhead:'Pick your destination. Get a heads-up as you approach.\nYour journey, with one less thing to think about.',nextstop:'YOUR NEXT STOP',peace:'A little peace\nof mind.',choose:'Where are you getting off?',chooseSub:'Set your stop before you settle in.',region:'Search region',destination:'Destination bus stop',pin:'Can’t find it? Pick a point on the map',alertWhen:'Give me a heads-up',fallback:'Distance fallback',estimateNote:'Time is a rough proximity estimate. We’ll also alert inside your chosen distance.',start:'Start my journey',demo:'Try a 30-second demo ride',privacy:'Your location stays on your device. No account needed.',mapLabel:'GET YOUR BEARINGS',openMap:'OpenStreetMap',busStops:'Bus stops',yourLocation:'Your location',readyTitle:'Ready when you are.',readyDetail:'Choose a stop on the left to get started.',distance:'DISTANCE TO STOP',estimate:'ROUGH ESTIMATE',gps:'GPS ACCURACY',end:'End journey',keepOpen:'Keep this page open and your screen on during a real ride.',browserLimit:'Browsers can pause location tracking when locked or in the background. This web pilot cannot promise a wake-up alarm.',testSound:'Test sound',coverage:'Community-mapped stops across Tamil Nadu.',early:'A heads-up, your way',earlySub:'3, 5 or 10 minutes + a distance fallback.',tamilEnglish:'Tamil & English',tamilEnglishSub:'A familiar language for every journey.',how1:'Choose and check your stop',how1Sub:'Search in English or Tamil, or choose a point on the map. Check the side of the road before starting.',how2:'Start after you board',how2Sub:'Allow location access and keep this page visible. We use your phone, not a live bus feed.',how3:'Listen for your heads-up',how3Sub:'The alert uses your approach speed or distance. Road layout and traffic can change the actual arrival time.',dataTitle:'About the data & this pilot',dataLimit:'Community coverage is incomplete and stop positions may be inaccurate. This app is independent of MTC and TNSTC. Map tiles need internet; loaded stops and the alarm work offline while this page stays active.',download:'Download the stop dataset',privacyDetail:'Only saved destinations, preferences and your last 20 ride summaries are kept in this browser. GPS coordinates are never sent to our server. Showing map tiles sends the viewed map area to OpenStreetMap.',export:'Export pilot feedback',erase:'Clear saved stops & feedback',made:'Made for the ride. Starting in Tamil Nadu.',sources:'Data & privacy ↗',acknowledge:'Got it — I’m getting ready',pilotFeedback:'HELP SHAPE THE PILOT',feedbackTitle:'How was the heads-up?',helpful:'Just right',tooEarly:'Too early',tooLate:'Too late / missed',feedbackLocal:'Stored on this device. Export from Data & privacy to share.',placeholder:'Search a stop, e.g. Koyambedu',mapDestination:'Map destination',noResults:'No matching stops. Try All Tamil Nadu or choose a point on the map.',noSaved:'No saved stops yet. Tap the heart beside a destination to save it.',pinInstruction:'Tap the map to choose your destination inside Tamil Nadu.',outside:'That point is outside the Tamil Nadu pilot. Please choose a stop inside the state.',selectFirst:'Choose your destination stop first.',tracking:'Watching your stop',demoTracking:'Demo ride · simulated location',waiting:'Waiting for an accurate location…',moving:'Keep the page visible. Time estimates need movement towards the stop.',stale:'Location updates paused. Keep this page visible and check location access.',poor:'GPS is not accurate enough. Move nearer a window; alerts are paused until accuracy improves.',denied:'Location access was denied. Allow location in your browser settings and start again.',unavailable:'Location is unavailable. Check your phone’s location settings and try again.',timeout:'GPS is taking longer than expected. Still waiting for a fresh location.',unsupported:'This browser does not support location access. You can still try the demo.',insecure:'Real journeys require HTTPS or localhost for location access.',alertTitle:'YOUR STOP IS GETTING CLOSE',demoAlertTitle:'DEMO ALERT · SIMULATED JOURNEY',alreadyNear:'You’re already inside the alert distance. Check the map and get ready.',alarmed:'Heads-up delivered',acknowledged:'Alert acknowledged. Keep watching for your stop.',complete:'Demo complete',completeDetail:'That was a simulated ride. End the journey to leave feedback.',soundPlayed:'Sound played. If you did not hear it, check your media volume.',soundUnavailable:'Sound could not start. Check browser audio permissions; the visual alert still works.',savedMessage:'Destination saved on this device.',unsavedMessage:'Destination removed from saved stops.',feedbackThanks:'Thanks! Your feedback is saved on this device.',emptyExport:'No ride summaries yet. Try a demo or complete a real journey first.',cleared:'Saved stops and pilot feedback cleared.',offline:'You’re offline. Loaded stops and foreground alerts still work; the map may not load.',foreground:'Tracking resumed. Waiting for a fresh GPS fix; background updates may have been missed.',source:'View source ↗',manualSource:'Chosen by you · verify on map',useStop:'Use this stop',demoUnavailable:'The stop dataset is not loaded yet. Wait a moment or reload.',dataError:'Stop data could not load. Reload when connected to the internet.',mapError:'Map tiles could not load. Search and alerts still work; check internet access.',resuming:'Checking location again…',saveLabel:'Save this stop',removeLabel:'Remove saved stop',stopCount:'mapped stops to explore',min:'min',cancelPin:'Cancel map selection',noFeedback:'No alert delivered',alertFeedback:'Alert delivered',simulation:'Demo',realRide:'Real ride',clearConfirm:'Clear all saved stops and ride feedback on this device?',notifyDisabled:'Notifications are unavailable or denied. Keep this page open for sound and the on-screen alert.'},
  ta:{journey:'உங்கள் பயணம்',saved:'சேமித்த நிறுத்தங்கள்',how:'செயல்படும் விதம்',eyebrow:'கவலை குறையட்டும். பயணம் இனிதாகட்டும்.',headline:'பயணத்தை ரசிக்கவும்.\nநிறுத்தத்தை நாங்கள் கவனிக்கிறோம்.',subhead:'இறங்கும் இடத்தைத் தேர்ந்தெடுக்கவும்.\nஅருகில் வரும்போது அறிவிப்பைப் பெறவும்.',nextstop:'உங்கள் அடுத்த நிறுத்தம்',peace:'நிம்மதியான\nபயணம்.',choose:'எங்கே இறங்கப் போகிறீர்கள்?',chooseSub:'பயணத்திற்கு முன் நிறுத்தத்தைத் தேர்ந்தெடுக்கவும்.',region:'தேடும் பகுதி',destination:'இறங்கும் பேருந்து நிறுத்தம்',pin:'கிடைக்கவில்லையா? வரைபடத்தில் தேர்வு செய்க',alertWhen:'முன்கூட்டியே அறிவிக்கவும்',fallback:'தூர அடிப்படையிலான அறிவிப்பு',estimateNote:'நேரம் ஒரு தோராயமான கணிப்பு. தேர்ந்தெடுத்த தூரத்திற்குள் வந்தாலும் அறிவிப்போம்.',start:'என் பயணத்தைத் தொடங்கு',demo:'30 வினாடி சோதனைப் பயணம்',privacy:'உங்கள் இருப்பிடம் உங்கள் சாதனத்திலேயே இருக்கும்.',mapLabel:'உங்கள் இடத்தை அறிக',openMap:'OpenStreetMap',busStops:'நிறுத்தங்கள்',yourLocation:'உங்கள் இருப்பிடம்',readyTitle:'பயணத்திற்குத் தயார்.',readyDetail:'முதலில் இறங்கும் நிறுத்தத்தைத் தேர்வு செய்க.',distance:'நிறுத்தத்திற்கான தூரம்',estimate:'தோராயமான நேரம்',gps:'GPS துல்லியம்',end:'பயணத்தை முடி',keepOpen:'உண்மைப் பயணத்தில் இந்தப் பக்கத்தையும் திரையையும் திறந்து வைக்கவும்.',browserLimit:'திரை பூட்டப்பட்டால் அல்லது வேறு செயலிக்கு மாறினால் இருப்பிடக் கண்காணிப்பு நிற்கலாம். இந்த இணைய சோதனை விழிப்பூட்டலை உறுதி செய்யாது.',testSound:'ஒலியைச் சோதி',coverage:'தமிழ்நாட்டில் சமூகத்தால் பதிவுசெய்யப்பட்ட நிறுத்தங்கள்.',early:'உங்கள் விருப்பப்படி அறிவிப்பு',earlySub:'3, 5 அல்லது 10 நிமிடம் + தூர அறிவிப்பு.',tamilEnglish:'தமிழ் & English',tamilEnglishSub:'உங்கள் மொழியில் உங்கள் பயணம்.',how1:'நிறுத்தத்தைத் தேர்வு செய்து சரிபார்க்கவும்',how1Sub:'தமிழ் அல்லது ஆங்கிலத்தில் தேடவும், அல்லது வரைபடத்தில் தேர்வு செய்யவும். சாலையின் பக்கத்தைச் சரிபார்க்கவும்.',how2:'ஏறிய பிறகு தொடங்கவும்',how2Sub:'இருப்பிட அனுமதி அளித்து இந்தப் பக்கத்தைத் திறந்து வைக்கவும். பேருந்தின் நேரடித் தகவலுக்குப் பதிலாக உங்கள் தொலைபேசியைப் பயன்படுத்துகிறோம்.',how3:'அறிவிப்பைக் கவனிக்கவும்',how3Sub:'அணுகும் வேகம் அல்லது தூரத்தை வைத்து அறிவிப்போம். சாலை அமைப்பும் போக்குவரத்தும் வருகை நேரத்தை மாற்றலாம்.',dataTitle:'தரவு மற்றும் இந்தச் சோதனை பற்றி',dataLimit:'சமூகத் தரவில் சில நிறுத்தங்கள் இல்லாமல் இருக்கலாம்; இடங்கள் தவறாகவும் இருக்கலாம். இது MTC அல்லது TNSTC-யின் அதிகாரப்பூர்வ செயலி அல்ல. வரைபடத்திற்கு இணையம் தேவை. பக்கம் செயலில் இருக்கும்போது ஏற்றிய நிறுத்தங்களும் அறிவிப்பும் இணையமின்றிச் செயல்படும்.',download:'நிறுத்தத் தரவைப் பதிவிறக்கு',privacyDetail:'சேமித்த இடங்கள், விருப்பங்கள், கடைசி 20 பயணச் சுருக்கங்கள் இந்த உலாவியில் மட்டுமே இருக்கும். GPS விவரங்கள் எங்கள் சேவையகத்திற்கு அனுப்பப்படாது. வரைபடம் பார்க்கும்போது அந்தப் பகுதி OpenStreetMap-க்கு அனுப்பப்படும்.',export:'சோதனைக் கருத்துகளைப் பதிவிறக்கு',erase:'சேமித்த தரவை அழி',made:'தமிழ்நாட்டில் தொடங்கும் இனிய பயணம்.',sources:'தரவு & தனியுரிமை ↗',acknowledge:'புரிந்தது — இறங்கத் தயாராகிறேன்',pilotFeedback:'சோதனையை மேம்படுத்த உதவுங்கள்',feedbackTitle:'அறிவிப்பு எப்படி இருந்தது?',helpful:'சரியான நேரம்',tooEarly:'மிகவும் முன்னதாக',tooLate:'தாமதம் / வரவில்லை',feedbackLocal:'இந்தச் சாதனத்தில் சேமிக்கப்படும். தரவு பகுதியில் பதிவிறக்கலாம்.',placeholder:'நிறுத்தத்தைத் தேடுக, எ.கா. Koyambedu',mapDestination:'வரைபடத்தில் தேர்ந்தெடுத்த இடம்',noResults:'நிறுத்தம் கிடைக்கவில்லை. தமிழ்நாடு முழுவதும் தேடவும் அல்லது வரைபடத்தில் தேர்வு செய்யவும்.',noSaved:'சேமித்த நிறுத்தங்கள் இல்லை. நிறுத்தம் அருகிலுள்ள இதயக் குறியைத் தொடவும்.',pinInstruction:'தமிழ்நாட்டிற்குள் உங்கள் இடத்தை வரைபடத்தில் தொடவும்.',outside:'இந்த இடம் தமிழ்நாட்டிற்கு வெளியே உள்ளது. மாநிலத்திற்குள் தேர்வு செய்க.',selectFirst:'முதலில் இறங்கும் நிறுத்தத்தைத் தேர்வு செய்க.',tracking:'உங்கள் நிறுத்தத்தைக் கவனிக்கிறோம்',demoTracking:'சோதனைப் பயணம் · மாதிரி இருப்பிடம்',waiting:'துல்லியமான இருப்பிடத்திற்குக் காத்திருக்கிறோம்…',moving:'பக்கத்தைத் திறந்து வைக்கவும். நிறுத்தத்தை நோக்கி நகரும்போது நேரம் கணிக்கப்படும்.',stale:'இருப்பிடத் தகவல் நின்றுவிட்டது. பக்கத்தைத் திறந்து வைத்து அனுமதியைச் சரிபார்க்கவும்.',poor:'GPS துல்லியம் போதவில்லை. ஜன்னல் அருகில் செல்லவும். துல்லியம் மேம்படும் வரை அறிவிப்பு நிறுத்தப்பட்டுள்ளது.',denied:'இருப்பிட அனுமதி மறுக்கப்பட்டது. உலாவி அமைப்புகளில் அனுமதித்து மீண்டும் தொடங்கவும்.',unavailable:'இருப்பிடம் கிடைக்கவில்லை. தொலைபேசியின் இருப்பிட அமைப்புகளைச் சரிபார்க்கவும்.',timeout:'GPS தகவல் தாமதமாகிறது. புதிய இருப்பிடத்திற்குக் காத்திருக்கிறோம்.',unsupported:'இந்த உலாவி இருப்பிட வசதியை ஆதரிக்கவில்லை. சோதனைப் பயணத்தை முயலலாம்.',insecure:'உண்மைப் பயணத்திற்கு HTTPS அல்லது localhost தேவை.',alertTitle:'உங்கள் நிறுத்தம் அருகில் வருகிறது',demoAlertTitle:'சோதனை அறிவிப்பு · மாதிரி பயணம்',alreadyNear:'அறிவிப்பு தூரத்திற்குள் ஏற்கனவே உள்ளீர்கள். வரைபடத்தைச் சரிபார்த்து தயாராகுங்கள்.',alarmed:'அறிவிப்பு வழங்கப்பட்டது',acknowledged:'அறிவிப்பு ஏற்றுக்கொள்ளப்பட்டது. நிறுத்தத்தைக் கவனிக்கவும்.',complete:'சோதனை முடிந்தது',completeDetail:'இது ஒரு மாதிரிப் பயணம். கருத்து அளிக்கப் பயணத்தை முடிக்கவும்.',soundPlayed:'ஒலி ஒலிக்கப்பட்டது. கேட்கவில்லை என்றால் ஒலி அளவைச் சரிபார்க்கவும்.',soundUnavailable:'ஒலி தொடங்கவில்லை. உலாவி அனுமதியைச் சரிபார்க்கவும்; திரை அறிவிப்பு செயல்படும்.',savedMessage:'இந்தச் சாதனத்தில் இடம் சேமிக்கப்பட்டது.',unsavedMessage:'சேமித்த இடம் நீக்கப்பட்டது.',feedbackThanks:'நன்றி! உங்கள் கருத்து இந்தச் சாதனத்தில் சேமிக்கப்பட்டது.',emptyExport:'பயணச் சுருக்கங்கள் இல்லை. முதலில் ஒரு பயணத்தை முடிக்கவும்.',cleared:'சேமித்த நிறுத்தங்களும் கருத்துகளும் அழிக்கப்பட்டன.',offline:'இணையம் இல்லை. ஏற்றிய நிறுத்தங்களும் திறந்த பக்கத்தில் அறிவிப்பும் செயல்படும்; வரைபடம் ஏறாமல் இருக்கலாம்.',foreground:'மீண்டும் கண்காணிக்கிறோம். புதிய GPS தகவலுக்குக் காத்திருக்கிறோம்.',source:'தரவு மூலத்தைப் பார்க்க ↗',manualSource:'நீங்கள் தேர்ந்தெடுத்த இடம்',useStop:'இந்த நிறுத்தத்தைப் பயன்படுத்து',demoUnavailable:'தரவு இன்னும் ஏறவில்லை. சிறிது காத்திருக்கவும்.',dataError:'நிறுத்தத் தரவு ஏறவில்லை. இணையம் இணைந்ததும் மீண்டும் ஏற்றவும்.',mapError:'வரைபடம் ஏறவில்லை. தேடலும் அறிவிப்பும் செயல்படும்.',resuming:'இருப்பிடத்தை மீண்டும் சரிபார்க்கிறோம்…',saveLabel:'நிறுத்தத்தைச் சேமி',removeLabel:'சேமித்த நிறுத்தத்தை நீக்கு',stopCount:'பதிவுசெய்யப்பட்ட நிறுத்தங்கள்',min:'நிமி',cancelPin:'வரைபடத் தேர்வை ரத்து செய்',noFeedback:'அறிவிப்பு வழங்கப்படவில்லை',alertFeedback:'அறிவிப்பு வழங்கப்பட்டது',simulation:'சோதனை',realRide:'உண்மைப் பயணம்',clearConfirm:'இந்தச் சாதனத்தில் சேமித்த நிறுத்தங்கள் மற்றும் கருத்துகளை அழிக்கவா?',notifyDisabled:'அறிவிப்பு அனுமதி இல்லை. ஒலிக்கும் திரை அறிவிப்பிற்கும் பக்கத்தைத் திறந்து வைக்கவும்.'}
};

function read(key,fallback) {try {return JSON.parse(localStorage.getItem('wims-'+key))??fallback;}catch{return fallback;}}
function write(key,value) {try{localStorage.setItem('wims-'+key,JSON.stringify(value));}catch{}}
const prefs=read('preferences',{});
let lang=prefs.lang==='ta'?'ta':'en',minutes=[3,5,10].includes(prefs.minutes)?prefs.minutes:5,radius=[500,1000,2000].includes(prefs.radius)?prefs.radius:1000;
let dataset=null,boundary=null,selected=null,map=null,destMarker=null,userMarker=null,ring=null,stopLayer=null,pinMode=false,active=null,watchId=null,demoTimer=null,staleTimer=null,wakeLock=null,audioContext=null,alarmTimer=null,swRegistration=null,pendingFeedback=null;
let busType=BUS_TYPES[prefs.busType]?prefs.busType:'town',origin=null,connector=null,roadLayer=null,routeController=null;
let nearbyOrigin=null,manualRegion=false,routeData=null,routeStopMap=new Map(),catalogueStops=[],routeCandidates=[],chosenRoute=null,busRouteLayer=null,locationRequest=0;
if(!prefs.radius)radius=BUS_TYPES[busType].radius;
Object.assign(I18N.en,{boarding:'Boarding from',currentLocation:'Your current location',gpsPrompt:'Use GPS to see the distance to your stop',useGps:'Use GPS',busType:'What bus are you taking?',town:'Town / City bus',express:'Express bus',intercity:'Intercity bus',deluxe:'Deluxe / AC bus',otherBus:'Other bus',distancePreview:'DISTANCE PREVIEW',previewRoad:'Preview road route ↗',roadPrivacy:'Optional: sends start/end points to OSRM. A road preview may differ from your bus route.',straightLine:'straight-line distance',roadDistance:'road distance · preview only',gettingGps:'Finding GPS…',gpsOrigin:'Current GPS location',roadLoading:'Finding road route…',roadUnavailable:'Road preview unavailable. Showing straight-line distance; alerts still work.',privacy:'GPS alerts run on your device. No account needed.',privacyDetail:'Saved destinations, preferences and your last 20 ride summaries stay in this browser. GPS coordinates are never sent to our server. Map tiles send the viewed area to OpenStreetMap. The optional road preview sends your current location and destination to the public OSRM routing service. No GPS history is stored.',busNote:'Bus type sets a suggested alert distance. You can change it below. Stop search includes all mapped stops.',distance:'STRAIGHT-LINE DISTANCE'});
Object.assign(I18N.ta,{boarding:'ஏறும் இடம்',currentLocation:'உங்கள் தற்போதைய இருப்பிடம்',gpsPrompt:'நிறுத்தத்திற்கான தூரம் அறிய GPS பயன்படுத்தவும்',useGps:'GPS பயன்படுத்து',busType:'எந்த வகைப் பேருந்து?',town:'நகரப் பேருந்து',express:'விரைவுப் பேருந்து',intercity:'நகரங்களுக்கு இடையிலான பேருந்து',deluxe:'சொகுசு / AC பேருந்து',otherBus:'மற்ற பேருந்து',distancePreview:'தூர முன்னோட்டம்',previewRoad:'சாலை வழியைப் பார்க்க ↗',roadPrivacy:'விருப்பம்: ஏறும் / இறங்கும் இடங்கள் OSRM-க்கு அனுப்பப்படும். சாலை முன்னோட்டம் பேருந்து வழியிலிருந்து வேறுபடலாம்.',straightLine:'நேர்கோட்டுத் தூரம்',roadDistance:'சாலைத் தூரம் · முன்னோட்டம் மட்டும்',gettingGps:'GPS தேடுகிறது…',gpsOrigin:'தற்போதைய GPS இருப்பிடம்',roadLoading:'சாலை வழி தேடுகிறது…',roadUnavailable:'சாலை முன்னோட்டம் கிடைக்கவில்லை. நேர்கோட்டுத் தூரம் காட்டப்படுகிறது; அறிவிப்புகள் செயல்படும்.',privacy:'GPS அறிவிப்புகள் உங்கள் சாதனத்திலேயே செயல்படும்.',privacyDetail:'சேமித்த இடங்கள், விருப்பங்கள் மற்றும் கடைசி 20 பயணச் சுருக்கங்கள் இந்த உலாவியில் இருக்கும். GPS தகவல் எங்கள் சேவையகத்திற்கு அனுப்பப்படாது. வரைபடப் பகுதி OpenStreetMap-க்கு அனுப்பப்படும். விருப்பச் சாலை முன்னோட்டம் உங்கள் இருப்பிடத்தையும் இலக்கையும் OSRM-க்கு அனுப்பும். GPS வரலாறு சேமிக்கப்படாது.',busNote:'பேருந்து வகை அறிவிப்பு தூரத்தைப் பரிந்துரைக்கும். கீழே மாற்றலாம். தேடலில் எல்லா பதிவுசெய்த நிறுத்தங்களும் இருக்கும்.',distance:'நேர்கோட்டுத் தூரம்'});
Object.assign(I18N.en,{nearbyRoutes:'Routes near your boarding location',allNearby:'All nearby stops',nearbyStops:'Nearby stops · nearest first',backNearby:'Back to nearby',gpsSuggestions:'Use GPS to see nearby stops and mapped routes, or type a destination to search the selected region.',noNearby:'No matching mapped stops within 5 km. Try another search, browse a region, or pick a point on the map.',noRoutes:'No mapped routes with a stop within 1.5 km. Nearby stops are still available. Route coverage is incomplete.',routeStatic:'Mapped routes, not live buses. Check the bus number and direction before boarding.',routeSearch:'Select a route to see its destination stops.',routeStops:'Destination stops on your route',routeUnknownOrder:'Mapped stops on this route; stop order is unverified.',routePast:'No matching onward stops in this direction. Check the route direction or clear your search.',autoRegion:'GPS selected',nearbyRegion:'Nearby in Tamil Nadu',regionBrowse:'Browsing region manually',away:'away',boardingAt:'Board near',stopSequence:'Dashed line: stop sequence, not road geometry.',routeLoadError:'Route data is unavailable. Nearby stop suggestions still work.',busNote:'Bus type suggests an alert distance. Nearby routes use mapped stop locations; service class is not verified.',routesInData:'mapped route patterns',suggestedRadius:'Stops within 5 km; routes with boarding stops within 1.5 km.'});
Object.assign(I18N.ta,{nearbyRoutes:'ஏறும் இடத்திற்கு அருகிலுள்ள வழித்தடங்கள்',allNearby:'அருகிலுள்ள எல்லா நிறுத்தங்களும்',nearbyStops:'அருகிலுள்ள நிறுத்தங்கள் · தூர வரிசையில்',backNearby:'அருகிலுள்ள இடங்களுக்குத் திரும்பு',gpsSuggestions:'அருகிலுள்ள நிறுத்தங்களையும் வழித்தடங்களையும் காண GPS பயன்படுத்தவும், அல்லது இறங்கும் இடத்தைத் தேடவும்.',noNearby:'5 கி.மீ. தூரத்திற்குள் நிறுத்தங்கள் கிடைக்கவில்லை. வேறு பெயரில் தேடவும் அல்லது வரைபடத்தில் தேர்வு செய்யவும்.',noRoutes:'1.5 கி.மீ. தூரத்திற்குள் ஏறும் நிறுத்தமுள்ள பதிவுசெய்த வழித்தடம் இல்லை. அருகிலுள்ள நிறுத்தங்களைத் தேர்வு செய்யலாம். வழித்தடத் தரவு முழுமையானது அல்ல.',routeStatic:'பதிவுசெய்த வழித்தடங்கள்; நேரடிப் பேருந்து இருப்பிடம் அல்ல. பேருந்து எண்ணையும் திசையையும் சரிபார்க்கவும்.',routeSearch:'வழித்தடத்தைத் தேர்வு செய்து இறங்கும் நிறுத்தங்களைக் காணவும்.',routeStops:'உங்கள் வழித்தடத்தில் இறங்கும் நிறுத்தங்கள்',routeUnknownOrder:'இந்த வழித்தடத்தின் நிறுத்தங்கள்; வரிசை உறுதி செய்யப்படவில்லை.',routePast:'இந்தத் திசையில் பொருத்தமான அடுத்த நிறுத்தம் இல்லை. திசையைச் சரிபார்க்கவும் அல்லது தேடலை அழிக்கவும்.',autoRegion:'GPS தேர்ந்தெடுத்த பகுதி',nearbyRegion:'தமிழ்நாட்டில் அருகிலுள்ள இடங்கள்',regionBrowse:'பகுதி கைமுறையாகத் தேர்ந்தெடுக்கப்பட்டது',away:'தூரம்',boardingAt:'ஏறும் இடம் அருகில்',stopSequence:'புள்ளிக்கோடு: நிறுத்த வரிசை; சாலை வழி அல்ல.',routeLoadError:'வழித்தடத் தரவு கிடைக்கவில்லை. அருகிலுள்ள நிறுத்தங்களைக் காணலாம்.',busNote:'பேருந்து வகை அறிவிப்பு தூரத்தைப் பரிந்துரைக்கும். வழித்தடங்கள் பதிவுசெய்த நிறுத்தங்களால் தேர்வு செய்யப்படும்; சேவை வகை உறுதி செய்யப்படவில்லை.',routesInData:'பதிவுசெய்த வழித்தட வடிவங்கள்',suggestedRadius:'5 கி.மீ. தூரத்திலுள்ள நிறுத்தங்கள்; 1.5 கி.மீ. தூரத்திற்குள் ஏறும் நிறுத்தமுள்ள வழித்தடங்கள்.'});
Object.assign(I18N.en,{enterManual:'Enter boarding location manually',manualPlace:'Boarding stop or city',manualPlaceholder:'e.g. Tirupur old bus stand',pickOrigin:'Pick boarding point on map',coordinates:'Or enter latitude, longitude',setLocation:'Set location',manualNote:'Choose a location for planning. Live stop alerts use your phone’s GPS after you start.',manualOrigin:'Manual boarding location',manualSelected:'Boarding location selected',manualPin:'Boarding point on map',coordinateOrigin:'Entered coordinates',manualPrompt:'Type a city or boarding stop and choose a match.',manualNoResults:'No mapped place matches. Try a shorter name, a map point, or coordinates.',coordinateError:'Enter valid latitude, longitude, e.g. 11.09818, 77.34826.',originOutside:'Choose a boarding location inside Tamil Nadu.',originPinInstruction:'Tap the map to set your boarding location inside Tamil Nadu.',cancelOriginPin:'Cancel boarding map selection',cityPoint:'Region centre · check the map',destinationHint:'Type a destination anywhere in Tamil Nadu. A selected route shows only its stops.',statewideResults:'Matching destinations · all Tamil Nadu',searchAll:'Search all Tamil Nadu stops',noResults:'No matching stops in Tamil Nadu. Try a shorter name or choose a point on the map.',region:'Map region',gpsSuggestions:'Set your boarding location with GPS or enter it manually, or type a destination anywhere in Tamil Nadu.'});
Object.assign(I18N.ta,{enterManual:'ஏறும் இடத்தைக் கைமுறையாக உள்ளிடு',manualPlace:'ஏறும் நிறுத்தம் அல்லது நகரம்',manualPlaceholder:'எ.கா. திருப்பூர் பழைய பேருந்து நிலையம்',pickOrigin:'ஏறும் இடத்தை வரைபடத்தில் தேர்வு செய்',coordinates:'அல்லது அட்சரேகை, தீர்க்கரேகை உள்ளிடு',setLocation:'இடத்தை அமை',manualNote:'பயணத் திட்டத்திற்கு இடத்தைத் தேர்வு செய்யவும். பயணத்தைத் தொடங்கியதும் அறிவிப்புகளுக்கு உங்கள் கைப்பேசியின் GPS பயன்படும்.',manualOrigin:'கைமுறையாகத் தேர்ந்தெடுத்த ஏறும் இடம்',manualSelected:'ஏறும் இடம் தேர்ந்தெடுக்கப்பட்டது',manualPin:'வரைபடத்தில் ஏறும் இடம்',coordinateOrigin:'உள்ளிட்ட ஆயத்தொலைவுகள்',manualPrompt:'நகரம் அல்லது ஏறும் நிறுத்தத்தை உள்ளிட்டு பொருத்தமான இடத்தைத் தேர்வு செய்யவும்.',manualNoResults:'பொருத்தமான இடம் இல்லை. குறுகிய பெயரில் தேடவும் அல்லது வரைபடம் / ஆயத்தொலைவுகளைப் பயன்படுத்தவும்.',coordinateError:'சரியான அட்சரேகை, தீர்க்கரேகையை உள்ளிடவும். எ.கா. 11.09818, 77.34826.',originOutside:'தமிழ்நாட்டுக்குள் ஏறும் இடத்தைத் தேர்வு செய்யவும்.',originPinInstruction:'ஏறும் இடத்தை அமைக்க தமிழ்நாட்டுக்குள் வரைபடத்தில் தட்டவும்.',cancelOriginPin:'ஏறும் இடத் தேர்வை ரத்து செய்',cityPoint:'பகுதி மையம் · வரைபடத்தைச் சரிபார்',destinationHint:'தமிழ்நாட்டில் எங்குள்ள இலக்கையும் தேடலாம். தேர்ந்தெடுத்த வழித்தடத்தின் நிறுத்தங்கள் மட்டும் காட்டப்படும்.',statewideResults:'பொருத்தமான இலக்குகள் · தமிழ்நாடு முழுவதும்',searchAll:'தமிழ்நாடு முழுவதும் நிறுத்தங்களைத் தேடு',noResults:'பொருத்தமான நிறுத்தம் இல்லை. குறுகிய பெயரில் தேடவும் அல்லது வரைபடத்தில் தேர்வு செய்யவும்.',region:'வரைபடப் பகுதி',gpsSuggestions:'GPS அல்லது கைமுறையாக ஏறும் இடத்தை அமைக்கவும், அல்லது தமிழ்நாட்டில் எங்குள்ள இலக்கையும் தேடவும்.'});
let watchGeneration=0,gpsFailureReason=null,gpsRetryMode='journey';
Object.assign(I18N.en,{gpsWaitingTitle:'Waiting for live GPS',gpsPausedTitle:'Live location unavailable',gpsPausedDetail:'Stop alerts are paused until a fresh, accurate location arrives.',retryGps:'Retry GPS',backPlanning:'Return to planning',gpsHelp:'Enable location on your device and allow location for this site in your browser, then retry. If this browser still cannot locate you, try opening the app in your phone’s browser. You can keep planning with a manual location.',unavailable:'Your browser could not provide a current location.',timeout:'A fresh GPS location has not arrived yet.',denied:'Location permission was denied. Allow location for this site in your browser settings, then retry.'});
Object.assign(I18N.ta,{gpsWaitingTitle:'நேரடி GPS இருப்பிடத்திற்காகக் காத்திருக்கிறது',gpsPausedTitle:'நேரடி இருப்பிடம் கிடைக்கவில்லை',gpsPausedDetail:'புதிய துல்லியமான இருப்பிடம் கிடைக்கும் வரை நிறுத்த அறிவிப்புகள் இடைநிறுத்தப்பட்டுள்ளன.',retryGps:'GPS மீண்டும் முயற்சி',backPlanning:'பயணத் திட்டத்திற்குத் திரும்பு',gpsHelp:'சாதனத்தில் இருப்பிடத்தை இயக்கி, இந்தத் தளத்திற்கு உலாவியில் இருப்பிட அனுமதி அளித்து மீண்டும் முயற்சிக்கவும். இருப்பிடம் கிடைக்கவில்லை என்றால் கைப்பேசி உலாவியில் திறந்து பார்க்கவும். கைமுறை இருப்பிடத்துடன் பயணத் திட்டத்தைத் தொடரலாம்.',unavailable:'உலாவியால் தற்போதைய இருப்பிடத்தைக் கண்டறிய முடியவில்லை.',timeout:'புதிய GPS இருப்பிடம் இன்னும் கிடைக்கவில்லை.',denied:'இருப்பிட அனுமதி மறுக்கப்பட்டது. உலாவி அமைப்புகளில் இந்தத் தளத்திற்கு அனுமதி அளித்து மீண்டும் முயற்சிக்கவும்.'});
const t=key=>I18N[lang][key]||key;
const saved=()=>read('saved',[]).filter(s=>s&&typeof s.name==='string'&&Number.isFinite(s.lat)&&Number.isFinite(s.lon)&&s.id&&(!boundary||inTamilNadu(s,boundary))).slice(0,20);
function text(el,value){el.textContent=value;}
function msg(value,success=false){delete $('message').dataset.gpsError;text($('message'),value);$('message').hidden=false;$('message').classList.toggle('success',success);}
function savePrefs(){write('preferences',{lang,minutes,radius,busType,city:$('city').value||'chennai'});}
function formatDistance(m){return m<1000?`${Math.round(m/10)*10} m`:`${(m/1000).toFixed(1)} km`;}
function destinationName(s){return lang==='ta'&&s.ta?s.ta:s.name;}
function applyLanguage(){
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{const value=t(el.dataset.i18n);el.replaceChildren(...value.split('\n').flatMap((part,i)=>i?[document.createElement('br'),document.createTextNode(part)]:[document.createTextNode(part)]));});
  text($('language'),lang==='en'?'தமிழ் ↔ EN':'EN ↔ தமிழ்');$('language').setAttribute('aria-label',lang==='en'?'Switch to Tamil':'Switch to English');
  $('search').placeholder=t('placeholder');$('origin-search').placeholder=t('manualPlaceholder');renderManualResults();updatePinMode();
  for(const option of $('city').options){const c=CITIES.find(c=>c.id===option.value);text(option,lang==='ta'?c.ta:c.name);}
  document.querySelectorAll('[data-minutes] span').forEach(el=>text(el,t('min')));
  if(dataset){text($('stop-count'),`${dataset.count.toLocaleString('en-IN')} ${t('stopCount')}`);renderResults();renderData();}
  if(selected)renderSelected();
  if(active)renderJourneyState();else if(gpsFailureReason){text($('journey-title'),t('gpsPausedTitle'));text($('journey-detail'),t(gpsFailureReason));}
  if(gpsFailureReason&&$('message').dataset.gpsError)text($('message'),t(gpsFailureReason));
  renderSaved();savePrefs();
  text($('bus-type-note'),t('busNote'));if(origin)renderOrigin();if(origin&&selected)updateDistancePreview();
  renderRouteOptions();renderLocationContext();
}

function renderResults(){
  const root=$('results');root.replaceChildren();if(!dataset)return;
  const query=$('search').value;
  let matches=[];
  if(chosenRoute)matches=stopsOnRoute(chosenRoute,routeStopMap,query);
  else if(query.trim())matches=destinationMatches(catalogueStops,query,nearbyOrigin);
  else if(nearbyOrigin&&!manualRegion)matches=nearbyStops(catalogueStops,nearbyOrigin);
  $('search-all').hidden=!chosenRoute||!query.trim()||matches.length>0;
  $('search-all').disabled=!!active;
  text($('suggestions-label'),chosenRoute?t('routeStops'):query.trim()?t('statewideResults'):t('nearbyStops'));
  text($('suggestions-count'),matches.length?String(matches.length):'');
  if(!matches.length){const p=document.createElement('p');p.className='empty';text(p,t(chosenRoute?'routePast':query.trim()?'noResults':nearbyOrigin&&!manualRegion?'noNearby':'gpsSuggestions'));root.append(p);return;}
  for(const {stop:s,distance,sequence} of matches.slice(0,60)){const button=document.createElement('button');button.className='result';button.dataset.stopId=s.id;if(Number.isFinite(distance))button.dataset.distance=String(Math.round(distance));button.disabled=!!active;button.classList.toggle('selected-result',selected?.id===s.id);const icon=document.createElement('span');icon.textContent=sequence?String(sequence):'⌖';const div=document.createElement('div');const strong=document.createElement('strong');text(strong,destinationName(s));const small=document.createElement('small');const metric=Number.isFinite(distance)?`${formatDistance(distance)} ${t('away')} · `:'';text(small,`${metric}${s.source==='gtfs'?'MTC · ':''}${regionFor(s)} · ${s.lat.toFixed(4)}, ${s.lon.toFixed(4)}`);div.append(strong,small);const arrow=document.createElement('span');arrow.className='result-arrow';arrow.textContent='↗';button.append(icon,div,arrow);button.addEventListener('click',()=>selectStop(s));root.append(button);}
}
function renderLocationContext(){
  $('location-context').hidden=!nearbyOrigin;
  if(!nearbyOrigin)return;
  const city=CITIES.find(c=>c.id===$('city').value);
  text($('location-context-text'),manualRegion?t('regionBrowse'):`${t(nearbyOrigin.source==='manual'?'manualSelected':'autoRegion')}: ${city.id==='all'?t('nearbyRegion'):lang==='ta'?city.ta:city.name}`);
  $('reset-nearby').hidden=!manualRegion;$('reset-nearby').disabled=!!active;
}
function refreshRouteCandidates(){
  if(!routeData||!nearbyOrigin||manualRegion){routeCandidates=[];return;}
  routeCandidates=routesNear(routeData.routes,routeStopMap,nearbyOrigin);
  if(chosenRoute){const match=routeCandidates.find(c=>c.route.id===chosenRoute.route.id);chosenRoute=match||null;}
}
function renderRouteOptions(){
  $('nearby-routes').hidden=!nearbyOrigin||manualRegion;
  const select=$('route-select');select.replaceChildren();const all=document.createElement('option');all.value='';text(all,t('allNearby'));select.append(all);
  for(const c of routeCandidates){const option=document.createElement('option');option.value=c.route.id;text(option,`${c.route.ref} · ${c.route.from} → ${c.route.to} · ${formatDistance(c.distance)}`);select.append(option);}
  select.value=chosenRoute?.route.id||'';select.disabled=!!active||!routeCandidates.length;
  text($('route-status'),!routeData?t('routeLoadError'):routeCandidates.length?`${routeCandidates.length} · ${t('routeStatic')}`:t('noRoutes'));
  $('route-detail').hidden=!chosenRoute;
  if(chosenRoute){const r=chosenRoute.route;text($('route-direction'),`${r.ref} · ${r.from} → ${r.to}`);text($('route-boarding'),`${t('boardingAt')} ${destinationName(chosenRoute.boardingStop)} · ${formatDistance(chosenRoute.distance)} ${t('away')}. ${t(r.sequenceKnown?'stopSequence':'routeUnknownOrder')}`);$('route-source').href=r.url;text($('route-source'),t('source'));}
}
function drawBusRoute(){
  if(busRouteLayer)busRouteLayer.remove();busRouteLayer=null;
  if(!map||!chosenRoute)return;
  const points=chosenRoute.route.stopIds.map(id=>routeStopMap.get(id)).filter(Boolean).map(s=>[s.lat,s.lon]);
  if(chosenRoute.route.sequenceKnown&&points.length>1)busRouteLayer=L.polyline(points,{color:'#1d5949',weight:3,dashArray:'7 6',opacity:.8,interactive:false}).addTo(map);
  if(points.length)map.fitBounds(L.latLngBounds(points),{padding:[35,100]});
}
function applyLocationSuggestions(fix,{clearSearch=false}={}){
  nearbyOrigin={...fix};manualRegion=false;$('city').value=regionAt(fix).id;
  if(clearSearch){$('search').value='';$('clear-search').hidden=true;}
  refreshRouteCandidates();renderLocationContext();renderRouteOptions();renderResults();visibleStops();savePrefs();
  if(!selected)text($('map-title'),regionAt(fix).id==='all'?t('nearbyRegion'):regionAt(fix).name.replace(' region','')+', Tamil Nadu');
}
function clearDestination(){
  selected=null;$('selected').hidden=true;$('start').disabled=true;
  destMarker?.remove();destMarker=null;ring?.remove();ring=null;connector?.remove();connector=null;clearRoadPreview();$('route-preview').hidden=true;
  text($('journey-title'),t('readyTitle'));text($('journey-detail'),t('readyDetail'));
}
function renderSelected(){
  $('selected').hidden=false;text($('selected-name'),destinationName(selected));text($('selected-meta'),`${regionFor(selected)} · ${selected.lat.toFixed(4)}, ${selected.lon.toFixed(4)}`);
  text($('selected-source'),selected.kind==='custom'?t('manualSource'):t('source'));
  $('selected-source').href=selected.url||`https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lon}#map=17/${selected.lat}/${selected.lon}`;
  const isSaved=saved().some(s=>s.id===selected.id);text($('save-stop'),isSaved?'♥':'♡');$('save-stop').classList.toggle('saved',isSaved);$('save-stop').setAttribute('aria-label',t(isSaved?'removeLabel':'saveLabel'));
}
function selectStop(s){
  if(active)return;
  if(!boundary||!inTamilNadu(s,boundary)){msg(t('outside'));return;}
  if(chosenRoute&&!chosenRoute.route.stopIds.includes(s.id)){chosenRoute=null;drawBusRoute();renderRouteOptions();}
  selected=s;pinMode=false;updatePinMode();renderSelected();renderResults();$('start').disabled=false;$('message').hidden=true;
  clearRoadPreview();
  text($('journey-title'),destinationName(s));text($('journey-detail'),lang==='ta'?`${minutes} நிமிட தோராயக் கணிப்பு அல்லது ${formatDistance(radius)} தூர அறிவிப்பு.`:`A heads-up at roughly ${minutes} min, or within ${formatDistance(radius)}.`);
  if(map){if(destMarker)destMarker.remove();destMarker=L.marker([s.lat,s.lon],{icon:L.divIcon({className:'',html:'<div class="stop-pin">↓</div>',iconSize:[28,34],iconAnchor:[14,34]})}).addTo(map);destMarker.bindTooltip(destinationName(s),{direction:'top'});map.setView([s.lat,s.lon],15);drawRadius();text($('map-title'),regionFor(s)+', Tamil Nadu');}
  updateDistancePreview();if(origin&&map)map.fitBounds([[origin.lat,origin.lon],[s.lat,s.lon]],{padding:[60,90]});
}
function drawRadius(){if(!map||!selected)return;if(ring)ring.remove();ring=L.circle([selected.lat,selected.lon],{radius,color:'#60825d',weight:1,dashArray:'5 6',fillColor:'#82986c',fillOpacity:.08,interactive:false}).addTo(map);}
function updatePinMode(){
  $('map').classList.toggle('pin-mode',!!pinMode);$('pick-pin').classList.toggle('armed',pinMode==='destination');
  text($('pick-pin').children[1],t(pinMode==='destination'?'cancelPin':'pin'));
  $('pick-origin').classList.toggle('armed',pinMode==='origin');text($('pick-origin'),t(pinMode==='origin'?'cancelOriginPin':'pickOrigin'));
}
function renderManualResults(){
  const root=$('origin-results');root.replaceChildren();
  const query=$('origin-search').value;
  if(!query.trim()){const p=document.createElement('p');p.className='empty';text(p,t('manualPrompt'));root.append(p);return;}
  const tokens=normaliseSearch(query).split(' ');
  const cities=CITIES.slice(1).filter(c=>tokens.every(token=>normaliseSearch(c.name+' '+c.ta).includes(token))).map(c=>({...c,name:c.name.replace(' region',''),kind:'city'}));
  const matches=[...cities,...destinationMatches(catalogueStops,query,nearbyOrigin).map(x=>x.stop)].slice(0,20);
  if(!matches.length){const p=document.createElement('p');p.className='empty';text(p,t('manualNoResults'));root.append(p);return;}
  for(const s of matches){const button=document.createElement('button');button.className='result origin-result';button.dataset.stopId=s.id;button.disabled=!!active;
    const icon=document.createElement('span');icon.textContent='⌖';const div=document.createElement('div');const strong=document.createElement('strong'),small=document.createElement('small');text(strong,destinationName(s));text(small,`${s.kind==='city'?t('cityPoint'):regionFor(s)} · ${s.lat.toFixed(4)}, ${s.lon.toFixed(4)}`);div.append(strong,small);button.append(icon,div);button.addEventListener('click',()=>setManualOrigin(s));root.append(button);
  }
}
function setManualOrigin(point){
  if(active||!boundary)return;
  if(!inTamilNadu(point,boundary)){$('origin-error').hidden=false;text($('origin-error'),t('originOutside'));msg(t('originOutside'));return;}
  locationRequest++;$('get-location').disabled=false;text($('get-location'),t('useGps'));
  origin={lat:point.lat,lon:point.lon,name:point.name||I18N.en.manualPin,ta:point.ta||(!point.name?I18N.ta.manualPin:''),source:'manual',timestamp:Date.now()};
  pinMode=false;updatePinMode();chosenRoute=null;drawBusRoute();clearRoadPreview();renderOrigin();setUserMarker(origin);updateDistancePreview();applyLocationSuggestions(origin);
  $('manual-location').hidden=true;$('manual-location-toggle').setAttribute('aria-expanded','false');$('origin-error').hidden=true;$('message').hidden=true;
  if(map)map.setView([origin.lat,origin.lon],14);
}

function visibleStops(){
  if(!map||!dataset||!stopLayer)return;
  stopLayer.clearLayers();const bounds=map.getBounds();
  const pool=chosenRoute?chosenRoute.route.stopIds.map(id=>routeStopMap.get(id)).filter(Boolean):catalogueStops;
  const visible=pool.filter(s=>bounds.contains([s.lat,s.lon]));
  if(nearbyOrigin)visible.sort((a,b)=>haversine(nearbyOrigin,a)-haversine(nearbyOrigin,b));
  const stops=visible.slice(0,200);
  for(const s of stops){const marker=L.circleMarker([s.lat,s.lon],{radius:4,color:'#fff',weight:1,fillColor:'#749069',fillOpacity:.9}).addTo(stopLayer);
    const popup=document.createElement('div');const strong=document.createElement('strong');text(strong,destinationName(s));const button=document.createElement('button');text(button,t('useStop'));button.addEventListener('click',()=>{selectStop(s);map.closePopup();});popup.append(strong,document.createElement('br'),button);marker.bindPopup(popup);}
}
function initMap(){
  if(!window.L){$('map-fallback').hidden=false;return;}
  map=L.map('map',{zoomControl:false,minZoom:6,maxZoom:19}).setView([13.072,80.228],12);
  L.control.zoom({position:'bottomright'}).addTo(map);
  const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
  let tileErrors=0;tiles.on('tileerror',()=>{tileErrors++;if(tileErrors===5)msg(t('mapError'));});tiles.on('tileload',()=>{tileErrors=0;});
  stopLayer=L.layerGroup().addTo(map);map.on('moveend',visibleStops);
  map.on('click',e=>{if(!pinMode||active||!boundary)return;if(pinMode==='origin'){setManualOrigin({lat:e.latlng.lat,lon:e.latlng.lng});return;}selectStop({id:`pin-${e.latlng.lat.toFixed(5)}-${e.latlng.lng.toFixed(5)}`,name:t('mapDestination'),ta:'வரைபடத்தில் தேர்ந்தெடுத்த இடம்',lat:e.latlng.lat,lon:e.latlng.lng,kind:'custom',area:'Tamil Nadu'});});
}
function setUserMarker(fix){if(!map)return;const position=[fix.lat,fix.lon];if(!userMarker)userMarker=L.marker(position,{icon:L.divIcon({className:'',html:'<div class="person-pin"></div>',iconSize:[16,16],iconAnchor:[8,8]})}).addTo(map);else userMarker.setLatLng(position);}
function renderOrigin(){
  const manual=origin.source==='manual'&&!active?.demo;
  text($('origin-label'),active?.demo?t('demoTracking'):manual?(lang==='ta'&&origin.ta?origin.ta:origin.name):t('gpsOrigin'));
  text($('origin-meta'),`${manual?t('manualOrigin')+' · ':''}${origin.lat.toFixed(4)}, ${origin.lon.toFixed(4)}${origin.accuracy?` · ±${Math.round(origin.accuracy)} m`:''}`);
}
function clearRoadPreview(){routeController?.abort();routeController=null;if(roadLayer)roadLayer.remove();roadLayer=null;text($('preview-note'),t('roadPrivacy'));$('preview-road').disabled=!!active||!origin||!selected;text($('preview-road'),t('previewRoad'));}
function updateDistancePreview(){
  $('route-preview').hidden=!origin||!selected;
  if(!origin||!selected)return;
  if(!roadLayer)text($('preview-distance'),`${formatDistance(haversine(origin,selected))} · ${t('straightLine')}`);
  $('preview-road').disabled=!!active;
  if(map){if(connector)connector.remove();connector=L.polyline([[origin.lat,origin.lon],[selected.lat,selected.lon]],{color:'#448fc9',weight:2,dashArray:'5 7',opacity:.7,interactive:false}).addTo(map);}
}
function getCurrentLocation(){
  if(active)return;
  if(!navigator.geolocation){msg(t('unsupported'));return;}
  const request=++locationRequest;
  $('get-location').disabled=true;text($('get-location'),t('gettingGps'));
  navigator.geolocation.getCurrentPosition(p=>{
    if(request!==locationRequest)return;
    const fix={lat:p.coords.latitude,lon:p.coords.longitude,accuracy:p.coords.accuracy,timestamp:p.timestamp,source:'gps'};
    $('get-location').disabled=!!active;text($('get-location'),t('useGps'));
    if(![fix.lat,fix.lon,fix.accuracy,fix.timestamp].every(Number.isFinite)||Math.abs(fix.lat)>90||Math.abs(fix.lon)>180||fix.accuracy<0||fix.accuracy>100||Date.now()-fix.timestamp>20000||fix.timestamp-Date.now()>5000){msg(t('poor'));return;}
    origin=fix;clearRoadPreview();renderOrigin();setUserMarker(origin);updateDistancePreview();
    if(!active){chosenRoute=null;drawBusRoute();applyLocationSuggestions(origin,{clearSearch:true});}
    if(map)map.setView([origin.lat,origin.lon],14);
    $('message').hidden=true;
  },e=>{if(request!==locationRequest)return;$('get-location').disabled=!!active;text($('get-location'),t('useGps'));msg(t(e.code===1?'denied':'unavailable'));},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
}
async function previewRoad(){
  if(!origin||!selected||active)return;
  clearRoadPreview();const from={...origin},to={...selected};routeController=new AbortController();const controller=routeController;const timeout=setTimeout(()=>controller.abort(),12000);$('preview-road').disabled=true;text($('preview-road'),t('roadLoading'));
  try{const response=await fetch(`https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=simplified&geometries=geojson&steps=false`,{signal:controller.signal});if(!response.ok)throw Error('Routing unavailable');const data=await response.json();const route=data.routes?.[0];if(data.code!=='Ok'||!route?.geometry?.coordinates?.length||!Number.isFinite(route.distance))throw Error('No route');if(active||selected?.id!==to.id||routeController!==controller)return;if(map)roadLayer=L.geoJSON(route.geometry,{style:{color:'#327db1',weight:4,opacity:.8}}).addTo(map);text($('preview-distance'),`${formatDistance(route.distance)} · ${t('roadDistance')}`);text($('preview-note'),t('roadPrivacy'));if(map&&roadLayer)map.fitBounds(roadLayer.getBounds(),{padding:[45,110]});}catch{if(routeController===controller&&!active){msg(t('roadUnavailable'));updateDistancePreview();}}finally{clearTimeout(timeout);if(routeController===controller){routeController=null;$('preview-road').disabled=!!active;text($('preview-road'),t('previewRoad'));}}
}
async function unlockAudio(){try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();await audioContext.resume();}catch{return false;}return true;}
function beep(){try{if(!audioContext||audioContext.state!=='running')return false;for(let i=0;i<3;i++){const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),start=audioContext.currentTime+i*.28;oscillator.type='sine';oscillator.frequency.setValueAtTime(i===1?880:660,start);gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.17,start+.025);gain.gain.exponentialRampToValueAtTime(.001,start+.23);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(start);oscillator.stop(start+.25);}return true;}catch{return false;}}
function silence(){if(alarmTimer)clearInterval(alarmTimer);alarmTimer=null;navigator.vibrate?.(0);}
async function lockScreen(){if(active&&!active.demo&&document.visibilityState==='visible'&&navigator.wakeLock){try{wakeLock=await navigator.wakeLock.request('screen');}catch{}}}
function setBusy(busy){$('start').disabled=busy||!selected;$('demo').disabled=busy||!dataset;$('city').disabled=busy||!dataset;$('search').disabled=busy||!dataset;$('pick-pin').disabled=busy||!boundary;$('radius').disabled=busy;$('bus-type').disabled=busy;$('get-location').disabled=busy;$('preview-road').disabled=busy||!origin||!selected;$('route-select').disabled=busy||!routeCandidates.length;$('reset-nearby').disabled=busy;['manual-location-toggle','origin-search','origin-coordinates','set-origin-coordinates','pick-origin','locate'].forEach(id=>$(id).disabled=busy||!boundary);renderManualResults();document.querySelectorAll('[data-minutes]').forEach(b=>b.disabled=busy);renderResults();}

function stopGpsWatch(){
  watchGeneration++;
  if(watchId!==null){navigator.geolocation.clearWatch(watchId);watchId=null;}
}
function renderJourneyState(){
  if(!active)return;
  const pending=!active.demo&&active.locationState!=='live';
  $('live-dot').classList.toggle('gps-pending',pending);
  $('live-dot').style.background=pending?'#db8b50':'#61a074';
  const title=active.demoFinished?'complete':pending?(active.locationState==='paused'?'gpsPausedTitle':'gpsWaitingTitle'):active.alertAt?'alarmed':active.demo?'demoTracking':'tracking';
  text($('journey-title'),t(title));
  const detail=active.demoFinished?'completeDetail':pending?(active.gpsReason||'waiting'):active.acknowledged?'acknowledged':'moving';
  text($('journey-detail'),t(detail)+(active.locationState==='paused'?` ${t('gpsPausedDetail')}`:''));
}
function pauseGps(reason){
  if(!active||active.demo)return;
  active.locationState='paused';active.gpsReason=reason;active.tracker.samples=[];
  gpsFailureReason=reason;gpsRetryMode='journey';$('gps-recovery').hidden=false;
  ['distance-value','eta-value','accuracy-value'].forEach(id=>text($(id),'—'));$('progress-fill').style.width='0%';
  renderJourneyState();msg(t(reason));$('message').dataset.gpsError='true';
}
function beginGpsWatch(){
  if(!active||active.demo)return;
  stopGpsWatch();const generation=watchGeneration,ride=active;
  active.locationState='waiting';active.gpsReason='waiting';active.gpsRequestedAt=Date.now();active.tracker.samples=[];
  gpsFailureReason=null;$('gps-recovery').hidden=true;
  ['distance-value','eta-value','accuracy-value'].forEach(id=>text($(id),'—'));renderJourneyState();
  if($('message').dataset.gpsError){$('message').hidden=true;delete $('message').dataset.gpsError;}
  try{
    const id=navigator.geolocation.watchPosition(p=>{
      if(active!==ride||generation!==watchGeneration)return;
      receiveFix({lat:p.coords.latitude,lon:p.coords.longitude,accuracy:p.coords.accuracy,timestamp:p.timestamp});
    },err=>{
      if(active!==ride||generation!==watchGeneration)return;
      if(err.code===1){endJourney(false);gpsFailureReason='denied';gpsRetryMode='journey';$('gps-recovery').hidden=false;text($('journey-title'),t('gpsPausedTitle'));text($('journey-detail'),t('denied'));msg(t('denied'));$('message').dataset.gpsError='true';return;}
      pauseGps(err.code===3?'timeout':'unavailable');
    },{enableHighAccuracy:true,maximumAge:0,timeout:20000});
    if(active!==ride||generation!==watchGeneration)navigator.geolocation.clearWatch(id);else watchId=id;
  }catch{pauseGps('unavailable');}
}
async function startJourney(demo=false){
  if(active)return;
  if(demo&&!selected){const s=dataset?.stops.find(s=>/koyambedu/i.test(s.name))||dataset?.stops[0];if(!s){msg(t('demoUnavailable'));return;}selectStop(s);}
  if(!selected){msg(t('selectFirst'));return;}
  if(!demo&&!window.isSecureContext){msg(t('insecure'));return;}
  if(!demo&&!navigator.geolocation){msg(t('unsupported'));return;}
  locationRequest++;
  active={demo,tracker:new JourneyTracker(selected,{minutes,radius}),startedAt:Date.now(),lastFix:null,alertAt:null,alertDistance:null,acknowledged:false,demoFinished:false,previousOrigin:origin,locationState:'waiting',gpsReason:'waiting',gpsRequestedAt:Date.now()};
  gpsFailureReason=null;$('gps-recovery').hidden=true;
  clearRoadPreview();
  pinMode=false;updatePinMode();$('manual-location').hidden=true;$('manual-location-toggle').setAttribute('aria-expanded','false');setBusy(true);$('message').hidden=true;$('end').hidden=false;$('journey-metrics').hidden=false;$('progress-track').hidden=false;$('live-dot').hidden=false;renderJourneyState();['distance-value','eta-value','accuracy-value'].forEach(id=>text($(id),'—'));$('progress-fill').style.width='0%';
  await unlockAudio();
  if(!active)return;
  if(demo){startDemo();return;}
  lockScreen();
  if('Notification' in window&&Notification.permission==='default'){Notification.requestPermission().catch(()=>{});}
  beginGpsWatch();
  if(!active)return;
  staleTimer=setInterval(()=>{
    if(!active||active.demo)return;
    if(active.locationState==='live'&&Date.now()-active.lastFix>20000)pauseGps('stale');
    else if(active.locationState==='waiting'&&Date.now()-active.gpsRequestedAt>20000)pauseGps('timeout');
  },5000);
  if(window.matchMedia('(max-width:760px)').matches)$('journey-card').scrollIntoView({behavior:'smooth',block:'center'});
}
function receiveFix(fix,now=Date.now()){
  if(!active)return;
  if(!active.demo&&active.lastAcceptedTimestamp!==undefined&&fix.timestamp<=active.lastAcceptedTimestamp){pauseGps('stale');return;}
  const result=active.tracker.update(fix,now);
  if(!result.valid){if(!active.demo)pauseGps(result.reason==='accuracy'?'poor':'stale');return;}
  active.lastAcceptedTimestamp=fix.timestamp;active.locationState='live';active.gpsReason=null;gpsFailureReason=null;$('gps-recovery').hidden=true;renderJourneyState();
  if($('message').dataset.gpsError){$('message').hidden=true;delete $('message').dataset.gpsError;}
  active.lastFix=Date.now();$('live-dot').style.background='#61a074';origin={...fix,source:'gps'};renderOrigin();setUserMarker(fix);updateDistancePreview();
  if(!active.demo&&!nearbyOrigin)applyLocationSuggestions(fix);
  text($('distance-value'),formatDistance(result.distance));text($('eta-value'),result.eta===null?'—':`~${Math.max(1,Math.round(result.eta))} ${t('min')}`);text($('accuracy-value'),`±${Math.round(result.accuracy)} m`);$('progress-fill').style.width=`${result.progress*100}%`;
  text($('journey-detail'),active.acknowledged?t('acknowledged'):result.distance<=radius&&active.tracker.samples.length===1?t('alreadyNear'):t('moving'));
  if(result.shouldAlert){active.alertAt=Date.now();active.alertDistance=Math.round(result.distance);showAlarm(result);}
}
function startDemo(){
  const originTime=Date.now();let frame=0;const destination={...selected};
  const tick=()=>{if(!active?.demo)return;const remaining=Math.max(100,10000-frame*330);const lat=destination.lat+remaining/111195;receiveFix({lat,lon:destination.lon,accuracy:8,timestamp:originTime+frame*15000},originTime+frame*15000);frame++;if(frame>30){clearInterval(demoTimer);demoTimer=null;active.demoFinished=true;text($('journey-title'),t('complete'));text($('journey-detail'),t('completeDetail'));$('live-dot').hidden=true;}};
  tick();demoTimer=setInterval(tick,1000);
  if(map)map.fitBounds([[destination.lat,destination.lon],[destination.lat+10000/111195,destination.lon]],{padding:[70,70]});
}
function showAlarm(result){
  if(!active)return;
  text($('alarm-mode'),t(active.demo?'demoAlertTitle':'alertTitle'));text($('alarm-name'),destinationName(selected));
  const detail=lang==='ta'?`${formatDistance(result.distance)} தூரம். ${result.reason==='time'?`தோராயமாக ${Math.max(1,Math.round(result.eta))} நிமிடங்கள். `:''}இறங்கத் தயாராகுங்கள்.`:`You’re ${formatDistance(result.distance)} from your stop. ${result.reason==='time'?`Roughly ${Math.max(1,Math.round(result.eta))} minutes at your current approach speed. `:''}Get ready to step off.`;
  text($('alarm-detail'),detail);text($('journey-title'),t('alarmed'));
  $('alarm-dialog').showModal();beep();navigator.vibrate?.([250,120,250,120,500]);alarmTimer=setInterval(()=>{beep();navigator.vibrate?.([250,120,250]);},4000);
  if(!active.demo&&'Notification' in window&&Notification.permission==='granted'){
    const options={body:detail,tag:'wims-stop-alert',icon:'icon-192.png',requireInteraction:true};
    if(swRegistration)swRegistration.showNotification(destinationName(selected),options).catch(()=>{});else try{new Notification(destinationName(selected),options);}catch{}
  }
}
function acknowledge(){silence();$('alarm-dialog').close();swRegistration?.getNotifications({tag:'wims-stop-alert'}).then(list=>list.forEach(n=>n.close()));if(active){active.acknowledged=true;renderJourneyState();}}
function endJourney(feedback=true){
  if(!active)return;const ride=active;active=null;
  stopGpsWatch();gpsFailureReason=null;$('gps-recovery').hidden=true;if(demoTimer)clearInterval(demoTimer);demoTimer=null;if(staleTimer)clearInterval(staleTimer);staleTimer=null;silence();$('alarm-dialog').close();wakeLock?.release().catch(()=>{});wakeLock=null;
  $('end').hidden=true;$('live-dot').hidden=true;$('journey-metrics').hidden=true;$('progress-track').hidden=true;setBusy(false);text($('journey-title'),destinationName(selected));text($('journey-detail'),t('readyTitle'));
  swRegistration?.getNotifications({tag:'wims-stop-alert'}).then(list=>list.forEach(n=>n.close()));
  if(feedback){pendingFeedback={id:crypto.randomUUID(),mode:ride.demo?'demo':'real',destination:selected.name,startedAt:new Date(ride.startedAt).toISOString(),durationSeconds:Math.round((Date.now()-ride.startedAt)/1000),warningMinutes:minutes,fallbackMetres:radius,alertDelivered:!!ride.alertAt,alertDistanceMetres:ride.alertDistance,acknowledged:ride.acknowledged,feedback:'skipped'};
    pendingFeedback.busType=busType;const history=read('feedback',[]);history.unshift(pendingFeedback);write('feedback',history.slice(0,20));text($('feedback-summary'),`${t(ride.demo?'simulation':'realRide')} · ${destinationName(selected)} · ${t(ride.alertAt?'alertFeedback':'noFeedback')}`);$('feedback-dialog').showModal();}
  if(ride.demo){origin=ride.previousOrigin;if(userMarker)userMarker.remove();userMarker=null;if(connector)connector.remove();connector=null;if(origin){renderOrigin();setUserMarker(origin);updateDistancePreview();}else{$('route-preview').hidden=true;text($('origin-label'),t('currentLocation'));text($('origin-meta'),t('gpsPrompt'));}}
}
function renderSaved(){const root=$('saved-list');root.replaceChildren();const list=saved();if(!list.length){const p=document.createElement('p');p.className='empty';text(p,t('noSaved'));root.append(p);return;}for(const s of list){const row=document.createElement('div');row.className='saved-row';const pick=document.createElement('button');const strong=document.createElement('strong'),small=document.createElement('small');text(strong,destinationName(s));text(small,`${regionFor(s)} · ${s.lat.toFixed(4)}, ${s.lon.toFixed(4)}`);pick.append(strong,small);pick.addEventListener('click',()=>{if(active){msg(t('end'));return;}$('city').value='all';$('search').value='';selectStop(s);$('setup-panel').scrollIntoView({behavior:'smooth',block:'start'});});const remove=document.createElement('button');remove.textContent='×';remove.setAttribute('aria-label',t('removeLabel'));remove.addEventListener('click',()=>{write('saved',saved().filter(x=>x.id!==s.id));renderSaved();if(selected)renderSelected();});row.append(pick,remove);root.append(row);}}
function renderData(){
  const count=dataset.count.toLocaleString('en-IN'),date=new Date(dataset.retrievedAt).toLocaleDateString('en-IN');
  const base=lang==='ta'?`${count} பெயரிடப்பட்ட OSM நிறுத்தங்கள். தரவு பெற்ற நாள்: ${date}. உரிமம்: ${dataset.license}.`:`${count} named OpenStreetMap stops. Snapshot downloaded ${date}. Licensed under ${dataset.license}.`;
  const routes=routeData?` ${routeData.count.toLocaleString('en-IN')} ${t('routesInData')} · ${routeData.stops.length.toLocaleString('en-IN')} ${lang==='ta'?'வழித்தட நிறுத்தப் பதிவுகள்':'route stop records'} · ChennaiGTFS / OpenStreetMap · ODbL. ${t('routeStatic')}`:'';
  text($('data-description'),base+routes);
}
function openExtra(id){$(id).hidden=false;$(id).scrollIntoView({behavior:'smooth',block:'start'});}

$('language').addEventListener('click',()=>{lang=lang==='en'?'ta':'en';applyLanguage();visibleStops();});
$('search').addEventListener('input',()=>{$('clear-search').hidden=!$('search').value;renderResults();});
$('clear-search').addEventListener('click',()=>{$('search').value='';$('clear-search').hidden=true;renderResults();$('search').focus();});
$('city').addEventListener('change',()=>{manualRegion=true;chosenRoute=null;refreshRouteCandidates();renderRouteOptions();renderLocationContext();drawBusRoute();renderResults();savePrefs();const c=CITIES.find(c=>c.id===$('city').value);if(map){if(c.id==='all')map.fitBounds([[8.05,76.2],[13.65,80.35]]);else map.setView([c.lat,c.lon],12);}text($('map-title'),c.name.replace(' region','')+(c.id==='all'?'':', Tamil Nadu'));});
$('reset-nearby').addEventListener('click',()=>{if(nearbyOrigin&&!active){chosenRoute=null;drawBusRoute();applyLocationSuggestions(nearbyOrigin,{clearSearch:true});map?.setView([nearbyOrigin.lat,nearbyOrigin.lon],14);}});
$('route-select').addEventListener('change',()=>{if(active)return;chosenRoute=routeCandidates.find(c=>c.route.id===$('route-select').value)||null;$('search').value='';$('clear-search').hidden=true;if(chosenRoute&&selected&&!stopsOnRoute(chosenRoute,routeStopMap).some(x=>x.stop.id===selected.id))clearDestination();renderRouteOptions();renderResults();visibleStops();drawBusRoute();});
$('manual-location-toggle').addEventListener('click',()=>{if(active)return;const open=$('manual-location').hidden;$('manual-location').hidden=!open;$('manual-location-toggle').setAttribute('aria-expanded',String(open));if(open){renderManualResults();$('origin-search').focus();}});
$('origin-search').addEventListener('input',renderManualResults);
$('set-origin-coordinates').addEventListener('click',()=>{const point=parseCoordinates($('origin-coordinates').value);if(!point){$('origin-error').hidden=false;text($('origin-error'),t('coordinateError'));return;}setManualOrigin({...point,name:I18N.en.coordinateOrigin,ta:I18N.ta.coordinateOrigin});});
$('origin-coordinates').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('set-origin-coordinates').click();}});
$('origin-search').addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();$('origin-results').querySelector('button')?.focus();}});
$('pick-origin').addEventListener('click',()=>{if(active)return;if(!map){msg(t('mapError'));return;}pinMode=pinMode==='origin'?false:'origin';updatePinMode();if(pinMode){msg(t('originPinInstruction'),true);$('map').scrollIntoView({behavior:'smooth',block:'center'});}});
$('search-all').addEventListener('click',()=>{if(active)return;chosenRoute=null;drawBusRoute();renderRouteOptions();renderResults();visibleStops();});
$('pick-pin').addEventListener('click',()=>{if(!map){msg(t('mapError'));return;}pinMode=pinMode==='destination'?false:'destination';updatePinMode();if(pinMode){msg(t('pinInstruction'),true);$('map-panel')?.scrollIntoView({behavior:'smooth'});if(window.matchMedia('(max-width:760px)').matches)$('map').scrollIntoView({behavior:'smooth',block:'center'});}});
document.querySelectorAll('[data-minutes]').forEach(b=>b.addEventListener('click',()=>{minutes=Number(b.dataset.minutes);document.querySelectorAll('[data-minutes]').forEach(x=>x.classList.toggle('chosen',Number(x.dataset.minutes)===minutes));savePrefs();if(selected)selectStop(selected);}));
$('radius').value=String(radius);$('radius').addEventListener('change',()=>{radius=Number($('radius').value);drawRadius();savePrefs();if(selected)selectStop(selected);});
$('save-stop').addEventListener('click',()=>{if(!selected)return;let list=saved();const exists=list.some(s=>s.id===selected.id);list=exists?list.filter(s=>s.id!==selected.id):[selected,...list].slice(0,20);write('saved',list);renderSelected();renderSaved();msg(t(exists?'unsavedMessage':'savedMessage'),true);});
$('retry-gps').addEventListener('click',()=>{if(active&&!active.demo){beginGpsWatch();lockScreen();}else if(selected&&gpsRetryMode==='journey')startJourney();else getCurrentLocation();});
$('back-planning').addEventListener('click',()=>{if(active)endJourney(false);gpsFailureReason=null;$('gps-recovery').hidden=true;$('message').hidden=true;text($('journey-title'),selected?destinationName(selected):t('readyTitle'));text($('journey-detail'),t('readyDetail'));$('setup-panel').scrollIntoView({behavior:'smooth',block:'start'});$('manual-location-toggle').focus({preventScroll:true});});
$('start').addEventListener('click',()=>startJourney());$('demo').addEventListener('click',()=>startJourney(true));$('end').addEventListener('click',()=>endJourney());
$('test-sound').addEventListener('click',async()=>{const ok=await unlockAudio();msg(t(ok&&beep()?'soundPlayed':'soundUnavailable'),ok);});
$('acknowledge').addEventListener('click',acknowledge);$('alarm-dialog').addEventListener('cancel',()=>{silence();if(active)active.acknowledged=true;});
$('close-feedback').addEventListener('click',()=>{$('feedback-dialog').close();pendingFeedback=null;});
document.querySelectorAll('[data-feedback]').forEach(b=>b.addEventListener('click',()=>{if(pendingFeedback){const history=read('feedback',[]).map(f=>f.id===pendingFeedback.id?{...f,feedback:b.dataset.feedback}:f);write('feedback',history);pendingFeedback=null;}$('feedback-dialog').close();msg(t('feedbackThanks'),true);}));
$('nav-saved').addEventListener('click',()=>{renderSaved();openExtra('saved-section');});$('nav-how').addEventListener('click',()=>openExtra('how-section'));$('footer-data').addEventListener('click',()=>openExtra('how-section'));$('nav-journey').addEventListener('click',()=>$('setup-panel').scrollIntoView({behavior:'smooth'}));document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).hidden=true));
$('locate').addEventListener('click',getCurrentLocation);$('get-location').addEventListener('click',getCurrentLocation);$('preview-road').addEventListener('click',previewRoad);
$('bus-type').value=busType;$('bus-type').addEventListener('change',()=>{busType=$('bus-type').value;radius=BUS_TYPES[busType].radius;$('radius').value=String(radius);savePrefs();if(selected)selectStop(selected);text($('bus-type-note'),t('busNote'));});
$('fit').addEventListener('click',()=>{if(!map)return;if(selected&&userMarker&&active)map.fitBounds([[selected.lat,selected.lon],userMarker.getLatLng()],{padding:[60,90]});else if(selected)map.fitBounds(ring.getBounds(),{padding:[30,50]});});
$('export-results').addEventListener('click',()=>{const feedback=read('feedback',[]);if(!feedback.length){msg(t('emptyExport'));return;}const file=new Blob([JSON.stringify({app:'Where Is My Stop? Tamil Nadu pilot',exportedAt:new Date().toISOString(),rides:feedback},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=`tamil-nadu-pilot-feedback-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});
$('erase-data').addEventListener('click',()=>{if(confirm(t('clearConfirm'))){write('saved',[]);write('feedback',[]);pendingFeedback=null;renderSaved();if(selected)renderSelected();msg(t('cleared'),true);}});
document.addEventListener('visibilitychange',()=>{if(!active||active.demo)return;if(document.visibilityState==='visible'){pauseGps('foreground');lockScreen();}else{silence();wakeLock=null;}});
window.addEventListener('offline',()=>msg(t('offline')));
window.addEventListener('pagehide',()=>{silence();stopGpsWatch();});
window.addEventListener('pageshow',e=>{if(e.persisted&&active&&!active.demo){beginGpsWatch();lockScreen();}});

async function init(){
  for(const c of CITIES){const option=document.createElement('option');option.value=c.id;text(option,c.name);$('city').append(option);}
  $('city').value=CITIES.some(c=>c.id===prefs.city)?prefs.city:'chennai';applyLanguage();initMap();
  document.querySelectorAll('[data-minutes]').forEach(x=>x.classList.toggle('chosen',Number(x.dataset.minutes)===minutes));
  try{const responses=await Promise.all([fetch('data/stops.json'),fetch('data/boundary.json')]);if(responses.some(r=>!r.ok))throw Error('Data unavailable');[dataset,boundary]=await Promise.all(responses.map(r=>r.json()));dataset.stops=dataset.stops.filter(s=>inTamilNadu(s,boundary));dataset.count=dataset.stops.length;catalogueStops=dataset.stops;setBusy(false);renderResults();renderData();text($('stop-count'),`${dataset.count.toLocaleString('en-IN')} ${t('stopCount')}`);visibleStops();renderSaved();const c=CITIES.find(c=>c.id===$('city').value);if(nearbyOrigin)applyLocationSuggestions(nearbyOrigin);else if(c.id!=='chennai')$('city').dispatchEvent(new Event('change'));}catch{msg(t('dataError'));$('results').replaceChildren();text($('results'),t('dataError'));$('demo').disabled=true;$('pick-pin').disabled=true;}
  if(dataset){try{const response=await fetch('data/routes.json');if(!response.ok)throw Error('Routes unavailable');routeData=await response.json();routeStopMap=new Map(routeData.stops.filter(s=>inTamilNadu(s,boundary)).map(s=>[s.id,s]));catalogueStops=[...new Map([...dataset.stops,...routeStopMap.values()].map(s=>[s.id,s])).values()];refreshRouteCandidates();renderRouteOptions();renderResults();renderManualResults();visibleStops();renderData();}catch{renderRouteOptions();}}
  if('serviceWorker' in navigator){try{swRegistration=await navigator.serviceWorker.register('sw.js');}catch{}}
}
init();
