import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://utxzzaskbolyrosannyl.supabase.co'
const supabaseAnonKey = 'sb_publishable_6gpd2QnIG58EsGbYYj1tzg_TcoZ3uFQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
