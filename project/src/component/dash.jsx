
import React, { useState, useEffect } from 'react';

const Dash = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('User');

  useEffect(() => {
    const savedUser = localStorage.getItem('username');

    if (savedUser) {
      setUsername(savedUser);
    }
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();

    const businessIdea = topic.trim();

    if (!businessIdea || loading) return;

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch(
        'https://ai-business-nxy6.vercel.app/api/analyze',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            topic: businessIdea
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Business analysis failed.'
        );
      }

      if (
        !data.data ||
        !data.data.demand ||
        !data.data.scope ||
        !data.data.budget ||
        !data.data.competition
      ) {
        throw new Error(
          'The server returned an incomplete analysis.'
        );
      }

      // Preserve the existing analysis and support
      // metrics when returned by the backend.
      setResult(data.data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(
        err.message || 'Could not connect to the server.'
      );
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Market Demand',
      value: result?.demand
    },
    {
      title: 'Scope & Potential',
      value: result?.scope
    },
    {
      title: 'Market Budget',
      value: result?.budget
    },
    {
      title: 'Competition Analysis',
      value: result?.competition
    }
  ];

  // NEW: Read numerical metrics from the backend.
  const metrics = result?.metrics;

  const scoreCharts = metrics
    ? [
        {
          label: 'Market Demand',
          value: metrics.demandScore
        },
        {
          label: 'Growth Potential',
          value: metrics.scopeScore
        },
        {
          label: 'Competition Intensity',
          value: metrics.competitionScore
        },
        {
          label: 'Business Risk',
          value: metrics.riskScore
        }
      ]
    : [];

  const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);

  return (
    <div className="bg-black min-h-screen text-white px-6 pt-32 pb-20">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-purple-400 mb-3">
          Welcome, {username}
        </p>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Solution Dashboard
        </h1>

        <p className="text-gray-400 text-lg mt-4">
          Validate your business idea with AI-powered
          business analysis.
        </p>

        <form
          onSubmit={handleAnalyze}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <input
            type="text"
            placeholder="Enter a business idea..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="px-6 py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white w-full sm:w-[450px] focus:outline-none focus:border-purple-500"
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="px-8 py-4 bg-purple-600 font-semibold rounded-xl hover:bg-purple-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze Market'}
          </button>
        </form>

        {loading && (
          <p className="mt-6 text-purple-300">
            AI is analyzing your business idea. Please wait...
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-8 p-4 rounded-xl border border-red-500/40 bg-red-950/30 text-red-300"
          >
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="max-w-5xl mx-auto mt-16">
          <h2 className="text-2xl font-bold mb-6">
            Business Analysis Results
          </h2>

          <p className="text-gray-400 mb-6">
            Business idea: {topic.trim()}
          </p>

          {/* EXISTING: Original four analysis cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card) => (
              <div
                key={card.title}
                className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl"
              >
                <h3 className="text-purple-400 font-bold text-xl mb-3">
                  {card.title}
                </h3>

                <p className="text-gray-300 whitespace-pre-line leading-7">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* NEW: Charts and financial visualizations */}
          {metrics && (
            <div className="mt-10 space-y-6">
              <h2 className="text-2xl font-bold">
                Business Intelligence & Analytics
              </h2>

              {/* Business score charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scoreCharts.map((item) => (
                  <div
                    key={item.label}
                    className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl"
                  >
                    <div className="flex justify-between gap-4 mb-3">
                      <h3 className="text-gray-300 font-semibold">
                        {item.label}
                      </h3>

                      <span className="text-purple-400 font-bold">
                        {item.value}/100
                      </span>
                    </div>

                    <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-700"
                        style={{
                          width: `${item.value}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial overview */}
              <h2 className="text-2xl font-bold pt-4">
                Financial Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    label: 'Estimated Startup Budget',
                    value: metrics.startupBudget
                  },
                  {
                    label: 'Monthly Expenses',
                    value: metrics.monthlyExpenses
                  },
                  {
                    label: 'Expected Monthly Revenue',
                    value: metrics.expectedMonthlyRevenue
                  }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl"
                  >
                    <p className="text-gray-400 text-sm mb-3">
                      {item.label}
                    </p>

                    <p className="text-purple-400 text-2xl font-bold">
                      {formatINR(item.value)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Revenue vs expenses */}
              <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl">
                <h3 className="text-purple-400 text-xl font-bold mb-6">
                  Revenue vs Expenses
                </h3>

                {[
                  {
                    label: 'Expected Revenue',
                    value: metrics.expectedMonthlyRevenue
                  },
                  {
                    label: 'Estimated Expenses',
                    value: metrics.monthlyExpenses
                  }
                ].map((item) => {
                  const maximum = Math.max(
                    metrics.expectedMonthlyRevenue,
                    metrics.monthlyExpenses,
                    1
                  );

                  return (
                    <div key={item.label} className="mb-6">
                      <div className="flex justify-between gap-3 mb-2">
                        <span className="text-gray-300">
                          {item.label}
                        </span>

                        <span className="text-gray-300">
                          {formatINR(item.value)}
                        </span>
                      </div>

                      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all duration-700"
                          style={{
                            width: `${(item.value / maximum) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                <p className="text-gray-500 text-sm">
                  Estimated monthly difference:{' '}
                  {formatINR(
                    metrics.expectedMonthlyRevenue -
                    metrics.monthlyExpenses
                  )}
                </p>
              </div>

              <p className="text-gray-500 text-sm">
                Scores and financial figures are AI-generated
                estimates, not verified market data or guaranteed
                business outcomes.
              </p>
            </div>
          )}

          <p className="text-gray-500 text-sm mt-6">
            AI-generated estimates are for informational
            purposes and should be independently verified.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dash;
