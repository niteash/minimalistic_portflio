import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, AppState, KeyboardAvoidingView, Platform,
  SafeAreaView, Share, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { useAudioPlayer } from 'expo-audio';
import * as Location from 'expo-location';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import {
  addDoc, collection, deleteDoc, doc, getDoc, limit, onSnapshot, orderBy,
  query, runTransaction, setDoc, updateDoc, writeBatch,
} from 'firebase/firestore';
import { auth, configured, db } from './src/firebase';
import { approximate, createInviteCode, metersBetween, safeZoneStatus } from './src/geo';
import { radarPoint, visibleApproximatePings } from './src/radar';
import { getMatchOutcome, canStartMatch, assignRandomRoles, MAX_PLAYERS, ROLE_REVEAL_MS } from './src/game';
import { C } from './src/theme';
import { chatCollectionSegments, channelAudience } from './src/chat';

const DURATION_SECONDS = 1800;
const PING_INTERVAL_SECONDS = 180;
const SAFE_ZONE_RADIUS_METERS = 25;
const CHAT_LENGTH = 160;
const QUICK_SIGNALS = ['✓ All good', '☕ Need a break', '⌂ Meet at start'];
const SoundContext = React.createContext(() => {});

function timeLabel(seconds) {
  const value = Math.max(0, seconds);
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}
function errorText(error, label) {
  const code = error?.code || 'unknown';
  return `${label}: ${code}${error?.message ? ` · ${error.message}` : ''}`;
}
function showError(error, label = 'Request') {
  console.warn(`[${label}]`, error);
  Alert.alert(`${label} failed`, error?.code === 'permission-denied'
    ? 'Firestore permission denied. Publish the v0.5 firestore.rules in the correct Firebase project and create a NEW room.'
    : error?.message || 'Check your connection and try again.');
}
function Button({ children, onPress, secondary, danger, disabled, style }) {
  const playSound = React.useContext(SoundContext);
  return <TouchableOpacity accessibilityRole="button" activeOpacity={0.84}
    disabled={disabled} onPress={() => { playSound('tap'); onPress?.(); }}
    style={[styles.button, secondary && styles.buttonSecondary, danger && styles.buttonDanger, disabled && styles.disabled, style]}>
    <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{children}</Text>
  </TouchableOpacity>;
}
function Kicker({ children, color = C.lime }) {
  return <Text style={[styles.kicker, {color}]}>{children}</Text>;
}
function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
function Chip({ children, color = C.lime }) {
  return <View style={styles.chip}><View style={[styles.chipDot,{backgroundColor:color}]}/><Text style={styles.chipText}>{children}</Text></View>;
}
function MiniAvatar({ name, color=C.lime }) {
  return <View style={[styles.avatar,{borderColor:color+'88',backgroundColor:color+'20'}]}>
    <Text style={[styles.avatarText,{color}]}>{(name||'?').slice(0,1).toUpperCase()}</Text>
  </View>;
}
function StatusBar({ label, value, accent }) {
  return <View style={styles.statTile}><Text style={styles.statLabel}>{label}</Text><Text style={[styles.statValue,accent && {color:accent}]}>{value}</Text></View>;
}

function Radar({ center, radius, players, position }) {
  const [size, setSize] = useState(0);
  const markerSize = 25;
  const dots = players.map(p => ({...p, point: radarPoint(p.location,center,radius)})).filter(p => p.point);
  const me = position ? radarPoint(position,center,radius) : null;
  return <View style={styles.radarStage} onLayout={e => setSize(e.nativeEvent.layout.width)}>
    <View style={styles.radarCircle} />
    <View style={styles.radarMiddle} />
    <View style={styles.radarInner} />
    <View style={styles.radarVertical}/><View style={styles.radarHorizontal}/>
    <View style={styles.radarCompass}><Text style={styles.radarCompassText}>N</Text></View>
    <View style={styles.radarCenter}><Text style={styles.radarCenterText}>REST</Text></View>
    {size > 0 && dots.map(p => <View key={p.uid} style={[styles.radarDot, {
      left:p.point.x * size-markerSize/2, top:p.point.y * size-markerSize/2,
      backgroundColor:p.team==='hunter'?C.blue:C.orange,
    }]}><Text style={styles.radarDotText}>{(p.name||'?')[0].toUpperCase()}</Text></View>)}
    {size > 0 && me && <View style={[styles.radarSelf,{left:me.x*size-8,top:me.y*size-8}]} />}
    <Text style={styles.radarScale}>SCHEMATIC ONLY · NOT FOR NAVIGATION</Text>
  </View>;
}

