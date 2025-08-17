// Use studentSupabase from central client
import { studentSupabase} from '@/lib/supabaseClient';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, User, Star, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/pages/hrmatching/components/ui/button';
import { Toaster } from '@/pages/hrmatching/components/ui/toaster';
import { useToast } from '@/pages/hrmatching/components/ui/use-toast';
import { supabase } from '@/pages/hrmatching/lib/customSupabaseClient';
import { getCurrentRecruiter, isRecruiterAuthenticated, signOutRecruiter } from '@/lib/recruiterAuth';


function App() {
  console.log('[helloR] App component mounted');
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);
  const [recruiterId, setRecruiterId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 20; // 20 x 500ms = 10s
    const delay = 500;

    async function checkAuthWithRetry() {
      console.log('[helloR] Starting recruiter auth check...');
      while (attempts < maxAttempts && isMounted) {
        const authed = await isRecruiterAuthenticated();
        console.log(`[helloR] Attempt ${attempts + 1}: isRecruiterAuthenticated =`, authed);
        if (authed) {
          // Get recruiter user and set recruiterId
          const user = await getCurrentRecruiter();
          console.log('[helloR] getCurrentRecruiter() user:', user);
          setRecruiterId(user.id);
          setAuthLoading(false);
          return;
        }
        attempts++;
        await new Promise(res => setTimeout(res, delay));
      }
      // If still not authed after retries, redirect
      if (isMounted) {
        console.log('[helloR] Recruiter not authenticated after retries. Redirecting to /recruiter');
        setAuthLoading(false);
        navigate('/recruiter', { replace: true });
      }
    }
    setAuthLoading(true);
    checkAuthWithRetry();
    return () => { isMounted = false; };
  }, [navigate]);

  // No need for separate redirect effect, handled in checkAuthWithRetry
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showNewSearch, setShowNewSearch] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockedCandidates, setUnlockedCandidates] = useState([]);
  const [isUnlockingCandidates, setIsUnlockingCandidates] = useState(false);
  const {
    toast
  } = useToast();

  // Logout handler
  const handleLogout = async () => {
    await signOutRecruiter();
    navigate("/recruiter", { state: { message: "You have been logged out." } });
  };

  // Static HR company ID for testing, as requested.
  const WEBHOOK_URL = "https://studentsinter.app.n8n.cloud/webhook-test/25196550-9ae8-440d-9f5c-a119f0bb2fda";
  const fetchHistory = useCallback(async () => {
    if (!recruiterId) return;
    const { data, error } = await supabase
      .from('hr_needs')
      .select('*')
      .eq('hr_company_id', recruiterId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching history:', error);
      toast({
        title: "Error",
        description: "Could not load search history.",
        variant: "destructive"
      });
    } else {
      setHistory(data);
    }
  }, [recruiterId, toast]);
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) {
      toast({
        title: "Please enter your requirements",
        description: "Tell us what kind of candidate you're looking for!",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    // Keep showNewSearch true during loading to show the enhanced loading state
    const requestData = {
      hr_company_id: recruiterId,
      requirements_text: currentMessage.trim()
    };
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      if (!response.ok) {
        // Try to get error message from body
        const errorBody = await response.text();
        console.error("Webhook response error:", errorBody);
        throw new Error(`Webhook failed with status: ${response.status}. ${errorBody}`);
      }
      const result = await response.json();

      // The webhook response is the full record, so we can use it directly.
      // Let's ensure it has the fields we expect before saving.

      setHistory(prev => [result, ...prev]);
      setShowNewSearch(false); // Only hide the search form when we have results
      setCurrentMessage('');
      toast({
        title: "Search completed!",
        description: `Found ${result.matching_results?.length || 0} matching candidates`
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      // Keep showNewSearch as true so user can retry
    } finally {
      setIsLoading(false);
    }
  };
  const handleNewSearch = () => {
    setSearchResult(null);
    setShowNewSearch(true);
    setCurrentMessage('');
  };
  const handleHistoryClick = historyItem => {
    setSearchResult({
      id: historyItem.id,
      hr_company_id: historyItem.hr_company_id,
      requirements_text: historyItem.requirements_text,
      created_at: historyItem.created_at,
      matching_results: historyItem.matching_results
    });
    setShowNewSearch(false);
  };
  const getScoreColor = score => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };
  const getScoreBg = score => {
    if (score >= 0.8) return 'bg-green-500/20 border-green-500/30';
    if (score >= 0.6) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };
  // Render spinner while checking recruiter auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-lg text-gray-700">Checking authentication...</div>
      </div>
    );
  }
  // improved unlockCandidateData
