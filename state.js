import pg from 'pg';
const { Pool } = pg;
let pool;
const memory = globalThis.__aigramMemory || (globalThis.__aigramMemory = new Map());

const DEFAULT_ORIGINS = new Set([
  'https://kubaurbaniak09-gif.github.io',
  'https://aigram-private.vercel.app'
]);
function cors(req,res){
  const extras=(process.env.ALLOWED_ORIGIN||'').split(',').map(x=>x.trim().replace(/\/$/,'')).filter(Boolean);
  const ok=new Set([...DEFAULT_ORIGINS,...extras]);
  const o=req.headers.origin;
  if(!o||ok.has(o.replace(/\/$/,'')))res.setHeader('Access-Control-Allow-Origin',o||'*');
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
}
function db(){
  if(!process.env.DATABASE_URL)return null;
  if(!pool)pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_URL.includes('localhost')?false:{rejectUnauthorized:false}});
  return pool;
}
async function ensure(p){await p.query(`create table if not exists aigram_worlds(id text primary key,state_json jsonb not null,updated_at timestamptz default now())`)}
export default async function handler(req,res){
  cors(req,res);if(req.method==='OPTIONS')return res.status(204).end();
  const worldId=String(req.query?.worldId||req.body?.worldId||'').trim();
  if(!worldId)return res.status(400).json({ok:false,error:'worldId required'});
  try{
    const p=db();
    if(req.method==='GET'){
      if(p){await ensure(p);const q=await p.query('select state_json,updated_at from aigram_worlds where id=$1',[worldId]);if(!q.rowCount)return res.status(200).json({ok:true,state:null,updatedAt:0,persistent:true});const r=q.rows[0];return res.status(200).json({ok:true,state:r.state_json,updatedAt:new Date(r.updated_at).getTime(),persistent:true});}
      const r=memory.get(worldId);return res.status(200).json({ok:true,state:r?.state||null,updatedAt:r?.updatedAt||0,persistent:false});
    }
    if(req.method==='POST'){
      const state=req.body?.state;if(!state||typeof state!=='object')return res.status(400).json({ok:false,error:'state object required'});
      const updatedAt=Date.now();
      if(p){await ensure(p);await p.query(`insert into aigram_worlds(id,state_json,updated_at) values($1,$2,to_timestamp($3/1000.0)) on conflict(id) do update set state_json=excluded.state_json,updated_at=excluded.updated_at`,[worldId,JSON.stringify(state),updatedAt]);return res.status(200).json({ok:true,updatedAt,persistent:true});}
      memory.set(worldId,{state,updatedAt});return res.status(200).json({ok:true,updatedAt,persistent:false,warning:'DATABASE_URL not configured; state is temporary'});
    }
    return res.status(405).json({ok:false,error:'Method not allowed'});
  }catch(e){console.error('state error',e);return res.status(500).json({ok:false,error:e.message||'State error'});}
}
