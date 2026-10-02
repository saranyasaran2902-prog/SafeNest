import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();
const __filename=fileURLToPath(import.meta.url), __dirname=path.dirname(__filename);
const dataDir=path.join(__dirname,"data"), dbFile=path.join(dataDir,"db.json");
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir,{recursive:true});
if(!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify({reports:[],contacts:[],child:{id:"child-1",name:"Aarav",age:10,status:"Safe",latitude:13.0827,longitude:80.2707,accuracy:null,speed:0,updatedAt:null},geofence:{enabled:true,latitude:13.0827,longitude:80.2707,radiusMeters:500},alerts:[]},null,2));
const readDb=()=>JSON.parse(fs.readFileSync(dbFile,"utf8"));
const writeDb=db=>fs.writeFileSync(dbFile,JSON.stringify(db,null,2));
const app=express(); app.use(cors()); app.use(express.json({limit:"100kb"}));
function distanceMeters(lat1,lon1,lat2,lon2){const R=6371000,toRad=d=>d*Math.PI/180,dLat=toRad(lat2-lat1),dLon=toRad(lon2-lon1),a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
function addAlert(db,type,message){const alert={id:crypto.randomUUID(),type,message,createdAt:new Date().toISOString(),channels:["in-app"]};db.alerts.unshift(alert);db.alerts=db.alerts.slice(0,100);return alert;}
async function sendSms(alert){const {TWILIO_ACCOUNT_SID:sid,TWILIO_AUTH_TOKEN:token,TWILIO_PHONE_NUMBER:from,GUARDIAN_PHONE_NUMBER:to}=process.env;if(!sid||!token||!from||!to)return {sent:false,reason:"Twilio not configured"};try{const body=new URLSearchParams({From:from,To:to,Body:`CHILD SAFETY ALERT: ${alert.message}`});const r=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,{method:"POST",headers:{Authorization:`Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,"Content-Type":"application/x-www-form-urlencoded"},body});return {sent:r.ok,status:r.status};}catch(e){return {sent:false,reason:e.message};}}
app.get("/api/health",(_,res)=>res.json({ok:true}));
app.get("/api/state",(_,res)=>{const db=readDb();res.json({child:db.child,geofence:db.geofence,alerts:db.alerts,contacts:db.contacts});});
app.get("/api/reports",(_,res)=>{const db=readDb();res.json({reports:db.reports.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))});});
app.post("/api/reports",(req,res)=>{const {category,description,location,urgency}=req.body;if(!category||!description)return res.status(400).json({message:"Category and description are required."});const db=readDb(),report={id:crypto.randomUUID(),category,description:String(description).slice(0,3000),location:String(location||"Not provided").slice(0,500),urgency:urgency||"Medium",status:"New",createdAt:new Date().toISOString()};db.reports.unshift(report);writeDb(db);res.status(201).json({report});});
app.get("/api/contacts",(_,res)=>res.json({contacts:readDb().contacts}));
app.post("/api/contacts",(req,res)=>{const {name,relation,phone}=req.body;if(!name||!phone)return res.status(400).json({message:"Name and phone are required."});const db=readDb(),contact={id:crypto.randomUUID(),name:String(name).slice(0,100),relation:String(relation||"Trusted contact").slice(0,100),phone:String(phone).slice(0,40)};db.contacts.push(contact);writeDb(db);res.status(201).json({contact});});
app.post("/api/location",async(req,res)=>{const {latitude,longitude,accuracy,speed}=req.body;if(!Number.isFinite(latitude)||!Number.isFinite(longitude))return res.status(400).json({message:"Valid latitude and longitude are required."});const db=readDb(),previous=db.child.status;db.child={...db.child,latitude,longitude,accuracy:Number.isFinite(accuracy)?accuracy:null,speed:Number.isFinite(speed)?speed:0,updatedAt:new Date().toISOString()};let outside=false,distance=null,alert=null;if(db.geofence.enabled){distance=distanceMeters(latitude,longitude,db.geofence.latitude,db.geofence.longitude);outside=distance>db.geofence.radiusMeters;}db.child.status=outside?"Outside safe boundary":"Safe";if(outside&&previous!=="Outside safe boundary"){alert=addAlert(db,"GEOFENCE_EXIT",`${db.child.name} has crossed the safe boundary. Distance from safe center: ${Math.round(distance)} m.`);sendSms(alert).then(r=>{if(r.sent){const d=readDb();const a=d.alerts.find(x=>x.id===alert.id);if(a)a.channels.push("sms");writeDb(d);}});}writeDb(db);res.json({child:db.child,geofence:db.geofence,outside,distanceMeters:distance,alert});});
app.post("/api/geofence",(req,res)=>{const {latitude,longitude,radiusMeters,enabled}=req.body;if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||!Number.isFinite(radiusMeters)||radiusMeters<20)return res.status(400).json({message:"Valid center and radius >= 20m required."});const db=readDb();db.geofence={enabled:enabled!==false,latitude,longitude,radiusMeters};db.child.status="Safe";writeDb(db);res.json(db.geofence);});
app.post("/api/test-alert",async(_,res)=>{const db=readDb(),alert=addAlert(db,"TEST","This is a test child-safety alert. Check your configured notification channels.");writeDb(db);const external=await sendSms(alert);if(external.sent){const d=readDb();const a=d.alerts.find(x=>x.id===alert.id);if(a)a.channels.push("sms");writeDb(d);}res.json({alert,external});});
app.post("/api/sos",(req,res)=>{const db=readDb();const alert=addAlert(db,"SOS","SOS / Get Help was activated from the guardian dashboard.");writeDb(db);console.log("[DEMO SOS]",new Date().toISOString(),req.body||{});res.json({ok:true,alert,message:"SOS workflow recorded. Configure verified emergency contacts/telephony for production."});});
app.get("/api/alerts",(_,res)=>res.json(readDb().alerts));
app.use((err,_,res,__)=>{console.error(err);res.status(500).json({message:"Internal server error."});});
const PORT=process.env.PORT||5000;app.listen(PORT,()=>console.log(`SafeNest API running at http://localhost:${PORT}`));
