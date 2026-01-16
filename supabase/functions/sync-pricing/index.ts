import "https://esm.sh/@anthropic-ai/sdk@0.39.0";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import FirecrawlApp from "https://esm.sh/@mendable/firecrawl-js@4.7.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey });

    const { cost_library_id, sync_all } = await req.json().catch(() => ({}));
    
    console.log(`[sync-pricing] Starting sync. cost_library_id: ${cost_library_id}, sync_all: ${sync_all}`);

    // Get products to sync
    let query = supabase.from('product_pricing').select('*').eq('is_active', true);
    
    if (cost_library_id && !sync_all) {
      query = query.eq('cost_library_id', cost_library_id);
    }

    const { data: products, error: fetchError } = await query;

    if (fetchError) {
      console.error('[sync-pricing] Error fetching products:', fetchError);
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    if (!products || products.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No products to sync',
        synced: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[sync-pricing] Found ${products.length} products to sync`);

    const results = [];
    const errors = [];

    for (const product of products) {
      try {
        console.log(`[sync-pricing] Scraping ${product.cost_library_id}: ${product.source_url}`);

        const scrapeResult = await firecrawl.scrapeUrl(product.source_url, {
          formats: ['markdown'],
          onlyMainContent: true,
        });

        if (!scrapeResult.success) {
          throw new Error('Scrape failed');
        }

        const markdown = scrapeResult.markdown || '';
        
        // Extract prices using regex - look for dollar amounts
        const pricePatterns = [
          /\$\s*([\d,]+(?:\.\d{2})?)/g,  // $1,234.56 or $1234
          /Price:\s*\$?([\d,]+(?:\.\d{2})?)/gi,  // Price: $1234
          /Starting at\s*\$?([\d,]+(?:\.\d{2})?)/gi,  // Starting at $1234
        ];

        const foundPrices: number[] = [];
        
        for (const pattern of pricePatterns) {
          let match;
          while ((match = pattern.exec(markdown)) !== null) {
            const price = parseFloat(match[1].replace(/,/g, ''));
            if (price > 0 && price < 100000) { // Reasonable price range
              foundPrices.push(price);
            }
          }
        }

        if (foundPrices.length === 0) {
          console.log(`[sync-pricing] No prices found for ${product.cost_library_id}`);
          
          await supabase.from('product_pricing').update({
            sync_status: 'no_price_found',
            sync_error: 'Could not extract price from page',
            last_synced_at: new Date().toISOString(),
          }).eq('id', product.id);

          errors.push({
            cost_library_id: product.cost_library_id,
            error: 'No prices found on page'
          });
          continue;
        }

        // Use the lowest reasonable price (often the base price)
        const extractedPrice = Math.min(...foundPrices);
        
        console.log(`[sync-pricing] Extracted price for ${product.cost_library_id}: $${extractedPrice}`);

        const { error: updateError } = await supabase.from('product_pricing').update({
          scraped_price: extractedPrice,
          sync_status: 'success',
          sync_error: null,
          last_synced_at: new Date().toISOString(),
        }).eq('id', product.id);

        if (updateError) {
          throw new Error(`Database update failed: ${updateError.message}`);
        }

        results.push({
          cost_library_id: product.cost_library_id,
          price: extractedPrice,
          status: 'success'
        });

      } catch (productError) {
        console.error(`[sync-pricing] Error syncing ${product.cost_library_id}:`, productError);
        
        await supabase.from('product_pricing').update({
          sync_status: 'error',
          sync_error: productError.message,
          last_synced_at: new Date().toISOString(),
        }).eq('id', product.id);

        errors.push({
          cost_library_id: product.cost_library_id,
          error: productError.message
        });
      }
    }

    console.log(`[sync-pricing] Completed. Success: ${results.length}, Errors: ${errors.length}`);

    return new Response(JSON.stringify({
      success: true,
      synced: results.length,
      errors: errors.length,
      results,
      errorDetails: errors,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[sync-pricing] Fatal error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'An error occurred during price sync' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
