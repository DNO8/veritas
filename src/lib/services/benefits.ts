import { supabaseServer } from '@/lib/supabase/server';
import { createIssuerAccount, getIssuerAccount } from './issuerAccounts';

export interface Benefit {
  id: string;
  project_id: string;
  title: string;
  description: string;
  benefit_type: 'physical_product' | 'digital_product' | 'service' | 'access' | 'experience' | 'recognition' | 'discount' | 'other';
  asset_code: string;
  total_supply: number;
  issued_supply: number;
  minimum_donation: number;
  donation_currency: string;
  redemption_type: 'date_range' | 'on_demand' | 'hybrid' | 'instant';
  valid_from?: string;
  valid_until?: string;
  timezone: string;
  max_per_backer: number;
  is_limited: boolean;
  is_active: boolean;
  image_url?: string;
  estimated_delivery?: string;
  shipping_required: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBenefitParams {
  project_id: string;
  title: string;
  description: string;
  benefit_type: Benefit['benefit_type'];
  asset_code: string;
  total_supply: number;
  minimum_donation: number;
  donation_currency?: string;
  redemption_type: Benefit['redemption_type'];
  valid_from?: string;
  valid_until?: string;
  timezone?: string;
  max_per_backer?: number;
  is_limited?: boolean;
  image_url?: string;
  estimated_delivery?: string;
  shipping_required?: boolean;
  display_order?: number;
}

export async function createBenefit(params: CreateBenefitParams): Promise<{
  benefit?: Benefit;
  error?: string;
}> {
  try {
    // Check if project has an issuer account, create if not
    
    const existingIssuer = await getIssuerAccount(params.project_id);
    
    if (!existingIssuer) {
      
      const issuerResult = await createIssuerAccount(params.project_id);
      
      if (issuerResult.error) {
        
        return { error: `Failed to create issuer account: ${issuerResult.error}` };
      }
      
      
    } else {
      
    }

    const { data, error } = await (supabaseServer
      .from('project_benefits') as any)
      .insert({
        ...params,
        issued_supply: 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      
      return { error: error.message };
    }

    return { benefit: data as Benefit };
  } catch (error) {
    
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getBenefitsByProject(projectId: string): Promise<{
  benefits?: Benefit[];
  error?: string;
}> {
  try {
    const { data, error } = await (supabaseServer
      .from('project_benefits') as any)
      .select('*')
      .eq('project_id', projectId)
      .order('display_order', { ascending: true });

    if (error) {
      
      return { error: error.message };
    }

    return { benefits: data as Benefit[] };
  } catch (error) {
    
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getAvailableBenefits(projectId: string): Promise<{
  benefits?: Benefit[];
  error?: string;
}> {
  try {
    const { data, error } = await (supabaseServer
      .from('project_benefits') as any)
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      
      return { error: error.message };
    }

    const availableBenefits = (data as Benefit[]).filter(benefit => {
      const hasSupply = benefit.total_supply > benefit.issued_supply;
      const isValid = !benefit.valid_until || new Date(benefit.valid_until) > new Date();
      return hasSupply && isValid;
    });

    return { benefits: availableBenefits };
  } catch (error) {
    
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getBenefitById(benefitId: string): Promise<{
  benefit?: Benefit;
  error?: string;
}> {
  try {
    const { data, error } = await (supabaseServer
      .from('project_benefits') as any)
      .select('*')
      .eq('id', benefitId)
      .single();

    if (error) {
      
      return { error: error.message };
    }

    return { benefit: data as Benefit };
  } catch (error) {
    
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function updateBenefit(
  benefitId: string,
  updates: Partial<CreateBenefitParams>
): Promise<{
  benefit?: Benefit;
  error?: string;
}> {
  try {
    const { data, error } = await (supabaseServer
      .from('project_benefits') as any)
      .update(updates)
      .eq('id', benefitId)
      .select()
      .single();

    if (error) {
      
      return { error: error.message };
    }

    return { benefit: data as Benefit };
  } catch (error) {
    
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function deleteBenefit(benefitId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await (supabaseServer
      .from('project_benefits') as any)
      .delete()
      .eq('id', benefitId);

    if (error) {
      
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function toggleBenefitStatus(benefitId: string): Promise<{
  benefit?: Benefit;
  error?: string;
}> {
  try {
    const { benefit, error: fetchError } = await getBenefitById(benefitId);
    
    if (fetchError || !benefit) {
      return { error: fetchError || 'Benefit not found' };
    }

    const { data, error } = await (supabaseServer
      .from('project_benefits') as any)
      .update({ is_active: !benefit.is_active })
      .eq('id', benefitId)
      .select()
      .single();

    if (error) {
      
      return { error: error.message };
    }

    return { benefit: data as Benefit };
  } catch (error) {
    
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getBenefitHolders(benefitId: string): Promise<{
  holders?: Array<{
    holder_wallet: string;
    holder_user_id?: string;
    quantity: number;
    created_at: string;
  }>;
  error?: string;
}> {
  try {
    const { data, error } = await (supabaseServer
      .from('benefit_holdings') as any)
      .select('holder_wallet, holder_user_id, quantity, created_at')
      .eq('benefit_id', benefitId)
      .eq('is_active', true);

    if (error) {
      
      return { error: error.message };
    }

    return { holders: data };
  } catch (error) {
    
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
