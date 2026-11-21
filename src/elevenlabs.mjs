/** Server-side ElevenLabs adapter. Never expose ELEVENLABS_API_KEY to the browser. */
export async function speak(agent, text, {env=process.env, fetchImpl=fetch}={}) {
  const apiKey=env.ELEVENLABS_API_KEY;
  const voiceId=env[agent.voice.voiceIdEnv] || agent.voice.voiceId;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not configured');
  if (!voiceId) throw new Error(`Choose an ElevenLabs voice for ${agent.name} in the connected account and set ${agent.voice.voiceIdEnv}`);
  const spoken=String(text).replace(/https?:\/\/\S+/g,'link').replace(/[#*_`>|]/g,' ').replace(/\s+/g,' ').trim().slice(0,4500);
  if (!spoken) throw new Error('No text to speak');
  const response=await fetchImpl(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream?output_format=mp3_44100_128`,{
    method:'POST',headers:{'xi-api-key':apiKey,'Content-Type':'application/json','Accept':'audio/mpeg'},
    body:JSON.stringify({text:spoken,model_id:agent.voice.modelId||env.ELEVENLABS_MODEL_ID||'eleven_flash_v2_5',voice_settings:{...agent.voice.settings,use_speaker_boost:true}}),signal:AbortSignal.timeout(30000)
  });
  if(!response.ok) throw new Error(`ElevenLabs speech request failed (${response.status}): ${(await response.text()).slice(0,240)}`);
  return response;
}
