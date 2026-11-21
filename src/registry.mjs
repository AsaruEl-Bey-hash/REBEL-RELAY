import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const IDS = ['terra','ghost','root','echo','oracle','nyx'];
const ENV = {terra:'ELEVENLABS_VOICE_ID_TERRA',ghost:'ELEVENLABS_VOICE_ID_GHOST',root:'ELEVENLABS_VOICE_ID_ROOT',echo:'ELEVENLABS_VOICE_ID_ECHO',oracle:'ELEVENLABS_VOICE_ID_ORACLE',nyx:'ELEVENLABS_VOICE_ID_NYX'};
const deepMerge = (base, patch) => {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return base;
  const result = {...base};
  for (const [key,value] of Object.entries(patch)) result[key] = value && typeof value === 'object' && !Array.isArray(value) ? deepMerge(base[key] ?? {}, value) : value;
  return result;
};
export async function loadAgents({overridesPath = join(ROOT,'config/agent-overrides.local.json'), env = process.env} = {}) {
  const agents = await Promise.all(IDS.map(async (id) => JSON.parse(await readFile(join(ROOT,'agents',`${id}.json`),'utf8'))));
  let overrides = {};
  try { overrides = JSON.parse(await readFile(overridesPath,'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const byId = new Map(agents.map(a=>[a.id,a]));
  for (const [id,patch] of Object.entries(overrides)) {
    if (!byId.has(id)) throw new Error(`Unknown agent override: ${id}`);
    const protectedFields = ['id','desk','role','mission'];
    if (protectedFields.some((field)=>field in patch)) throw new Error(`Overrides cannot change role boundaries for ${id}`);
    byId.set(id,deepMerge(byId.get(id),patch));
  }
  return IDS.map((id)=>{
    const agent = structuredClone(byId.get(id));
    agent.voice.voiceId = env[ENV[id]] || null;
    agent.voice.modelId = env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5';
    return agent;
  });
}
export async function getAgent(id, options) { const agent=(await loadAgents(options)).find(a=>a.id===id); if(!agent) throw new Error(`Unknown REBEL RELAY agent: ${id}`); return agent; }
export { IDS as AGENT_IDS };
