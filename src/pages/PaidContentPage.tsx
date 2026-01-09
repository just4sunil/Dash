import { useState } from 'react';
import { Sparkles, Save, Wand2, Copy, RefreshCw, DollarSign, Target, Users, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';

interface GeneratedContent {
  ad_copy: string[];
  headlines: string[];
  cta_texts: string[];
  image_prompts: string[];
  video_hooks: string[];
}

function PaidContentPage() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [campaignName, setCampaignName] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('Brand Awareness');
  const [targetPlatform, setTargetPlatform] = useState('Meta');

  const [audienceType, setAudienceType] = useState('Cold');
  const [audienceCharacteristics, setAudienceCharacteristics] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('');

  const [budgetType, setBudgetType] = useState('Daily');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [optimizationPreference, setOptimizationPreference] = useState('Conversions');

  const [contentIdea, setContentIdea] = useState('');
  const [brandTone, setBrandTone] = useState('Professional');
  const [ctaObjective, setCtaObjective] = useState('Learn More');
  const [visualStyle, setVisualStyle] = useState('Product-focused');

  const [generateAdCopy, setGenerateAdCopy] = useState(true);
  const [generateHeadlines, setGenerateHeadlines] = useState(true);
  const [generateCtaText, setGenerateCtaText] = useState(true);
  const [generateImagePrompt, setGenerateImagePrompt] = useState(true);
  const [generateVideoHooks, setGenerateVideoHooks] = useState(true);
  const [numberOfVariations, setNumberOfVariations] = useState(3);

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    ad_copy: [],
    headlines: [],
    cta_texts: [],
    image_prompts: [],
    video_hooks: [],
  });

  const handleGenerate = async () => {
    if (!user?.id) {
      alert('Please sign in to generate paid content');
      return;
    }

    if (!campaignName.trim() || !contentIdea.trim()) {
      alert('Please fill in Campaign Name and Content Idea');
      return;
    }

    setIsGenerating(true);
    setSuccessMessage(null);

    try {
      const mockGenerated: GeneratedContent = {
        ad_copy: generateAdCopy
          ? Array.from({ length: numberOfVariations }, (_, i) =>
              `${contentIdea} - Transform your business with our innovative solution. Perfect for ${audienceType.toLowerCase()} audiences looking to achieve ${primaryGoal.toLowerCase()}. ${brandTone} tone with compelling results. Variation ${i + 1}.`
            )
          : [],
        headlines: generateHeadlines
          ? Array.from({ length: numberOfVariations }, (_, i) =>
              `${primaryGoal}: ${contentIdea.split(' ').slice(0, 5).join(' ')} ${i > 0 ? `(${i + 1})` : ''}`
            )
          : [],
        cta_texts: generateCtaText
          ? Array.from({ length: numberOfVariations }, (_, i) =>
              i === 0 ? ctaObjective : `${ctaObjective} Today`
            )
          : [],
        image_prompts: generateImagePrompt
          ? Array.from({ length: numberOfVariations }, (_, i) =>
              `${visualStyle} visual: ${contentIdea}. ${brandTone} aesthetic, optimized for ${targetPlatform} advertising. High-quality, attention-grabbing imagery. Version ${i + 1}.`
            )
          : [],
        video_hooks: generateVideoHooks
          ? Array.from({ length: numberOfVariations }, (_, i) =>
              `Hook ${i + 1}: Start with a bold statement about ${primaryGoal.toLowerCase()}. ${contentIdea}. End with clear CTA: ${ctaObjective}. Duration: 15-30 seconds.`
            )
          : [],
      };

      const { data, error } = await supabase
        .from('paid_content')
        .insert({
          user_id: user.id,
          campaign_name: campaignName,
          primary_goal: primaryGoal,
          target_platform: targetPlatform,
          audience_type: audienceType,
          audience_characteristics: audienceCharacteristics || null,
          age_range: ageRange || null,
          gender: gender || null,
          location: location || null,
          language: language || null,
          budget_type: budgetType,
          budget_amount: budgetAmount ? parseFloat(budgetAmount) : null,
          start_date: startDate || null,
          end_date: endDate || null,
          optimization_preference: optimizationPreference,
          content_idea: contentIdea,
          brand_tone: brandTone,
          cta_objective: ctaObjective,
          visual_style: visualStyle,
          generate_ad_copy: generateAdCopy,
          generate_headlines: generateHeadlines,
          generate_cta_text: generateCtaText,
          generate_image_prompt: generateImagePrompt,
          generate_video_hooks: generateVideoHooks,
          number_of_variations: numberOfVariations,
          generated_ad_copy: mockGenerated.ad_copy,
          generated_headlines: mockGenerated.headlines,
          generated_cta_texts: mockGenerated.cta_texts,
          generated_image_prompts: mockGenerated.image_prompts,
          generated_video_hooks: mockGenerated.video_hooks,
          generation_status: 'completed',
        })
        .select()
        .single();

      if (error) throw error;

      setGeneratedContent(mockGenerated);
      setShowResults(true);
      setSuccessMessage('Paid content generated successfully!');
    } catch (error: any) {
      console.error('Error generating paid content:', error);
      alert('Error generating paid content: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user?.id) {
      alert('Please sign in to save draft');
      return;
    }

    if (!campaignName.trim() || !contentIdea.trim()) {
      alert('Please fill in Campaign Name and Content Idea');
      return;
    }

    setIsSaving(true);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from('paid_content')
        .insert({
          user_id: user.id,
          campaign_name: campaignName,
          primary_goal: primaryGoal,
          target_platform: targetPlatform,
          audience_type: audienceType,
          audience_characteristics: audienceCharacteristics || null,
          age_range: ageRange || null,
          gender: gender || null,
          location: location || null,
          language: language || null,
          budget_type: budgetType,
          budget_amount: budgetAmount ? parseFloat(budgetAmount) : null,
          start_date: startDate || null,
          end_date: endDate || null,
          optimization_preference: optimizationPreference,
          content_idea: contentIdea,
          brand_tone: brandTone,
          cta_objective: ctaObjective,
          visual_style: visualStyle,
          generate_ad_copy: generateAdCopy,
          generate_headlines: generateHeadlines,
          generate_cta_text: generateCtaText,
          generate_image_prompt: generateImagePrompt,
          generate_video_hooks: generateVideoHooks,
          number_of_variations: numberOfVariations,
          generation_status: 'draft',
        });

      if (error) throw error;

      setSuccessMessage('Draft saved successfully!');
    } catch (error: any) {
      console.error('Error saving draft:', error);
      alert('Error saving draft: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMessage('Copied to clipboard!');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-pink-50/30">
      <Sidebar />

      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto p-8">
          <div className="flex justify-end mb-6">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:text-orange-700 transition-colors group"
            >
              <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold">DashAI</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-3 flex items-center gap-3">
              <DollarSign className="w-10 h-10 text-orange-500" />
              Paid Content Generator
            </h1>
            <p className="text-gray-600 text-lg">Create ad-ready content for paid social and display campaigns</p>
          </div>

          {successMessage && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
              <Sparkles className="w-6 h-6 text-green-600 flex-shrink-0" />
              <p className="text-green-800 font-semibold">{successMessage}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-orange-500" />
                Campaign & Objective
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g., Spring Product Launch"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Goal
                  </label>
                  <select
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
                  >
                    <option value="Brand Awareness">Brand Awareness</option>
                    <option value="Traffic">Traffic</option>
                    <option value="Leads">Leads</option>
                    <option value="Sales">Sales</option>
                    <option value="App Installs">App Installs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Platform
                  </label>
                  <select
                    value={targetPlatform}
                    onChange={(e) => setTargetPlatform(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
                  >
                    <option value="Meta">Meta</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Google/YouTube">Google/YouTube</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="X">X</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-orange-500" />
                Audience Definition
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Audience Type
                  </label>
                  <select
                    value={audienceType}
                    onChange={(e) => setAudienceType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
                  >
                    <option value="Cold">Cold</option>
                    <option value="Warm">Warm</option>
                    <option value="Retargeting">Retargeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age Range
                  </label>
                  <input
                    type="text"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    placeholder="e.g., 25-45"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Audience Characteristics
                </label>
                <textarea
                  value={audienceCharacteristics}
                  onChange={(e) => setAudienceCharacteristics(e.target.value)}
                  placeholder="Describe interests, pain points, desires..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
                  <input
                    type="text"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    placeholder="e.g., All, Male, Female"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., United States"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Language
                  </label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="e.g., English"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-orange-500" />
                Budget & Duration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Budget Type
                  </label>
                  <select
                    value={budgetType}
                    onChange={(e) => setBudgetType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Lifetime">Lifetime</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Budget Amount
                  </label>
                  <input
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="e.g., 1000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Optimization
                  </label>
                  <select
                    value={optimizationPreference}
                    onChange={(e) => setOptimizationPreference(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
                  >
                    <option value="Conversions">Conversions</option>
                    <option value="Reach">Reach</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Lowest Cost">Lowest Cost</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-orange-500" />
                Creative Direction
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content Idea *
                </label>
                <textarea
                  value={contentIdea}
                  onChange={(e) => setContentIdea(e.target.value)}
                  placeholder="Describe your ad concept, key message, and unique selling points..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Brand Tone
                  </label>
                  <select
                    value={brandTone}
                    onChange={(e) => setBrandTone(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Bold">Bold</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Playful">Playful</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CTA Objective
                  </label>
                  <select
                    value={ctaObjective}
                    onChange={(e) => setCtaObjective(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
                  >
                    <option value="Learn More">Learn More</option>
                    <option value="Buy Now">Buy Now</option>
                    <option value="Sign Up">Sign Up</option>
                    <option value="Download">Download</option>
                    <option value="Contact Us">Contact Us</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Visual Style Preference
                </label>
                <select
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
                >
                  <option value="Product-focused">Product-focused</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="UGC">UGC (User Generated Content)</option>
                  <option value="Minimal">Minimal</option>
                  <option value="Bold">Bold</option>
                </select>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                Output Preferences
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateAdCopy}
                    onChange={(e) => setGenerateAdCopy(e.target.checked)}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  />
                  <span className="text-gray-700 font-semibold">Ad Copy</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateHeadlines}
                    onChange={(e) => setGenerateHeadlines(e.target.checked)}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  />
                  <span className="text-gray-700 font-semibold">Headlines</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateCtaText}
                    onChange={(e) => setGenerateCtaText(e.target.checked)}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  />
                  <span className="text-gray-700 font-semibold">CTA Text</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateImagePrompt}
                    onChange={(e) => setGenerateImagePrompt(e.target.checked)}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  />
                  <span className="text-gray-700 font-semibold">Image Prompt</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateVideoHooks}
                    onChange={(e) => setGenerateVideoHooks(e.target.checked)}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  />
                  <span className="text-gray-700 font-semibold">Video Hook Ideas</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Variations
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={numberOfVariations}
                  onChange={(e) => setNumberOfVariations(parseInt(e.target.value) || 3)}
                  className="w-full md:w-48 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Wand2 className="w-6 h-6" />
                {isGenerating ? 'Generating...' : 'Generate Paid Content'}
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-8 py-4 bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-6 h-6" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
            </div>

            {showResults && (
              <div className="space-y-6 mt-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                    Generated Content
                  </h2>
                  <p className="text-gray-600">Review, edit, and copy your generated ad content</p>
                </div>

                {generatedContent.ad_copy.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Ad Copy Variations</h3>
                    <div className="space-y-4">
                      {generatedContent.ad_copy.map((copy, index) => (
                        <div key={index} className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 border-2 border-orange-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold text-orange-600">Variation {index + 1}</span>
                            <button
                              onClick={() => copyToClipboard(copy)}
                              className="text-orange-500 hover:text-orange-600 transition-colors"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="text-gray-800">{copy}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generatedContent.headlines.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Headline Variations</h3>
                    <div className="space-y-4">
                      {generatedContent.headlines.map((headline, index) => (
                        <div key={index} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-bold text-gray-800">{headline}</h4>
                            <button
                              onClick={() => copyToClipboard(headline)}
                              className="text-blue-500 hover:text-blue-600 transition-colors"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generatedContent.cta_texts.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">CTA Suggestions</h3>
                    <div className="flex flex-wrap gap-3">
                      {generatedContent.cta_texts.map((cta, index) => (
                        <button
                          key={index}
                          onClick={() => copyToClipboard(cta)}
                          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
                        >
                          {cta}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {generatedContent.image_prompts.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Image Generation Prompts</h3>
                    <div className="space-y-4">
                      {generatedContent.image_prompts.map((prompt, index) => (
                        <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold text-green-600">Prompt {index + 1}</span>
                            <button
                              onClick={() => copyToClipboard(prompt)}
                              className="text-green-500 hover:text-green-600 transition-colors"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="text-gray-800 italic">{prompt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generatedContent.video_hooks.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/50">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Video Hook Ideas</h3>
                    <div className="space-y-4">
                      {generatedContent.video_hooks.map((hook, index) => (
                        <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold text-yellow-600">Hook {index + 1}</span>
                            <button
                              onClick={() => copyToClipboard(hook)}
                              className="text-yellow-600 hover:text-yellow-700 transition-colors"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="text-gray-800">{hook}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PaidContentPage;
