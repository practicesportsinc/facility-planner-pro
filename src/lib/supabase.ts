import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface WizardSubmission {
  id?: string
  created_at?: string
  lead_name: string
  lead_email: string
  lead_business: string
  lead_phone: string
  wizard_responses: any
  recommendations: any
  financial_metrics: any
}

// Save wizard submission with lead data
export const saveWizardSubmission = async (data: Omit<WizardSubmission, 'id' | 'created_at'>) => {
  const { data: result, error } = await supabase
    .from('wizard_submissions')
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error('Error saving wizard submission:', error)
    throw error
  }

  return result
}

// Get all wizard submissions (for admin)
export const getWizardSubmissions = async () => {
  const { data, error } = await supabase
    .from('wizard_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching wizard submissions:', error)
    throw error
  }

  return data
}