const unlockCandidateData = async (candidateId) => {
  try {
    // get most recent cv row (if any)
    const { data: cvRows, error: cvError } = await supabase
      .from('student_cvs')
      .select('file_path, uploaded_at')
      .eq('student_id', candidateId)
      .order('uploaded_at', { ascending: false })
      .limit(1);

    if (cvError) console.error('cv query error', cvError);

    let cvUrl = null;
    const file_path = cvRows && cvRows.length ? cvRows[0].file_path : null;

    if (file_path) {
      // normalize file path
      let normalized = file_path.replace(/^\/+/,'').replace(/^cv\//,'')
      const { data: urlData } = supabase.storage.from('cv').getPublicUrl(normalized);
      let publicUrl = urlData?.publicUrl ?? null;

      // optional: verify the url exists (HEAD)
      if (publicUrl) {
        try {
          const head = await fetch(publicUrl, { method: 'HEAD' });
          if (head.ok) cvUrl = publicUrl;
          else cvUrl = null;
        } catch (e) {
          // network error — be conservative and treat as missing
          cvUrl = null;
        }
      }
    }

    // get most recent phone row (if any)
    const { data: phoneRows, error: phoneError } = await supabase
      .from('student_summaries')
      .select('phone, last_updated')
      .eq('student_id', candidateId)
      .order('last_updated', { ascending: false })
      .limit(1);

    if (phoneError) console.error('phone query error', phoneError);
    const phone = phoneRows && phoneRows.length ? phoneRows[0].phone : null;

    return { cvUrl, phone };
  } catch (err) {
    console.error(`Error unlocking data for ${candidateId}`, err);
    return { cvUrl: null, phone: null };
  }
};

// improved handleUnlockTopCandidates (parallel + merge)
const handleUnlockTopCandidates = async () => {
  setIsUnlockingCandidates(true);
  try {
    if (!searchResult?.matching_results?.length) {
      toast({ title: "No Candidates Found", description: "Please perform a search first.", variant: "destructive" });
      return;
    }

    const topCandidates = searchResult.matching_results.slice(0, 3);

    // dedupe student_ids (just in case) and parallelize
    const unlockPromises = topCandidates.map(async (candidate) => {
      const { cvUrl, phone } = await unlockCandidateData(candidate.student_id);
      return { student_id: candidate.student_id, cvUrl, phone };
    });

    const unlocked = await Promise.all(unlockPromises);

    // Merge unlocked info back into matching_results so existing cards update inline
    setSearchResult(prev => {
      const merged = prev.matching_results.map(c => {
        const u = unlocked.find(x => x.student_id === c.student_id);
        return u ? { ...c, cvUrl: u.cvUrl, phone: u.phone } : c;
      });
      return { ...prev, matching_results: merged, unlockedData: unlocked };
    });

    setUnlockedCandidates(unlocked);

    toast({ title: "Top Candidates Unlocked!", description: "CVs and contact information for the top 3 candidates are now available.", variant: "success" });
  } catch (err) {
    console.error("Error unlocking top candidates:", err);
    toast({ title: "Unlock Failed", description: "An error occurred while unlocking candidates. Please try again.", variant: "destructive" });
  } finally {
    setIsUnlockingCandidates(false);
  }
};

  const UnlockedCandidates = ({ candidates }) => {
    const handleCopyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    };

    return (
      <div className="grid gap-6 mt-6">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xl font-semibold text-white">{candidate.name}</h4>
                <p className="text-sm text-gray-400">Rank #{candidate.rank}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-gray-300">CV</h5>
                {candidate.cvUrl ? (
                  <a
                    href={candidate.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Download CV
                  </a>
                ) : (
                  <p className="text-gray-400">CV not available</p>
                )}
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-300">Phone</h5>
                {candidate.phone ? (
                  <div className="flex items-center gap-2">
                    <p className="text-gray-300">{candidate.phone}</p>
                    <button
                      onClick={() => handleCopyToClipboard(candidate.phone)}
                      className="text-sm text-blue-400 hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-400">Phone not available</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return <>
      <Helmet>
        <title>HR Candidate Matcher - Find Perfect Candidates</title>
        <meta name="description" content="AI-powered candidate matching system for HR professionals. Find the best candidates for your job requirements." />
      </Helmet>

  <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex pt-16">
        {/* Sidebar - History */}
        <motion.div initial={{
        x: -300
      }} animate={{
        x: 0
      }} className="w-80 bg-black/20 backdrop-blur-sm border-r border-white/10 flex flex-col h-screen">
          <div className="flex items-center gap-3 mb-6 p-6 pb-0">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">My Search History</h2>
              <p className="text-sm text-gray-400">Previous profile searches</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-0">
            <div className="space-y-3">
            {history.length === 0 ? <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No searches yet</p>
                <p className="text-sm text-gray-500">Your search history will appear here</p>
              </div> : history.map((item, index) => <motion.div key={item.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }} onClick={() => handleHistoryClick(item)} className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 cursor-pointer transition-all duration-200 hover:scale-[1.02]">
                  <p className="text-white text-sm font-medium mb-2 line-clamp-2">
                    {item.requirements_text}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{item.matching_results?.length || 0} candidates</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>)}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <motion.div initial={{
          y: -50,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">HR profiles Matcher</h1>
                <p className="text-gray-300">Find the perfect profiles for your job requirements</p>
              </div>
              <div className="flex items-center gap-3">
                {!showNewSearch && (
                  <Button onClick={handleNewSearch} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Search className="w-4 h-4 mr-2" />
                    New Search
                  </Button>
                )}
                <Button onClick={handleLogout} variant="outline" className="border-white/20 text-black hover:bg-white/10">
                  Logout
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              {showNewSearch ? <motion.div key="search" initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -20
            }} className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <motion.div initial={{
                  scale: 0
                }} animate={{
                  scale: 1
                }} transition={{
                  delay: 0.2
                }} className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white mb-2">Find Your Perfect Candidate</h2>
                    <p className="text-gray-300 text-lg">Describe what you're looking for and let AI find the best matches</p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-white font-medium mb-3">Job Requirements</label>
                        <textarea value={currentMessage} onChange={e => setCurrentMessage(e.target.value)} placeholder="e.g., We are seeking a taxi driver for my company with 3+ years experience..." className="w-full h-32 bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" disabled={isLoading} />
                      </div>

                      <Button onClick={handleSendMessage} disabled={isLoading || !currentMessage.trim()} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12 text-lg font-medium">
                        {isLoading ? <div className="flex items-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Searching for candidates...
                          </div> : <>
                            <Send className="w-5 h-5 mr-2" />
                            Search Candidates
                          </>}
                      </Button>
                    </div>
                  </div>
                </motion.div> : isLoading ? (
                  // Enhanced Loading State
                  <motion.div 
                    key="loading" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    className="max-w-4xl mx-auto"
                  >
                    {/* Show the sent message */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl border border-green-500/20 p-6 mb-8"
                    >
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-3 h-3 bg-white rounded-full"
                          />
                        </div>
                        Request Sent Successfully
                      </h3>
                      <div className="bg-black/20 rounded-lg p-4 border-l-4 border-green-500">
                        <p className="text-gray-300 leading-relaxed">{currentMessage}</p>
                      </div>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-green-400 text-sm mt-3 flex items-center"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 bg-green-400 rounded-full mr-2"
                        />
                        Processing your request...
                      </motion.p>
                    </motion.div>

                    {/* Animated Loading Section */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center">
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 180, 360] 
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut" 
                        }}
                        className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 pulse-glow"
                      >
                        <Search className="w-10 h-10 text-white" />
                      </motion.div>

                      <motion.h2 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold text-white mb-4"
                      >
                        AI is Processing Your Request
                      </motion.h2>

                      {/* Animated dots */}
                      <motion.div 
                        className="flex justify-center space-x-2 mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {[0, 1, 2].map((index) => (
                          <motion.div
                            key={index}
                            className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                            animate={{
                              y: [0, -15, 0],
                              opacity: [0.4, 1, 0.4],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: index * 0.2,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </motion.div>

                      {/* Status messages with animation */}
                      <motion.div className="space-y-4 mb-6">
                        {[
                          { text: "Analyzing your job requirements...", icon: "🔍" },
                          { text: "Searching our candidate database...", icon: "🎯" },
                          { text: "Calculating compatibility scores...", icon: "⚡" },
                          { text: "Preparing your personalized results...", icon: "✨" }
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ 
                              opacity: [0, 1, 1, 0.6],
                              x: 0 
                            }}
                            transition={{
                              duration: 4,
                              delay: index * 1,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="text-gray-300 text-sm flex items-center justify-center"
                          >
                            <span className="text-lg mr-3">{item.icon}</span>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full mr-3"
                            />
                            {item.text}
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Enhanced Progress bar */}
                      <motion.div 
                        className="bg-black/20 rounded-full h-3 overflow-hidden shadow-inner"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 }}
                      >
                        <motion.div
                          className="h-full gradient-flow"
                          initial={{ width: "0%" }}
                          animate={{ width: ["0%", "70%", "100%"] }}
                          transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut",
                            times: [0, 0.7, 1]
                          }}
                        />
                      </motion.div>

                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="text-gray-400 text-sm mt-6 floating"
                      >
                        🤖 Our AI is carefully analyzing your request and finding the best candidates...
                      </motion.p>
                    </div>
                  </motion.div>
                ) : searchResult && <motion.div key="results" initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -20
            }} className="max-w-6xl mx-auto">
                  {/* Search Query Display */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Search Query</h3>
                    <p className="text-gray-300">{searchResult.requirements_text}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Searched on {new Date(searchResult.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Results */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-white">
                        Matching Candidates ({searchResult.matching_results?.length || 0})
                      </h3>
                    </div>

                    {searchResult.matching_results?.length === 0 ? <div className="text-center py-12">
                        <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-white mb-2">No candidates found</h4>
                        <p className="text-gray-400">Try adjusting your search criteria</p>
                      </div> : <div className="grid gap-6">
                        {searchResult.matching_results?.map((candidate, index) => <motion.div key={candidate.student_id || index} initial={{
                    opacity: 0,
                    y: 20
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} transition={{
                    delay: index * 0.1
                  }} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-xl font-semibold text-white">{candidate.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-gray-400">Rank #{candidate.rank}</span>
                                    {candidate.student_id && <span className="text-sm text-gray-400">• ID: {candidate.student_id}</span>}
                                  </div>
                                </div>
                              </div>
                              
                              <div className={`px-4 py-2 rounded-lg border ${getScoreBg(candidate.score)}`}>
                                <div className="flex items-center gap-2">
                                  <Star className={`w-4 h-4 ${getScoreColor(candidate.score)}`} />
                                  <span className={`font-bold ${getScoreColor(candidate.score)}`}>
                                    {(candidate.score * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-black/20 rounded-lg p-4">
                              <h5 className="text-sm font-medium text-gray-300 mb-2">Match Analysis</h5>
                              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                {candidate.explanation}
                              </p>
                            </div>
                          </motion.div>)}
                      </div>}
                  </div>
                </motion.div>}
            </AnimatePresence>
          </div>
        </div>

        {/* Add Unlock Button at the bottom of the page */}
        {searchResult && searchResult.matching_results?.length > 0 && (
          <div className="fixed bottom-0 left-0 w-full bg-black/20 backdrop-blur-sm border-t border-white/10 p-6">
            <Button
              onClick={handleUnlockTopCandidates}
              disabled={isUnlockingCandidates}
              className={`w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 h-12 text-lg font-medium ${isUnlockingCandidates ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUnlockingCandidates ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Unlocking Top Candidates...
                </div>
              ) : (
                <>Unlock CV & Contact Info for Top 3 Candidates</>
              )}
            </Button>
          </div>
        )}

        {searchResult && searchResult.unlockedData && (
          <UnlockedCandidates candidates={searchResult.unlockedData} />
        )}

        <Toaster />
      </div>
    </>;
}
export default App;