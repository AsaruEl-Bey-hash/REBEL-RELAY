import {loadAgents,getAgent} from './registry.mjs';
const [command,arg]=process.argv.slice(2);
if(command==='show'&&arg){const a=await getAgent(arg); console.log(JSON.stringify(a,null,2));}
else if(command==='list'){for(const a of await loadAgents())console.log(`${a.name.padEnd(7)} ${a.desk} — ${a.role}`);}
else {console.log('REBEL RELAY\n\n  npm start -- list\n  npm start -- show <terra|ghost|root|echo|oracle|nyx>');}