export default function App() {
  const [user,setUser] = useState(null);
  const [loadingUser,setLoadingUser] = useState(configured);
  const [name,setName] = useState('');
  const [invite,setInvite] = useState('');
  const [radius,setRadius] = useState(250);
  const [roomId,setRoomId] = useState(null);
  const [room,setRoom] = useState(null);
  const [players,setPlayers] = useState([]);
  const [busy,setBusy] = useState(false);
  const [tick,setTick] = useState(Date.now());
  const [tab,setTab] = useState('arena');
  const [mapMode,setMapMode] = useState('map');
  const [mapLoaded,setMapLoaded] = useState(false);
  const [position,setPosition] = useState(null);
  const [sharing,setSharing] = useState(false);
  const [shareBusy,setShareBusy] = useState(false);
  const [shareError,setShareError] = useState('');
  const [gpsStatus,setGpsStatus] = useState('off');
  const [foreground,setForeground] = useState(AppState.currentState !== 'background');
  const [messages,setMessages] = useState([]);
  const [chatDraft,setChatDraft] = useState('');
  const [chatBusy,setChatBusy] = useState(false);
  const [chatState,setChatState] = useState('idle');
  const [chatError,setChatError] = useState('');
  const [chatRetry,setChatRetry] = useState(0);
  const [chatScope,setChatScope] = useState('all');
  const [chatFromCache,setChatFromCache] = useState(false);
  const [unreadChatCount,setUnreadChatCount] = useState(0);
  const [soundOn,setSoundOn] = useState(true);

  const watcherRef=useRef(null);
  const pendingWriteRef=useRef(Promise.resolve());
  const sharingRef=useRef(false);
  const generationRef=useRef(0);
  const lastSentRef=useRef(0);
  const foregroundRef=useRef(AppState.currentState !== 'background');
  const roomIdRef=useRef(null);
  const userIdRef=useRef(null);
  const roomStatusRef=useRef(null);
  const mapRef=useRef(null);
  const chatScrollRef=useRef(null);
  const selectedTabRef=useRef('arena');
  const soundEnabledRef=useRef(true);
  const soundPlayersRef=useRef({});
  const seenMessagesRef=useRef({});
  const lastCountedSecondRef=useRef(null);
  const lastRevealRef=useRef(null);
  const lastCompletedRef=useRef(false);
  const tapAudio = useAudioPlayer(require('./assets/sfx/tap.wav'));
  const countAudio = useAudioPlayer(require('./assets/sfx/count.wav'));
  const revealAudio = useAudioPlayer(require('./assets/sfx/reveal.wav'));
  const startAudio = useAudioPlayer(require('./assets/sfx/start.wav'));
  const messageAudio = useAudioPlayer(require('./assets/sfx/message.wav'));
  const winAudio = useAudioPlayer(require('./assets/sfx/win.wav'));
  soundPlayersRef.current={tap:tapAudio,count:countAudio,reveal:revealAudio,start:startAudio,message:messageAudio,win:winAudio};
  soundEnabledRef.current=soundOn;
  const playSfx=useCallback(kind=>{
    if(!soundEnabledRef.current) return;
    const player=soundPlayersRef.current[kind];
    if(!player) return;
    Promise.resolve(player.seekTo(0)).then(()=>player.play()).catch(e=>console.warn('SFX',kind,e?.message));
  },[]);

  const me=players.find(p => p.uid===user?.uid);
  const isHost=Boolean(room && room.hostUid===user?.uid);
  const result=getMatchOutcome(room,players,tick);
  const completed=result.completed;
  const revealingRole=room?.status==='active' && tick < (room?.startedAt||0);
  const readyCount=players.filter(p => p.ready).length;
  const everyoneReady=canStartMatch(players);
  const runners=players.filter(p=>p.team==='runner');
  const hunters=players.filter(p=>p.team==='hunter');
  const survivors=runners.filter(p=>!p.caught);
  const pings=visibleApproximatePings(players,tick,room?.status);
  const restZone=safeZoneStatus(position,room?.center,SAFE_ZONE_RADIUS_METERS);
  const boundaryWarning=Boolean(position && room && position.accuracy<=75 && !completed &&
    metersBetween(position,room.center) > room.radiusMeters + Math.max(20,position.accuracy));
  const teamMembers=players.filter(p=>p.team===me?.team);
  const chatAudience=channelAudience(players,chatScope,me?.team);
  selectedTabRef.current=tab;

  useEffect(()=>{
    if (!configured) return;
    const off=onAuthStateChanged(auth,async current=>{
      if (current){setUser(current);setLoadingUser(false);}
      else {try {await signInAnonymously(auth);} catch(e){setLoadingUser(false);showError(e,'Sign in');}}
    });
    return off;
  },[]);
  useEffect(()=>{const timer=setInterval(()=>setTick(Date.now()),1000);return ()=>clearInterval(timer);},[]);
  useEffect(()=>{roomIdRef.current=roomId;userIdRef.current=user?.uid;roomStatusRef.current=room?.status;},[roomId,user?.uid,room?.status]);
  // Short original arcade tones: optional, foreground-only, and easy to mute.
  useEffect(()=>{
    if(!roomId || room?.status!=='active') {lastRevealRef.current=null;lastCountedSecondRef.current=null;return;}
    const matchKey=`${roomId}:${room.startedAt}`;
    if(revealingRole && lastRevealRef.current!==matchKey){
      lastRevealRef.current=matchKey;
      lastCountedSecondRef.current=null;
      playSfx('reveal');
    }
    if(revealingRole){
      const n=Math.ceil((room.startedAt-tick)/1000);
      if(n>=1 && n<=3 && n!==lastCountedSecondRef.current){
        lastCountedSecondRef.current=n;
        playSfx('count');
      }
    } else if(lastRevealRef.current===matchKey && lastCountedSecondRef.current!=='started') {
      lastCountedSecondRef.current='started';
      playSfx('start');
    }
  },[roomId,room?.status,room?.startedAt,revealingRole,tick,playSfx]);
  useEffect(()=>{
    if(completed && !lastCompletedRef.current && roomId) playSfx('win');
    lastCompletedRef.current=completed;
  },[completed,roomId,playSfx]);


  function stopWatcher(){
    generationRef.current += 1;
    sharingRef.current = false;
    watcherRef.current?.remove();
    watcherRef.current = null;
  }
  // Always serialize the last publish before clearing the server record. A
  // location write from before Pause must not resurrect a supposedly paused ping.
  async function stopSharing({quiet=false}={}) {
    stopWatcher();
    setSharing(false);
    setPosition(null);
    setGpsStatus('paused');
    setShareError('');
    if (!db || !roomIdRef.current || !userIdRef.current) return;
    setShareBusy(true);
    try {
      await pendingWriteRef.current.catch(()=>{});
      await updateDoc(doc(db,'rooms',roomIdRef.current,'players',userIdRef.current), {
        sharingEnabled:false, location:null,
      });
    } catch(error){
      const msg=errorText(error,'Could not confirm remote pause');
      setShareError(msg);
      console.warn(msg);
      if(!quiet) showError(error,'Pause location');
    } finally { setShareBusy(false); }
  }
  async function startSharing(){
    if (!roomId || !user || shareBusy || !foreground || completed || revealingRole || me?.caught) return;
    setShareBusy(true);
    setShareError('');
    try {
      const permission=await Location.requestForegroundPermissionsAsync();
      if(permission.status!=='granted') throw new Error('Foreground location permission is required. Enable it in phone settings.');
      await updateDoc(doc(db,'rooms',roomId,'players',user.uid),{sharingEnabled:true,location:null});
      generationRef.current+=1;
      sharingRef.current=true;
      lastSentRef.current=0;
      setSharing(true);
      setGpsStatus('acquiring');
    } catch(error){setShareError(errorText(error,'Resume failed'));showError(error,'Resume location');}
    finally {setShareBusy(false);}
  }
  useEffect(()=>{
    if (!db || !roomId || !user) return;
    const offRoom=onSnapshot(doc(db,'rooms',roomId),snap=>{
      if(!snap.exists()) {setRoomId(null);Alert.alert('Room unavailable','This room no longer exists.');}
      else setRoom({id:snap.id,...snap.data()});
    },error=>showError(error,'Room listener'));
    const offPlayers=onSnapshot(collection(db,'rooms',roomId,'players'),snapshot=>{
      setPlayers(snapshot.docs.map(d=>({id:d.id,...d.data()})));
    },error=>showError(error,'Roster listener'));
    return ()=>{offRoom();offPlayers();setRoom(null);setPlayers([]);setPosition(null);};
  },[roomId,user?.uid]);

  // Never automatically resume on app foreground. Explicit player action only.
  useEffect(()=>{
    const sub=AppState.addEventListener('change', state=>{
      const active=state==='active';
      foregroundRef.current=active;
      setForeground(active);
      if (!active && sharingRef.current) {
        // Do not await in the OS background callback. Best-effort only.
        stopSharing({quiet:true});
      }
    });
    return ()=>sub.remove();
  },[]);

  useEffect(()=>{
    if (!db || !user || !roomId || !sharing || !foreground || revealingRole || completed ||
        room?.status!=='active' || me?.caught) return;
    let alive=true;
    const generation=generationRef.current;
    const ref=doc(db,'rooms',roomId,'players',user.uid);
    (async()=>{
      try {
        const subscription=await Location.watchPositionAsync({
          accuracy:Location.Accuracy.Balanced, distanceInterval:10, timeInterval:5000,
        },loc=>{
          if(!alive || !sharingRef.current || generation!==generationRef.current || !foregroundRef.current) return;
          const coords=loc.coords;
          setPosition({latitude:coords.latitude,longitude:coords.longitude,accuracy:coords.accuracy??999});
          const accuracy=coords.accuracy??999;
          if (accuracy>100) {setGpsStatus('weak');return;}
          setGpsStatus('active');
          const now=Date.now();
          const interval=me?.team==='runner'?PING_INTERVAL_SECONDS*1000:7000;
          if(now-lastSentRef.current < interval) return;
          lastSentRef.current=now;
          const coarse=approximate(coords);
          pendingWriteRef.current=pendingWriteRef.current.catch(()=>{}).then(async()=>{
            if(!sharingRef.current || generation!==generationRef.current || !foregroundRef.current) return;
            try {await updateDoc(ref,{
              location:{...coarse,updatedAt:now},lastPingAt:now,sharingEnabled:true,
            });setShareError('');}
            catch(error){setShareError(errorText(error,'GPS publish'));setGpsStatus('error');}
          });
        },error=>{if(alive){setGpsStatus('error');setShareError(errorText(error,'GPS watcher'));}});
        if(!alive || !sharingRef.current || generation!==generationRef.current) subscription.remove();
        else watcherRef.current=subscription;
      } catch(error){if(alive){setGpsStatus('error');setShareError(errorText(error,'Location startup'));}}
    })();
    return ()=>{alive=false;watcherRef.current?.remove();watcherRef.current=null;};
  },[roomId,user?.uid,sharing,foreground,room?.status,revealingRole,completed,me?.caught,me?.team]);

  useEffect(()=>{
    if(!sharingRef.current || !roomId || !user || (room?.status==='active' && !completed && !me?.caught)) return;
    stopSharing({quiet:true});
  },[room?.status,completed,me?.caught,roomId,user?.uid]);

  // Keep an active listener for the selected room-wide or team-private channel.
  // Firestore's metadata updates distinguish local pending messages from remote ACKs.
  useEffect(()=>{
    if(!db || !roomId || !user || !me || !['hunter','runner'].includes(me.team) ||
        !['active','finished'].includes(room?.status)) {
      setMessages([]);setChatState('idle');setChatError('');return;
    }
    let alive=true;
    setMessages([]);setChatFromCache(false);setChatState('connecting');setChatError('');
    let segments;
    try {segments=chatCollectionSegments(roomId,chatScope,me.team);}
    catch(error){setChatState('error');setChatError(errorText(error,'Chat channel'));return;}
    const key=`${roomId}/${chatScope}/${chatScope==='team'?me.team:'all'}`;
    const q=query(collection(db,...segments),orderBy('createdAt','desc'),limit(60));
    const off=onSnapshot(q,{includeMetadataChanges:true},snapshot=>{
      if(!alive) return;
      const listed=snapshot.docs.map(d=>({id:d.id,...d.data(),pending:d.metadata.hasPendingWrites})).reverse();
      if(!seenMessagesRef.current[key]) {
        seenMessagesRef.current[key]=new Set(listed.map(m=>m.id));
      } else {
        const unseen=listed.some(m=>!seenMessagesRef.current[key].has(m.id) && !m.pending &&
          m.senderUid!==user.uid);
        listed.forEach(m=>seenMessagesRef.current[key].add(m.id));
        if(unseen) {playSfx('message');if(selectedTabRef.current!=='team') setUnreadChatCount(n=>Math.min(9,n+1));}
      }
      setMessages(listed);
      setChatFromCache(snapshot.metadata.fromCache);
      setChatState(snapshot.metadata.fromCache?'syncing':'connected');
      setChatError('');
    },error=>{
      if(!alive) return;
      setChatState('error');setChatError(errorText(error,'Chat listener'));
      console.warn('Chat listener error',error);
    });
    return ()=>{alive=false;off();};
  },[roomId,me?.team,room?.status,chatRetry,user?.uid,chatScope,playSfx]);

  useEffect(()=>{
    if (!isHost || !roomId || room?.status!=='active' || revealingRole ||
        !(result.timeout || result.allCaught)) return;
    updateDoc(doc(db,'rooms',roomId),{status:'finished',finishReason:result.allCaught?'all_caught':'timeout'})
      .catch(error=>console.warn('Finishing match',error));
  },[isHost,roomId,room?.status,revealingRole,result.timeout,result.allCaught]);

  async function sendMessage(value){
    const text=String(value||'').trim();
    if(!text || text.length>CHAT_LENGTH || !roomId || !me || room?.status!=='active' || chatBusy) return;
    setChatBusy(true);setChatError('');
    try{
      const segments=chatCollectionSegments(roomId,chatScope,me.team);
      await addDoc(collection(db,...segments),{
        senderUid:user.uid,text,createdAt:Date.now(),
      });
      setChatDraft(current=>current.trim()===text?'':current);
    }catch(error){setChatError(errorText(error,'Send message'));showError(error,'Send message');}
    finally{setChatBusy(false);}
  }
  async function createRoom(){
    const trimmed=name.trim();
    if(!trimmed || trimmed.length>24) return Alert.alert('Player name','Enter a name between 1 and 24 characters.');
    if(!user || !db) return;
    setBusy(true);
    try{
      const perm=await Location.requestForegroundPermissionsAsync();
      if(perm.status!=='granted') throw new Error('Location permission is needed once to set the shared play-area center.');
      const found=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced});
      if((found.coords.accuracy??999)>100) throw new Error('GPS location is not accurate yet. Try in an open, permitted area.');
      const center={latitude:Number(found.coords.latitude.toFixed(4)),longitude:Number(found.coords.longitude.toFixed(4))};
      let code='';
      for(let attempt=0;attempt<4;attempt++){
        const candidate=createInviteCode();
        if(!(await getDoc(doc(db,'rooms',candidate))).exists()){code=candidate;break;}
      }
      if(!code) throw new Error('Unable to find a free room code. Try again.');
      const batch=writeBatch(db);
      batch.set(doc(db,'rooms',code),{
        hostUid:user.uid,status:'lobby',finishReason:'',createdAt:Date.now(),startedAt:0,
        durationSeconds:DURATION_SECONDS,radiusMeters:radius,pingIntervalSeconds:PING_INTERVAL_SECONDS,center,
      });
      batch.set(doc(db,'rooms',code,'players',user.uid),{
        uid:user.uid,name:trimmed,team:'unassigned',ready:false,caught:false,
        joinedAt:Date.now(),location:null,lastPingAt:0,sharingEnabled:false,
      });
      await batch.commit();
      setRoomId(code);setTab('arena');setUnreadChatCount(0);seenMessagesRef.current={};setMapMode('map');setChatScope('all');setSharing(false);setGpsStatus('off');
    }catch(error){showError(error,'Create room');}
    finally{setBusy(false);}
  }
  async function joinRoom(){
    const trimmed=name.trim();const code=invite.toUpperCase().trim();
    if(!trimmed || trimmed.length>24) return Alert.alert('Player name','Please enter a name.');
    if(!/^[A-Z2-9]{8}$/.test(code)) return Alert.alert('Room code','Enter your 8-character invite code.');
    setBusy(true);
    try{
      const snap=await getDoc(doc(db,'rooms',code));
      if(!snap.exists()) throw new Error('Room not found.');
      if(snap.data().status!=='lobby') throw new Error('This match has already started.');
      await setDoc(doc(db,'rooms',code,'players',user.uid),{
        uid:user.uid,name:trimmed,team:'unassigned',ready:false,caught:false,
        joinedAt:Date.now(),location:null,lastPingAt:0,sharingEnabled:false,
      });
      setRoomId(code);setTab('arena');setUnreadChatCount(0);seenMessagesRef.current={};setMapMode('map');setChatScope('all');setSharing(false);setGpsStatus('off');
    }catch(error){showError(error,'Join room');}
    finally{setBusy(false);}
  }
  async function toggleReady(){
    if (!me || !roomId || room?.status!=='lobby') return;
    try{await updateDoc(doc(db,'rooms',roomId,'players',user.uid),{ready:!me.ready});}
    catch(error){showError(error,'Ready');}
  }
  async function shareRoom(){
    if(!roomId) return;
    try{await Share.share({message:`Join our private walking-only Manhunt game: ${roomId}. Play only in a safe, permitted area.`});}
    catch(error){showError(error,'Share invite');}
  }
  function startGame(){
    if(!everyoneReady || !isHost || busy) return;
    Alert.alert('Start random roles?','Everyone should stay in a permitted walking area. Avoid roads, unsafe places and physical chasing.',[
      {text:'Cancel',style:'cancel'},
      {text:'Assign roles',onPress:async()=>{
        setBusy(true);
        try{
          const roster=[...players].sort((a,b)=>a.uid.localeCompare(b.uid));
          const assignments=assignRandomRoles(roster);
          const roomRef=doc(db,'rooms',roomId);
          const refs=roster.map(p=>doc(db,'rooms',roomId,'players',p.uid));
          await runTransaction(db,async tx=>{
            const latestRoom=await tx.get(roomRef);
            if(!latestRoom.exists() || latestRoom.data().status!=='lobby') throw new Error('The room is no longer waiting.');
            const latest=[];
            for(const ref of refs){const snap=await tx.get(ref);if(!snap.exists()) throw new Error('A player left.');latest.push(snap.data());}
            if(!canStartMatch(latest) || latest.length!==roster.length) throw new Error('Ready state changed. Try again.');
            refs.forEach((ref,index)=>tx.update(ref,{team:assignments[roster[index].uid]}));
            tx.update(roomRef,{status:'active',startedAt:Date.now()+ROLE_REVEAL_MS});
          });
        }catch(error){showError(error,'Start match');}
        finally{setBusy(false);}
      }},
    ]);
  }
  function confirmTagged(){
    if(!me || me.team!=='runner' || me.caught) return;
    if(restZone==='inside') return Alert.alert('Rest zone','Players agree tagging is paused in the rest zone. GPS estimates can be wrong.');
    Alert.alert('Confirm tag?','Only confirm if both players agree. No physical contact is needed.',[
      {text:'Cancel',style:'cancel'},
      {text:'Confirm',onPress:async()=>{
        await stopSharing({quiet:true});
        try{await updateDoc(doc(db,'rooms',roomId,'players',user.uid),{caught:true,location:null,sharingEnabled:false});}
        catch(error){showError(error,'Confirm tag');}
      }},
    ]);
  }
  function finishGame(){
    if(!isHost || room?.status!=='active') return;
    Alert.alert('End match?','Players will stop sharing locations.',[
      {text:'Cancel',style:'cancel'},
      {text:'End match',onPress:async()=>{
        try{await updateDoc(doc(db,'rooms',roomId),{status:'finished',finishReason:'host_stopped'});}
        catch(error){showError(error,'End match');}
      }},
    ]);
  }
  function leaveRoom(){
    Alert.alert('Leave room?','Location sharing will be turned off and you will leave the match.',[
      {text:'Stay',style:'cancel'},
      {text:'Leave',onPress:async()=>{
        try{
          await stopSharing({quiet:true});
          if(isHost && room?.status==='active') await updateDoc(doc(db,'rooms',roomId),{status:'finished',finishReason:'host_stopped'});
          await deleteDoc(doc(db,'rooms',roomId,'players',user.uid));
          setRoomId(null);setRoom(null);setPosition(null);setMessages([]);
        }catch(error){showError(error,'Leave room');}
      }},
    ]);
  }

  function renderArena(){
    return <>
      {completed && <Card style={styles.resultCard}>
        <Kicker>MATCH COMPLETE</Kicker>
        <Text style={styles.largeTitle}>{result.winner?`${result.winner} WIN`:'MATCH ENDED'}</Text>
        <Text style={styles.muted}>Gather together in the approved meeting area. Thanks for playing safely!</Text>
      </Card>}
      {boundaryWarning && <Card style={{borderColor:C.orange}}>
        <Kicker color={C.orange}>AREA REMINDER</Kicker>
        <Text style={styles.white}>Your GPS appears outside the game boundary. Return safely using known paths.</Text>
      </Card>}
      <View style={styles.sectionTitleRow}>
        <View><Kicker>01 / YOUR ARENA</Kicker><Text style={styles.sectionTitle}>Explore the map</Text></View>
        <View style={styles.segment}>
          {['map','radar'].map(mode=><TouchableOpacity key={mode} onPress={()=>{playSfx('tap');setMapMode(mode);setMapLoaded(false);}}
            style={[styles.segmentItem,mapMode===mode && styles.segmentSelected]}>
            <Text style={[styles.segmentText,mapMode===mode && styles.segmentSelectedText]}>{mode==='radar'?'Backup':'Street map'}</Text>
          </TouchableOpacity>)}
        </View>
      </View>
      {mapMode==='radar'?<Card style={styles.arenaCard}>
        <Radar center={room.center} radius={room.radiusMeters} players={pings} position={sharing?position:null}/>
        <Text style={styles.mapHint}>Offline schematic backup · Not for street navigation or capture decisions.</Text>
      </Card>:<View style={styles.mapWrap}>
        <MapView key={`${room.id}-map`} ref={mapRef} style={StyleSheet.absoluteFillObject}
          initialRegion={{...room.center,latitudeDelta:0.012,longitudeDelta:0.012}}
          showsUserLocation={sharing && !completed}
          showsMyLocationButton={false}
          onMapReady={()=>setMapLoaded(true)}
          mapType="standard"
          toolbarEnabled={false}>
          <Circle center={room.center} radius={room.radiusMeters} strokeColor={C.lime}
            fillColor="rgba(184,245,124,0.10)" strokeWidth={3}/>
          <Circle center={room.center} radius={SAFE_ZONE_RADIUS_METERS} strokeColor={C.blue}
            fillColor="rgba(135,197,255,0.20)" strokeWidth={2}/>
          <Marker coordinate={room.center} title="Meeting / rest zone" description="Approximate — agree on a safe meeting point" pinColor={C.lime}/>
          {pings.map(p=><Marker key={p.uid} coordinate={p.location} title={`${p.name} · approximate ping`}
            description="Delayed or approximate; not a capture indicator"
            pinColor={p.team==='hunter'?C.blue:C.orange}/>)}
        </MapView>
        <View style={styles.mapOverlay}><Text style={styles.mapOverlayText}>{mapLoaded?'MAP VIEW READY • GPS APPROXIMATE':'INITIALIZING STREET MAP…'}</Text></View>
        <View style={styles.mapControls}>
          <TouchableOpacity onPress={()=>{playSfx('tap');mapRef.current?.animateToRegion({
            ...room.center,latitudeDelta:0.012,longitudeDelta:0.012},450);}} style={styles.mapControl}>
            <Text style={styles.mapControlText}>◎ Center arena</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>{playSfx('tap');setMapMode('radar');}} style={styles.mapControl}>
            <Text style={styles.mapControlText}>Map blank?</Text>
          </TouchableOpacity>
        </View>
      </View>}
      <View style={styles.legendRow}>
        <Text style={styles.legendText}>● Rest zone</Text><Text style={[styles.legendText,{color:C.blue}]}>● Hunters</Text><Text style={[styles.legendText,{color:C.orange}]}>● Runners</Text>
      </View>
      {mapMode==='map' && Platform.OS==='android' && <Text style={styles.infoText}>
        Google Maps tiles not visible in Android Expo Go? Install a development build with a separate Maps SDK for Android API key. Firebase API keys do not work for Google Maps.
      </Text>}
      <View style={styles.statGrid}>
        <StatusBar label="RUNNERS LEFT" value={`${survivors.length}/${runners.length}`} accent={C.orange}/>
        <StatusBar label="HUNTERS" value={`${hunters.length}`} accent={C.blue}/>
        <StatusBar label="PINGS VISIBLE" value={`${pings.length}`} accent={C.lime}/>
      </View>
      <Card style={styles.sharingCard}>
        <View style={styles.rowBetween}>
          <View style={{flex:1}}><Kicker>YOUR GPS</Kicker><Text style={styles.cardHeading}>{sharing ? 'Sharing is on' : 'Sharing is paused'}</Text></View>
          <Chip color={sharing?(gpsStatus==='error'?C.red:C.lime):C.muted}>{sharing ? gpsStatus.toUpperCase() : 'OFF'}</Chip>
        </View>
        <Text style={styles.muted}>{sharing ? 'Your approximate ping may appear to other players. Foreground-only; runner pings refresh every 3 minutes.' : 'No GPS watcher is running. Resume only when you want to share your approximate position.'}</Text>
        {!completed && !me?.caught && <Button disabled={shareBusy || revealingRole} secondary={sharing}
          onPress={()=>sharing?stopSharing():startSharing()}>
          {shareBusy?'Updating privacy…':sharing?'Ⅱ  Pause location sharing':'◎  Resume location sharing'}
        </Button>}
        {shareError ? <Text style={styles.errorText}>{shareError}</Text> : null}
        <View style={styles.hairline}/>
        <View style={styles.rowBetween}><Text style={styles.subtleLabel}>SAFE REST ZONE</Text>
          <Text style={styles.whiteSmall}>{!sharing?'Location paused':restZone==='inside'?'✓ Inside (estimated)':restZone==='outside'?'Outside':restZone==='uncertain'?'Near edge / uncertain':'Waiting for GPS'}</Text></View>
      </Card>
      {!completed && me?.team==='runner' && !me.caught && <Button danger onPress={confirmTagged}>✓ I was tagged — confirm</Button>}
      {me?.caught && <Card><Kicker>CAPTURE CONFIRMED</Kicker><Text style={styles.muted}>Location sharing is disabled for you.</Text></Card>}
    </>;
  }
  function renderChat(){
    const isTeam=chatScope==='team';
    return <>
      <Card style={styles.chatIntro}>
        <Kicker color={C.lime}>02 / COMMS STATION</Kicker>
        <Text style={styles.largeTitle}>Stay in the loop</Text>
        <Text style={styles.muted}>Choose who receives your message. All Players is visible to both roles; Team Only remains private to your team.</Text>
        <View style={styles.channelRow}>
          {[['all','◉ All Players'],['team','▣ Team Only']].map(([scope,label])=><TouchableOpacity
            key={scope} accessibilityRole="button"
            style={[styles.channelButton,chatScope===scope&&styles.channelButtonSelected]}
            onPress={()=>{playSfx('tap');setChatScope(scope);setChatError('');}}>
            <Text style={[styles.channelLabel,chatScope===scope&&styles.channelLabelSelected]}>{label}</Text>
          </TouchableOpacity>)}
        </View>
        <View style={styles.rowBetween}>
          <Chip color={chatState==='connected'?C.lime:chatState==='error'?C.red:C.orange}>
            {chatState==='connected'?'LIVE SYNC':chatState==='error'?'CONNECTION ERROR':chatState==='syncing'?'OFFLINE / CACHED':'CONNECTING'}
          </Chip>
          <Text style={styles.subtleLabel}>{chatAudience} CAN RECEIVE</Text>
        </View>
        <Text style={styles.muted}>{isTeam
          ? `Private ${me?.team==='hunter'?'Hunter':'Runner'} channel. Only ${chatAudience} player(s) are on this team.`
          : `Shared room channel. All ${players.length} joined players can read messages.`}</Text>
        {isTeam && chatAudience<2 && <Text style={styles.infoText}>You're the only player on this team. Choose All Players to message your friend in a 2-player game.</Text>}
        {chatError && <View style={styles.errorBox}>
          <Text style={styles.errorText}>{chatError}</Text>
          <Button secondary onPress={()=>setChatRetry(x=>x+1)}>Reconnect chat</Button>
        </View>}
      </Card>
      <Card style={styles.chatPanel}>
        <View style={styles.rowBetween}>
          <Kicker>MESSAGES · {isTeam?'TEAM':'ROOM'}</Kicker>
          <Text style={styles.subtleLabel}>{messages.length} RECENT</Text>
        </View>
        {chatState==='connecting' && <ActivityIndicator color={C.lime}/>}
        <ScrollView ref={chatScrollRef} onContentSizeChange={()=>chatScrollRef.current?.scrollToEnd({animated:false})} nestedScrollEnabled style={styles.chatScroll} contentContainerStyle={{gap:11,paddingVertical:8}}>
          {messages.length===0?<View style={styles.emptyMessages}>
            <Text style={styles.emptyIcon}>✉</Text><Text style={styles.white}>No messages yet</Text>
            <Text style={styles.muted}>{isTeam?'Send your team a message.':'Send a quick hello to everyone in the match.'}</Text>
          </View>:messages.map(message=><View key={message.id} style={[
              styles.bubble,message.senderUid===user?.uid&&styles.myBubble,
            ]}>
              <View style={styles.rowBetween}>
                <Text style={styles.senderName}>{message.senderUid===user?.uid?'YOU':players.find(p=>p.uid===message.senderUid)?.name||'Player'}</Text>
                <Text style={styles.subtleLabel}>{message.pending?'SENDING…':'✓'}</Text>
              </View>
              <Text style={styles.white}>{message.text}</Text>
            </View>)}
        </ScrollView>
        {!completed && <>
          <Kicker>ONE-TAP SIGNALS</Kicker>
          <View style={styles.signals}>{QUICK_SIGNALS.map(signal=><TouchableOpacity key={signal}
            accessibilityRole="button" disabled={chatBusy} style={styles.signal}
            onPress={()=>{playSfx('tap');sendMessage(signal);}}>
            <Text style={styles.signalText}>{signal}</Text></TouchableOpacity>)}</View>
          <TextInput style={styles.input} placeholder={isTeam?'Message your team…':'Message all players…'} placeholderTextColor={C.muted}
            value={chatDraft} onChangeText={setChatDraft} maxLength={CHAT_LENGTH} editable={!chatBusy}/>
          <Button disabled={chatBusy || !chatDraft.trim()} onPress={()=>sendMessage(chatDraft)}>
            {chatBusy?'Sending…':`➤ Send to ${isTeam?'team':'everyone'}`}
          </Button>
        </>}
        {chatFromCache && <Text style={styles.infoText}>Messages are currently cached. Check your internet connection for live delivery.</Text>}
      </Card>
    </>;
  }
  function renderPlayers(){
    return <>
      <Card>
        <Kicker>THE CREW</Kicker><Text style={styles.largeTitle}>{players.length} players</Text>
        <Text style={styles.muted}>Roles are assigned randomly when everyone is ready.</Text>
        {players.map(p=><View key={p.uid} style={styles.playerRow}>
          <MiniAvatar name={p.name} color={p.team==='hunter'?C.blue:p.team==='runner'?C.orange:C.lime}/>
          <View style={{flex:1}}><Text style={styles.playerName}>{p.name}{p.uid===user?.uid?' · You':''}</Text>
            <Text style={styles.subtleLabel}>{p.caught?'Tagged':p.sharingEnabled && pings.some(v=>v.uid===p.uid)?'Approximate ping visible':'Location not shared / no recent ping'}</Text></View>
          <Text style={[styles.playerRole,{color:p.team==='hunter'?C.blue:C.orange}]}>{p.team.toUpperCase()}</Text>
        </View>)}
      </Card>
      <Card><Kicker>FAIR PLAY</Kicker><Text style={styles.muted}>No contact or chasing near traffic. The rest-zone and GPS perimeter are approximate. Ask for consent before tagging and play only on permitted paths.</Text></Card>
    </>;
  }

  return <SoundContext.Provider value={playSfx}><SafeAreaView style={styles.safe}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <View><Kicker>WALK • PLAY • CONNECT</Kicker><Text style={styles.brand}>MANHUNT<Text style={{color:C.lime}}> / </Text><Text style={styles.brandLight}>WALK</Text></Text></View>
        <View style={styles.headerTools}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={soundOn?'Mute game sounds':'Enable game sounds'}
            onPress={()=>setSoundOn(v=>!v)} style={styles.soundToggle}>
            <Text style={styles.soundToggleText}>{soundOn?'♪ ON':'♪ OFF'}</Text>
          </TouchableOpacity>
          <Chip color={roomId?C.lime:C.muted}>{roomId?'MATCH':'LOBBY'}</Chip>
        </View>
      </View>
      {!configured?<Card><Kicker>SETUP REQUIRED</Kicker><Text style={styles.largeTitle}>Connect Firebase</Text>
        <Text style={styles.muted}>Set the EXPO_PUBLIC_FIREBASE_* variables in .env and publish the v0.5 firestore.rules.</Text></Card>
      :loadingUser || !user?<Card style={{alignItems:'center',paddingVertical:44}}><ActivityIndicator color={C.lime}/><Text style={styles.muted}>Signing in…</Text></Card>
      :!roomId?<>
        <Card style={styles.welcomeCard}>
          <Text style={styles.heroIcon}>◉</Text><Kicker>THE REAL-WORLD TEAM GAME</Kicker>
          <Text style={styles.heroTitle}>{'One arena.\nTwo secret roles.'}</Text>
          <Text style={styles.muted}>A private, walking-only game for friends. Random Hunters and Runners. No automatic GPS tagging.</Text>
          <View style={styles.welcomePills}><Chip color={C.orange}>2–8 PLAYERS</Chip><Chip>30 MINUTES</Chip></View>
        </Card>
        <Card><Kicker>01 / HOST</Kicker><Text style={styles.cardHeading}>Create a game</Text>
          <Text style={styles.inputLabel}>YOUR NICKNAME</Text>
          <TextInput style={styles.input} placeholder="Enter player name" placeholderTextColor={C.muted}
            maxLength={24} value={name} onChangeText={setName} autoCapitalize="words"/>
          <Text style={styles.inputLabel}>PLAY AREA (METRES)</Text>
          <View style={styles.choiceRow}>{[150,250,400].map(value=><TouchableOpacity key={value} onPress={()=>setRadius(value)}
            style={[styles.choice,radius===value&&styles.choiceActive]}><Text style={[styles.choiceText,radius===value&&styles.choiceTextActive]}>{value}m</Text></TouchableOpacity>)}</View>
          <Button disabled={busy} onPress={createRoom}>{busy?'Creating…':'＋ Create private room'}</Button>
        </Card>
        <Card><Kicker>02 / JOIN</Kicker><Text style={styles.cardHeading}>Have a room code?</Text>
          <TextInput style={[styles.input,styles.codeInput]} value={invite}
            onChangeText={v=>setInvite(v.toUpperCase().replace(/\s/g,''))} autoCapitalize="characters"
            placeholder="ABCD2345" placeholderTextColor={C.muted} maxLength={8}/>
          <Button secondary disabled={busy} onPress={joinRoom}>Join a friend's game →</Button>
        </Card>
      </>:!room?<Card><ActivityIndicator color={C.lime}/><Text style={styles.muted}>Connecting to room…</Text></Card>
      :room.status==='lobby'?<>
        <Card style={styles.inviteCard}>
          <Kicker>PRIVATE LOBBY</Kicker><Text style={styles.cardHeading}>Invite the crew</Text>
          <Text style={styles.roomCode}>{room.id}</Text>
          <Text style={styles.muted}>Share only with people who agree to play in a permitted, safe area.</Text>
          <Button secondary onPress={shareRoom}>↗ Share invite code</Button>
        </Card>
        <Card>
          <View style={styles.rowBetween}><Kicker>READY CHECK</Kicker><Text style={styles.whiteSmall}>{readyCount}/{players.length} READY</Text></View>
          <View style={styles.progressBase}><View style={[styles.progressFill,{width:`${players.length?readyCount/players.length*100:0}%`}]}/></View>
          {players.map(p=><View key={p.uid} style={styles.playerRow}><MiniAvatar name={p.name}/>
            <Text style={[styles.playerName,{flex:1}]}>{p.name}{p.uid===user.uid?' · You':''}</Text>
            <Text style={[styles.playerRole,{color:p.ready?C.lime:C.muted}]}>{p.ready?'✓ READY':'WAITING'}</Text></View>)}
          <Button secondary onPress={toggleReady}>{me?.ready?'✓ Ready — tap to undo':'○ I agree to safe play — Ready'}</Button>
          {isHost?<Button disabled={!everyoneReady || busy} onPress={startGame}>{busy?'Assigning roles…':'🎲 Assign random roles & start'}</Button>
          :<Text style={styles.muted}>Host will start when everyone is ready.</Text>}
          <Text style={styles.infoText}>Hunter count: {players.length<6?1:2}. Your role stays unknown until match start.</Text>
        </Card>
        <Button secondary onPress={leaveRoom}>Leave room</Button>
      </>:revealingRole?<>
        <Card style={[styles.revealCard,{borderColor:me?.team==='hunter'?C.blue:C.orange}]}>
          <Kicker>SECRET ROLE ASSIGNED</Kicker><Text style={styles.revealIcon}>{me?.team==='hunter'?'◎':'◇'}</Text>
          <Text style={styles.revealHeading}>{me?.team==='hunter'?'YOU ARE A HUNTER':me?.team==='runner'?'YOU ARE A RUNNER':'ASSIGNING…'}</Text>
          <Text style={styles.muted}>{me?.team==='hunter'?'Find runners through safe, consensual play.':'Stay inside the approved game area and use your team messages.'}</Text>
          <Text style={styles.revealCounter}>{Math.max(1,Math.ceil((room.startedAt-tick)/1000))}</Text>
          <Text style={styles.infoText}>Only you should look at this screen. GPS stays off until you enable it.</Text>
        </Card><Button secondary onPress={leaveRoom}>Leave room</Button>
      </>:<>
        <View style={styles.matchHero}>
          <View><Kicker>◉ LIVE ARENA  ·  {room.id}</Kicker><Text style={styles.clock}>{timeLabel(result.secondsLeft)}</Text><Text style={styles.subtleLabel}>TIME REMAINING</Text></View>
          <View style={{alignItems:'flex-end'}}><Chip color={completed?C.muted:C.lime}>{completed?'FINISHED':'MATCH LIVE'}</Chip>
            <Text style={[styles.roleHeading,{color:me?.team==='hunter'?C.blue:C.orange}]}>{me?.team==='hunter'?'◎ HUNTER':me?.team==='runner'?'◇ RUNNER':'PLAYER'}</Text></View>
        </View>
        <View style={styles.missionCard}>
          <Text style={styles.missionLabel}>YOUR OBJECTIVE</Text>
          <Text style={styles.missionText}>{completed?'Game complete. Return to the meeting area.':me?.team==='hunter'
            ?'Find teammates, use consensual tags, and stay on approved paths.'
            :'Coordinate with your team, stay within the boundary, and play safely.'}</Text>
        </View>
        <View style={styles.tabs}>{[['arena','◉ Arena'],['team',unreadChatCount?`✉ Chat (${unreadChatCount})`:'✉ Chat'],['players','♟ Crew']].map(([id,label])=><TouchableOpacity
          key={id} style={[styles.tab,tab===id&&styles.activeTab]} onPress={()=>{playSfx('tap');setTab(id);if(id==='team') setUnreadChatCount(0);}}>
          <Text style={[styles.tabText,tab===id&&styles.activeTabText]}>{label}</Text>
        </TouchableOpacity>)}</View>
        {tab==='arena'?renderArena():tab==='team'?renderChat():renderPlayers()}
        {isHost && !completed && <Button secondary onPress={finishGame}>End match</Button>}
        <Button secondary onPress={leaveRoom}>Leave / stop sharing</Button>
      </>}
      <Text style={styles.safety}>ONLY WITH CONSENT · WALK, DO NOT CHASE · STAY AWAY FROM ROADS AND RESTRICTED AREAS · GPS IS APPROXIMATE</Text>
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView></SoundContext.Provider>;
}

