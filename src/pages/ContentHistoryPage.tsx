import { useState } from 'react';
import { Search, Calendar, Filter, Sparkles, CheckCircle, Upload, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import { VideoModal } from '../components/VideoModal';

interface ContentDraft {
  id: string;
  user_id: string;
  created_at: string;
  campaign_name: string;
  campaign_id: string;
  idea: string;
  platform: string;
  format: string;
  asset_source: string | null;
  generated_text: string | null;
  generated_image_url: string | null;
  generated_video_url: string | null;
  user_uploaded_image_url: string | null;
  user_uploaded_video_url: string | null;
  status: string;
  is_media_ready: boolean | null;
}

function ContentHistoryPage() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);

  const [campaignName, setCampaignName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const applyFilters = async () => {
    if (!user?.id) {
      alert('Please sign in to view content history');
      return;
    }

    setIsLoading(true);
    try {
      let query = supabase
        .from('content_drafts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (campaignName.trim()) {
        query = query.ilike('campaign_name', `%${campaignName.trim()}%`);
      }

      if (startDate) {
        query = query.gte('created_at', new Date(startDate).toISOString());
      }

      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDateTime.toISOString());
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setDrafts(data || []);
      setSelectedDraftId(null);
    } catch (error: any) {
      console.error('Error fetching drafts:', error);
      alert('Error loading content drafts: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCampaignName('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
    setDrafts([]);
    setSelectedDraftId(null);
  };

  const handlePostContent = async () => {
    if (!selectedDraftId) return;

    const selectedDraft = drafts.find(d => d.id === selectedDraftId);
    if (!selectedDraft) return;

    setIsPosting(true);
    try {
      const webhookUrl = 'https://myaistaff.app.n8n.cloud/webhook-test/Approved';

      const payload = {
        draftId: selectedDraft.id,
        campaignId: selectedDraft.campaign_id,
        campaignName: selectedDraft.campaign_name,
        idea: selectedDraft.idea,
        platform: selectedDraft.platform,
        format: selectedDraft.format,
        assetSource: selectedDraft.asset_source,
        generatedText: selectedDraft.generated_text,
        generatedImageUrl: selectedDraft.generated_image_url,
        generatedVideoUrl: selectedDraft.generated_video_url,
        userUploadedImageUrl: selectedDraft.user_uploaded_image_url,
        userUploadedVideoUrl: selectedDraft.user_uploaded_video_url,
        status: selectedDraft.status,
        isMediaReady: selectedDraft.is_media_ready,
        userId: selectedDraft.user_id,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook call failed: ${response.statusText}`);
      }

      alert('Your selected content is successfully posted on your chosen platform');
    } catch (error: any) {
      console.error('Error posting content:', error);
      alert('Error posting content: ' + error.message);
    } finally {
      setIsPosting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMediaUrl = (draft: ContentDraft) => {
    if (draft.user_uploaded_image_url) return draft.user_uploaded_image_url;
    if (draft.user_uploaded_video_url) return draft.user_uploaded_video_url;
    if (draft.generated_image_url) return draft.generated_image_url;
    if (draft.generated_video_url) return draft.generated_video_url;
    return null;
  };

  const isVideo = (draft: ContentDraft) => {
    return !!(draft.user_uploaded_video_url || draft.generated_video_url);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'content_generated':
        return 'bg-gradient-to-r from-green-400 to-emerald-500';
      case 'draft_created':
        return 'bg-gradient-to-r from-blue-400 to-blue-500';
      case 'posted':
        return 'bg-gradient-to-r from-purple-400 to-purple-500';
      case 'failed':
        return 'bg-gradient-to-r from-red-400 to-red-500';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
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
              <Sparkles className="w-10 h-10 text-orange-500" />
              Content History
            </h1>
            <p className="text-gray-600 text-lg">Search, filter, and manage your content drafts</p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 border border-white/50 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  placeholder="Search by Campaign Name"
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-orange-500" />
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="draft_created">Draft Created</option>
                  <option value="content_generated">Content Generated</option>
                  <option value="posted">Posted</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={applyFilters}
                disabled={isLoading}
                className="flex-1 px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:cursor-not-allowed"
              >
                {isLoading ? 'Searching...' : 'Apply Filters'}
              </button>
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all transform hover:scale-105 hover:shadow-lg"
              >
                Reset
              </button>
              <button
                onClick={handlePostContent}
                disabled={!selectedDraftId || isPosting}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold rounded-xl transition-all transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Post Content
                  </>
                )}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-12 text-center border border-white/50">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
              <div className="text-xl text-gray-600">Loading content drafts...</div>
            </div>
          ) : drafts.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-12 text-center border border-white/50">
              <div className="text-xl text-gray-600">
                No content drafts found. Click "Apply Filters" to search or adjust your filters.
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/50">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white">
                    <tr>
                      <th className="px-6 py-4 text-center font-semibold">Select</th>
                      <th className="px-6 py-4 text-left font-semibold">Campaign Name</th>
                      <th className="px-6 py-4 text-left font-semibold">Generated Text</th>
                      <th className="px-6 py-4 text-center font-semibold">Media Preview</th>
                      <th className="px-6 py-4 text-center font-semibold">Platform</th>
                      <th className="px-6 py-4 text-center font-semibold">Status</th>
                      <th className="px-6 py-4 text-center font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {drafts.map((draft) => {
                      const mediaUrl = getMediaUrl(draft);
                      const isVideoContent = isVideo(draft);

                      return (
                        <tr
                          key={draft.id}
                          className={`hover:bg-orange-50/50 transition-colors ${
                            selectedDraftId === draft.id ? 'bg-orange-100/70' : ''
                          }`}
                        >
                          <td className="px-6 py-4 text-center">
                            <input
                              type="radio"
                              name="selectedDraft"
                              checked={selectedDraftId === draft.id}
                              onChange={() => setSelectedDraftId(draft.id)}
                              className="w-5 h-5 text-orange-500 cursor-pointer focus:ring-2 focus:ring-orange-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{draft.campaign_name}</div>
                            <div className="text-xs text-gray-500 mt-1">{draft.idea.substring(0, 60)}...</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-md">
                              {draft.generated_text ? (
                                <p className="text-gray-700 text-sm line-clamp-3">
                                  {draft.generated_text}
                                </p>
                              ) : (
                                <span className="text-gray-400 italic text-sm">No text generated</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {mediaUrl ? (
                              <div className="flex justify-center">
                                {isVideoContent ? (
                                  <button
                                    onClick={() => setVideoModalUrl(mediaUrl)}
                                    className="relative group"
                                  >
                                    <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg flex items-center justify-center border-2 border-orange-200 group-hover:border-orange-400 transition-all">
                                      <Upload className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="text-white text-xs font-semibold">Play</span>
                                    </div>
                                  </button>
                                ) : (
                                  <img
                                    src={mediaUrl}
                                    alt="Content preview"
                                    className="w-24 h-24 object-cover rounded-lg border-2 border-orange-200 shadow-sm"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-sm">No media</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-sm">
                              {draft.platform}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white shadow-sm ${getStatusBadgeClass(draft.status)}`}>
                              {draft.status.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600 text-sm">
                            {formatDate(draft.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-pink-50 px-6 py-4 border-t border-orange-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Total: <span className="font-semibold text-gray-900">{drafts.length}</span> draft{drafts.length !== 1 ? 's' : ''}
                  </span>
                  {selectedDraftId && (
                    <span className="text-orange-600 font-semibold">
                      1 draft selected - Click "Post Content" to publish
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {videoModalUrl && (
        <VideoModal
          videoUrl={videoModalUrl}
          onClose={() => setVideoModalUrl(null)}
        />
      )}
    </div>
  );
}

export default ContentHistoryPage;
