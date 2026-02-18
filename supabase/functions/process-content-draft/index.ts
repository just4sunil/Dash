import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WebhookPayload {
  draft_id: string;
  user_id: string;
  email: string;
  created_at: string;
  campaign_name: string;
  campaign_id: string;
  idea: string;
  platform: string;
  format: string;
  asset_source: string | null;
  asset_file_name: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: WebhookPayload = await req.json();

    console.log("Received webhook payload:", payload);

    const externalWebhookUrl = "https://myaistaff.app.n8n.cloud/webhook/PostBluePrint";

    console.log("Forwarding to external webhook:", externalWebhookUrl);

    const webhookResponse = await fetch(externalWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      throw new Error(`External webhook failed: ${webhookResponse.status}`);
    }

    const webhookData = await webhookResponse.json();
    console.log("External webhook response:", webhookData);

    let extractedText = null;
    let extractedImageUrl = null;
    let extractedVideoUrl = null;

    if (Array.isArray(webhookData) && webhookData.length > 0) {
      const responseData = webhookData[0];
      extractedText = responseData.generated_text || responseData.post_content || responseData.facebookOutput?.[0] || null;
      extractedImageUrl = responseData.generated_image_url || responseData.url?.[0] || null;
      extractedVideoUrl = responseData.generated_video_url || responseData.video_url || null;
    } else if (typeof webhookData === "object" && webhookData !== null) {
      extractedText = webhookData.generated_text || webhookData.post_content || webhookData.text || webhookData.facebookOutput?.[0] || null;
      extractedImageUrl = webhookData.generated_image_url || webhookData.url?.[0] || webhookData.image_url || null;
      extractedVideoUrl = webhookData.generated_video_url || webhookData.video_url || null;
    }

    const updateData: any = {
      status: "content_generated",
      generated_at: new Date().toISOString(),
    };

    if (extractedText) {
      updateData.generated_text = extractedText;
    }

    if (extractedImageUrl) {
      updateData.generated_image_url = extractedImageUrl;
      updateData.is_media_ready = true;
    }

    if (extractedVideoUrl) {
      updateData.generated_video_url = extractedVideoUrl;
      updateData.is_media_ready = true;
    }

    const { error: updateError } = await supabase
      .from("content_drafts")
      .update(updateData)
      .eq("id", payload.draft_id);

    if (updateError) {
      console.error("Failed to update content_drafts:", updateError);
      throw updateError;
    }

    console.log("Successfully updated content_drafts table");

    return new Response(
      JSON.stringify({
        success: true,
        draft_id: payload.draft_id,
        generated_text: extractedText,
        generated_image_url: extractedImageUrl,
        generated_video_url: extractedVideoUrl,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error processing content draft:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
