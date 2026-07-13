import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read .env.local
const envPath = resolve(__dirname, '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) env[key.trim()] = vals.join('=').trim()
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Find Parth's profile and upgrade to Pro
const { data: profiles, error: fetchErr } = await supabase
  .from('profiles')
  .select('id, full_name, subscription_tier')
  .ilike('full_name', '%parth%')

if (fetchErr) {
  console.error('Error fetching profiles:', fetchErr.message)
  process.exit(1)
}

if (!profiles || profiles.length === 0) {
  console.log('No profile found matching "Parth". Listing all profiles...')
  const { data: all } = await supabase.from('profiles').select('id, full_name, subscription_tier')
  console.table(all)
  process.exit(1)
}

console.log('Found profiles:', profiles)

for (const profile of profiles) {
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_tier: 'pro' })
    .eq('id', profile.id)

  if (error) {
    console.error(`Failed to upgrade ${profile.full_name}:`, error.message)
  } else {
    console.log(`✅ ${profile.full_name} upgraded to PRO! (id: ${profile.id})`)
  }
}
