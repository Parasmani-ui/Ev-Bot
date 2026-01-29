
import React from 'react';

interface LandingPageProps {
  onTryNow: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onTryNow }) => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[700px] flex items-top px-8 lg:px-12 py-16 bg-gradient-to-br from-slate-50 to-emerald-50 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 skew-x-[-12deg] translate-x-20 z-0 hidden lg:block"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-top justify-between w-full max-w-7xl mx-auto gap-12">
          <div className="max-w-2xl text-center lg:text-left">
            <h1 className="text-7xl lg:text-5xl font-light text-slate-900 leading-[1.1] mb-6">
              Empowering Jharkhand through <br />
              <span className="font-bold text-emerald-800">e-Governance</span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-600 mb-10 font-medium max-w-lg mx-auto lg:mx-0">
              AI-Powered Assistant for Industrial Policies & Citizen Services.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={onTryNow}
                className="flex items-center gap-3 px-10 py-5 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900 transition-all transform hover:scale-105 shadow-xl shadow-emerald-900/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Launch Policy Bot
              </button>
              <button className="px-10 py-5 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">
                Learn More
              </button>
            </div>
          </div>

          <div className="relative flex-shrink-0 animate-in fade-in zoom-in duration-1000 w-64 h-64 lg:w-86 lg:h-86">
            <div className="absolute inset-0 bg-emerald-100 rounded-full blur-[100px] opacity-50"></div>
            <img 
              src="/Jharkhand_Rajakiya_Chihna.png" 
              alt="Government of Jharkhand Emblem" 
              className="relative z-10 w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900 text-white px-8" style={{backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url('/jh img.png')`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl lg:text-5xl font-bold text-emerald-400 mb-2">2022</div>
            <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold">EV Policy Launched</p>
          </div>
          <div>
            <div className="text-3xl lg:text-5xl font-bold text-emerald-400 mb-2">100%</div>
            <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold">Stamp Duty Waiver</p>
          </div>
          <div>
            <div className="text-3xl lg:text-5xl font-bold text-emerald-400 mb-2">25km</div>
            <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold">Charging Grid</p>
          </div>
          <div>
            <div className="text-3xl lg:text-5xl font-bold text-emerald-400 mb-2">24/7</div>
            <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold">AI Support</p>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 px-8 lg:px-20 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-800 mb-8">Committed to Transparency</h2>
          <div className="text-lg text-slate-600 leading-relaxed">
            The Government of Jharkhand is dedicated to digital transformation. This portal serves as a unified gateway for industrial information, providing instant access to policy details and investment incentives through our specialized AI interface.
          </div>
        </div>
      </section>

      <footer className="py-2 bg-slate-50 border-t border-slate-200 text-center">
        <img src="/Jharkhand_Rajakiya_Chihna.png" alt="Small Logo" className="w-10 h-10 mx-auto mb-4 opacity-50" />
        <p className="text-slate-500 text-sm">© 2026 Government of Jharkhand. Department of Industries.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
