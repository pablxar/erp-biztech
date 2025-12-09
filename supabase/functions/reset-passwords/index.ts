import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const users = [
  { email: 'parancibiamoraga@gmail.com', password: 'pablobiztech' },
  { email: 'mnunezwilson@gmail.com', password: 'martobiztech' },
  { email: 'baltiavso05@gmail.com', password: 'baltibiztech' },
  { email: 'pepeadriasola@gmail.com', password: 'pepebiztech' },
  { email: 'benjaminvillalobosgo@gmail.com', password: 'billybiztech' },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const results = []

    // Get all users first
    const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers()
    
    for (const user of users) {
      const existingUser = allUsers?.users?.find(u => u.email === user.email)
      
      if (existingUser) {
        // Update password using admin API
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          { password: user.password }
        )
        
        results.push({
          email: user.email,
          status: error ? 'error' : 'password_updated',
          error: error?.message
        })
      } else {
        results.push({
          email: user.email,
          status: 'user_not_found'
        })
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
