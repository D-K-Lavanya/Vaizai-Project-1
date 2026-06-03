import { useState } from 'react';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import CandidatePortal from './components/CandidatePortal';
import ScreeningDashboard from './components/ScreeningDashboard';
import Login from './components/Login';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'recruiter' or 'candidate'
  const [activeScreenJob, setActiveScreenJob] = useState(null);

  const handleLogin = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setActiveScreenJob(null);
  };

  const handleScreenJob = (job) => {
    setActiveScreenJob(job);
  };

  const handleBackToJobs = () => {
    setActiveScreenJob(null);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 animate-in fade-in duration-700">
      {/* Header Section with Emerald Ambient Glow */}
      <header className="relative overflow-hidden border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-24 bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="w-full px-6 py-6 flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 text-xl">V</span>
              VaizAI <span className="text-emerald-400">Platform</span>
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">Recruitment Intelligence Engine</p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Session Info */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Session</span>
              <span className="text-sm font-black text-emerald-400 uppercase tracking-tighter">
                {userRole === 'recruiter' ? 'Recruiter Mode' : 'Candidate Mode'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-red-500/50 hover:text-red-400 text-slate-400 text-xs font-bold rounded-xl transition-all uppercase tracking-widest"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="w-full px-6 py-12">
        {userRole === 'recruiter' ? (
          activeScreenJob ? (
            <ScreeningDashboard 
              jobId={activeScreenJob._id} 
              onBack={handleBackToJobs} 
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Left Column: Job Form */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="sticky top-12">
                  <JobForm />
                </div>
              </div>

              {/* Right Column: Live Job Postings */}
              <div className="lg:col-span-7 xl:col-span-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-1">Active Opportunities</h2>
                  <p className="text-slate-500 text-sm font-medium">Real-time synchronization with the recruitment engine</p>
                </div>
                <JobList onScreen={handleScreenJob} />
              </div>
            </div>
          )
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CandidatePortal />
          </div>
        )}
      </main>
    </div>
  );
}