const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:C.background},
  page:{padding:18,paddingBottom:42,gap:15},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,marginTop:8,marginBottom:4},
  kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.6},
  brand:{color:C.white,fontSize:22,fontWeight:'900',letterSpacing:-0.7,marginTop:4},
  brandLight:{fontWeight:'400',color:C.muted},
  chip:{flexDirection:'row',alignItems:'center',paddingHorizontal:10,paddingVertical:8,backgroundColor:'#1D2A3A',borderRadius:30,gap:6},
  chipDot:{height:6,width:6,borderRadius:6},
  chipText:{fontSize:9,fontWeight:'900',color:C.white,letterSpacing:0.7},
  card:{backgroundColor:C.panel,borderRadius:21,padding:18,borderColor:C.edge,borderWidth:1,gap:13},
  cardHeading:{fontSize:21,fontWeight:'900',color:C.white,letterSpacing:-0.5},
  largeTitle:{fontSize:26,fontWeight:'900',color:C.white,letterSpacing:-0.7},
  white:{color:C.white,fontSize:14,lineHeight:21},
  whiteSmall:{color:C.white,fontSize:12,fontWeight:'800'},
  muted:{color:C.muted,fontSize:13,lineHeight:20},
  inputLabel:{fontSize:10,color:C.muted,fontWeight:'900',letterSpacing:1.2},
  input:{backgroundColor:'#0B1320',borderColor:C.edge,borderWidth:1,color:C.white,borderRadius:13,padding:14,fontSize:16,minHeight:50},
  codeInput:{letterSpacing:4,fontWeight:'900',fontSize:20,textAlign:'center'},
  button:{minHeight:52,borderRadius:14,backgroundColor:C.lime,alignItems:'center',justifyContent:'center',paddingHorizontal:12,paddingVertical:13},
  buttonText:{fontSize:14,fontWeight:'900',color:'#0C1710',textAlign:'center'},
  buttonSecondary:{backgroundColor:C.panel2,borderColor:C.edge,borderWidth:1},
  buttonTextSecondary:{color:C.white},
  buttonDanger:{backgroundColor:C.red},
  disabled:{opacity:0.45},
  rowBetween:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},
  welcomeCard:{backgroundColor:'#102D39',borderColor:'#346F77',paddingVertical:26},
  heroIcon:{fontSize:55,color:C.lime},
  heroTitle:{fontSize:33,color:C.white,fontWeight:'900',lineHeight:36,letterSpacing:-1},
  welcomePills:{flexDirection:'row',gap:8,flexWrap:'wrap'},
  choiceRow:{flexDirection:'row',gap:8},
  choice:{flex:1,borderWidth:1,borderColor:C.edge,backgroundColor:C.panel2,borderRadius:13,paddingVertical:13,alignItems:'center'},
  choiceActive:{backgroundColor:C.lime,borderColor:C.lime},
  choiceText:{color:C.white,fontWeight:'900',fontSize:13},
  choiceTextActive:{color:C.dark},
  inviteCard:{alignItems:'stretch'},
  roomCode:{fontSize:39,color:C.white,fontWeight:'900',letterSpacing:6,textAlign:'center',paddingVertical:8},
  progressBase:{height:8,borderRadius:10,backgroundColor:C.panel2,overflow:'hidden'},
  progressFill:{height:'100%',backgroundColor:C.lime,borderRadius:10},
  playerRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:9,borderBottomWidth:1,borderBottomColor:C.edge},
  avatar:{width:36,height:36,borderRadius:12,borderWidth:1,alignItems:'center',justifyContent:'center'},
  avatarText:{fontSize:15,fontWeight:'900'},
  playerName:{color:C.white,fontSize:14,fontWeight:'800'},
  playerRole:{fontSize:10,fontWeight:'900',letterSpacing:0.3},
  subtleLabel:{fontSize:10,color:C.muted,fontWeight:'700',marginTop:3},
  revealCard:{alignItems:'center',paddingVertical:40},
  revealIcon:{fontSize:85,color:C.lime,marginVertical:12},
  revealHeading:{fontSize:26,color:C.white,fontWeight:'900',textAlign:'center'},
  revealCounter:{fontSize:64,color:C.lime,fontWeight:'900',fontVariant:['tabular-nums']},
  matchHero:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,marginTop:4,backgroundColor:'#16263A',borderRadius:19,borderColor:'#324C67',borderWidth:1,padding:15},
  clock:{fontSize:41,fontWeight:'900',fontVariant:['tabular-nums'],color:C.white,letterSpacing:-1.8,marginTop:3},
  roleHeading:{fontSize:16,fontWeight:'900',marginTop:10},
  tabs:{flexDirection:'row',gap:5,backgroundColor:C.panel,borderRadius:15,padding:5,borderColor:C.edge,borderWidth:1},
  tab:{flex:1,paddingVertical:13,alignItems:'center',borderRadius:11},
  activeTab:{backgroundColor:C.lime},
  tabText:{fontSize:12,fontWeight:'900',color:C.muted},
  activeTabText:{color:C.dark},
  sectionTitleRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  sectionTitle:{fontSize:20,color:C.white,fontWeight:'900',marginTop:4},
  segment:{flexDirection:'row',backgroundColor:C.panel2,borderRadius:10,padding:3},
  segmentItem:{paddingHorizontal:12,paddingVertical:9,borderRadius:8},
  segmentSelected:{backgroundColor:C.lime},
  segmentText:{fontSize:11,fontWeight:'900',color:C.muted},
  segmentSelectedText:{color:C.dark},
  arenaCard:{padding:10},
  radarStage:{width:'100%',aspectRatio:1,backgroundColor:'#0E2130',borderRadius:17,overflow:'hidden',alignItems:'center',justifyContent:'center'},
  radarCircle:{position:'absolute',width:'86%',height:'86%',borderWidth:2,borderColor:C.lime+'91',borderRadius:1000,backgroundColor:'rgba(184,245,124,0.025)'},
  radarMiddle:{position:'absolute',width:'58%',height:'58%',borderWidth:1,borderColor:'#446879',borderRadius:1000},
  radarInner:{position:'absolute',width:'23%',height:'23%',borderWidth:1,borderColor:C.blue,borderRadius:1000,backgroundColor:'rgba(135,197,255,0.09)'},
  radarVertical:{position:'absolute',height:'86%',width:1,backgroundColor:'#29485B'},
  radarHorizontal:{position:'absolute',width:'86%',height:1,backgroundColor:'#29485B'},
  radarCompass:{position:'absolute',top:12,alignItems:'center'},
  radarCompassText:{color:C.muted,fontSize:12,fontWeight:'900'},
  radarCenter:{backgroundColor:'#24405A',borderRadius:20,paddingHorizontal:7,paddingVertical:3,zIndex:2},
  radarCenterText:{color:C.blue,fontSize:9,fontWeight:'900'},
  radarDot:{position:'absolute',width:25,height:25,borderRadius:13,alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:C.dark,zIndex:4},
  radarDotText:{fontSize:12,color:C.dark,fontWeight:'900'},
  radarSelf:{position:'absolute',width:16,height:16,borderRadius:8,backgroundColor:C.white,borderWidth:3,borderColor:'#24C7FC',zIndex:5},
  radarScale:{position:'absolute',bottom:9,color:C.muted,fontSize:8,fontWeight:'900',letterSpacing:0.5},
  mapHint:{color:C.muted,fontSize:11,lineHeight:17,paddingHorizontal:6},
  mapWrap:{height:420,overflow:'hidden',backgroundColor:'#1A2A35',borderRadius:19,borderColor:C.edge,borderWidth:1},
  mapOverlay:{position:'absolute',left:10,top:10,backgroundColor:'rgba(9,16,26,0.9)',paddingHorizontal:11,paddingVertical:8,borderRadius:10},
  mapOverlayText:{fontSize:9,fontWeight:'900',color:C.white},
  mapFallback:{position:'absolute',bottom:13,alignSelf:'center',backgroundColor:C.panel,paddingVertical:10,paddingHorizontal:14,borderRadius:14,borderColor:C.edge,borderWidth:1},
  mapFallbackText:{fontSize:12,fontWeight:'900',color:C.white},
  infoText:{color:C.orange,fontSize:12,lineHeight:18},
  statGrid:{flexDirection:'row',gap:8},
  statTile:{flex:1,backgroundColor:C.panel,borderRadius:15,borderWidth:1,borderColor:C.edge,padding:12,gap:8},
  statLabel:{fontSize:9,color:C.muted,fontWeight:'900',letterSpacing:0.5},
  statValue:{color:C.white,fontSize:23,fontWeight:'900'},
  sharingCard:{gap:13},
  hairline:{height:1,backgroundColor:C.edge},
  errorText:{fontSize:12,color:C.red,lineHeight:19},
  errorBox:{backgroundColor:'#38212B',padding:12,borderRadius:12,gap:8},
  resultCard:{borderColor:C.lime},
  chatScroll:{maxHeight:355,minHeight:185},
  bubble:{padding:12,backgroundColor:C.panel2,borderRadius:13,maxWidth:'88%',alignSelf:'flex-start',gap:6},
  myBubble:{backgroundColor:'#254637',alignSelf:'flex-end'},
  senderName:{color:C.lime,fontSize:10,fontWeight:'900'},
  emptyMessages:{alignItems:'center',paddingVertical:24,gap:8},
  emptyIcon:{fontSize:34,color:C.muted},
  signals:{flexDirection:'row',flexWrap:'wrap',gap:8},
  signal:{borderRadius:12,borderWidth:1,borderColor:C.edge,backgroundColor:C.panel2,paddingHorizontal:11,paddingVertical:10},
  signalText:{fontSize:11,fontWeight:'800',color:C.white},
  headerTools:{flexDirection:'row',alignItems:'center',gap:7},
  soundToggle:{paddingHorizontal:10,paddingVertical:9,borderRadius:11,backgroundColor:C.panel2,borderWidth:1,borderColor:C.edge},
  soundToggleText:{fontSize:10,fontWeight:'900',color:C.lime},
  missionCard:{backgroundColor:'#17313E',borderColor:'#396776',borderWidth:1,borderRadius:16,padding:14,gap:5},
  missionLabel:{fontSize:10,color:C.lime,fontWeight:'900',letterSpacing:1.1},
  missionText:{color:C.white,fontSize:12,lineHeight:19,fontWeight:'700'},
  channelRow:{flexDirection:'row',gap:8},
  channelButton:{flex:1,minHeight:47,alignItems:'center',justifyContent:'center',padding:7,borderRadius:13,borderColor:C.edge,borderWidth:1,backgroundColor:C.panel2},
  channelButtonSelected:{borderColor:C.lime,backgroundColor:'#2F4932'},
  channelLabel:{fontSize:12,fontWeight:'900',color:C.muted},
  channelLabelSelected:{color:C.lime},
  chatIntro:{gap:13},
  chatPanel:{gap:12},
  legendRow:{flexDirection:'row',justifyContent:'space-between',gap:7},
  legendText:{fontSize:10,color:C.lime,fontWeight:'800'},
  mapControls:{position:'absolute',bottom:12,right:12,left:12,flexDirection:'row',gap:8,justifyContent:'space-between'},
  mapControl:{paddingHorizontal:12,paddingVertical:10,borderRadius:12,backgroundColor:'rgba(9,16,26,0.91)',borderWidth:1,borderColor:'#3A526A'},
  mapControlText:{color:C.white,fontSize:11,fontWeight:'900'},
  safety:{fontSize:10,color:C.muted,letterSpacing:0.3,lineHeight:17,textAlign:'center',marginTop:9},
});
