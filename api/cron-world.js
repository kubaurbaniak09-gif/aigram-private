export default async function handler(req,res){
  if(process.env.CRON_SECRET && req.headers.authorization!==`Bearer ${process.env.CRON_SECRET}`){return res.status(401).json({ok:false,error:'Unauthorized'});}
  return res.status(200).json({ok:true,message:'AIgram cron endpoint ready. Persistent world mutations can be enabled after DATABASE_URL is configured.',serverTime:Date.now()});
}
