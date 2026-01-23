
import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      {/* Full Width Hero Image */}
      <div className="relative w-full h-80 lg:h-96 mx-4 -mt-8 lg:ml-0 lg:mr-20 lg:-mt-12 overflow-hidden">
        <img 
          src="/jh img.png" 
          alt="Jharkhand Cultural Heritage" 
          className="w-full h-full object-cover drop-shadow-lg"
        />
      </div>

      {/* Content Section */}
      <div className="p-8 lg:p-20 max-w-5xl mx-auto w-full">
      <h1 className="text-4xl lg:text-5xl font-light text-slate-900 mb-10 leading-tight">
        Welcome to the <br />
        <span className="font-bold">Department of Industries, Government of Jharkhand</span>
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-black pl-4">Mission</h2>
          <p className="text-slate-600 leading-relaxed text-lg">
            To create a conducive environment for industrial growth, promote sustainable investment, and generate employment opportunities in the state of Jharkhand.
          </p>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-black pl-4">Core Strategy</h2>
          <ul className="list-disc list-inside text-slate-600 space-y-3 text-lg">
            <li>Infrastructure Development</li>
            <li>Single Window Clearance System</li>
            <li>Investment Promotion</li>
            <li>Policy Facilitation</li>
          </ul>
        </div>
      </div>

      <div className="mt-20 p-10 bg-black text-white rounded-2xl">
        <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
        <p className="text-xl font-light opacity-90 leading-relaxed">
          "Establishing Jharkhand as an industrial hub of India by leveraging its vast mineral resources and creating a futuristic ecosystem for manufacturing and technology."
        </p>
      </div>

      <div className="mt-20">
        <h2 className="text-3xl font-light mb-10 text-center">Industrial Hubs in Jharkhand</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['Ranchi', 'Jamshedpur', 'Bokaro', 'Dhanbad'].map((city) => (
            <div key={city} className="p-8 bg-white border border-slate-100 rounded-xl shadow-sm text-center">
              <div className="text-4xl mb-4">🏭</div>
              <h4 className="font-bold text-slate-800">{city}</h4>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default HomePage;
