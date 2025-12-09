import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://esm.sh/@anthropic-ai/sdk@0.6.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TeamMember {
  email: string
  password: string
  full_name: string
  role: 'admin' | 'member'
}

const teamMembers: TeamMember[] = [
  { email: 'parancibiamoraga@gmail.com', password: 'pablobiztech', full_name: 'Pablo Arancibia', role: 'admin' },
  { email: 'mnunezwilson@gmail.com', password: 'martobiztech', full_name: 'Martín Núñez', role: 'member' },
  { email: 'baltiavso05@gmail.com', password: 'baltibiztech', full_name: 'Baltazar Avsolomovich', role: 'member' },
  { email: 'pepeadriasola@gmail.com', password: 'pepebiztech', full_name: 'José Pedro Adriasola', role: 'member' },
  { email: 'benjaminvillalobosgo@gmail.com', password: 'billybiztech', full_name: 'Benjamín Villalobos', role: 'member' },
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

    for (const member of teamMembers) {
      // Create user with admin API
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: member.email,
        password: member.password,
        email_confirm: true,
        user_metadata: {
          full_name: member.full_name
        }
      })

      if (userError) {
        // User might already exist, try to get them
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === member.email)
        
        if (existingUser) {
          // Add role if user exists
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .upsert({ user_id: existingUser.id, role: member.role }, { onConflict: 'user_id' })
          
          results.push({ 
            email: member.email, 
            status: 'exists', 
            role_added: !roleError,
            error: roleError?.message 
          })
        } else {
          results.push({ email: member.email, status: 'error', error: userError.message })
        }
        continue
      }

      // Add role for new user
      if (userData.user) {
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: userData.user.id, role: member.role })
        
        results.push({ 
          email: member.email, 
          status: 'created', 
          role_added: !roleError,
          error: roleError?.message 
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
