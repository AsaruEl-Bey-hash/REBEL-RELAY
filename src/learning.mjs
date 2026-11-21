import {appendFile, readFile, mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
const ALLOWED = new Set(['tone','format','workflow','source_preference','accessibility']);
const MAX_NOTE = 300;
/** Memory is explicit editor feedback about process, not a place to store claims as facts. */
export function validateFeedback(input) {
  if (!input || input.approved !== true) throw new Error('Only editor-approved feedback can be saved.');
  if (!ALLOWED.has(input.category)) throw new Error('Feedback category is not permitted.');
  const note=String(input.note??'').trim();
  if(note.length<8||note.length>MAX_NOTE) throw new Error(`Feedback must be 8-${MAX_NOTE} characters.`);
  if(/https?:\/\/|\b(claim is true|confirmed fact|the truth is)\b/i.test(note)) throw new Error('Do not store source links or factual verdicts as agent memory. Save evidence in the case record instead.');
  return {agentId:String(input.agentId??''),category:input.category,note,approved:true,approvedBy:String(input.approvedBy??''),createdAt:new Date().toISOString()};
}
export async function saveFeedback(input,{path='learning/approved-feedback.jsonl'}={}) {
  const record=validateFeedback(input);
  if(!record.agentId||!record.approvedBy) throw new Error('Agent and approving editor are required.');
  await mkdir(dirname(path),{recursive:true}); await appendFile(path,JSON.stringify(record)+'\n',{mode:0o600}); return record;
}
export async function getFeedback(agentId,{path='learning/approved-feedback.jsonl'}={}) {
  let contents; try{contents=await readFile(path,'utf8')}catch(e){if(e.code==='ENOENT')return [];throw e;}
  return contents.split('\n').filter(Boolean).map(line=>JSON.parse(line)).filter(record=>record.agentId===agentId);
}
