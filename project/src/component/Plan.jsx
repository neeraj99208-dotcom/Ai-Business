
import React from 'react'

const Plan = () => {
  return (
    <div className="bg-[#050505] text-white min-h-screen px-4 sm:px-6 md:px-10 py-10">

      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
          Unlock Executive Precision
        </h1>

        <p className="mt-4 text-sm sm:text-base md:text-lg">
          Move beyond baseline monitoring.
          <br className="hidden sm:block" />
          Access the high-fidelity intelligence required for high-stakes
          <br className="hidden md:block" />
          validation and financial risk assessment.
        </p>
      </div>

      {/* Plans */}
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-8 max-w-5xl mx-auto">

        {/* BASELINE */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 border rounded-2xl">

          <h2 className="text-xl sm:text-2xl font-bold">
            BASELINE
          </h2>

          <h3 className="text-2xl sm:text-3xl font-bold mt-3">
            FREE
          </h3>

          <p className="mt-4">
            Essential monitoring for individual exploration
          </p>

          <div className="mt-6 space-y-3">
            <p>Standard data validation</p>
            <p>3 validation reports per month</p>
            <p>Community support access</p>
          </div>

          <button className="mt-8 w-full hover:scale-105 ndtransition-transform duration-300 py-3 rounded-2xl border">
            Current Plan
          </button>

        </div>

        {/* EXECUTIVE */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 border rounded-2xl transition-transform duration-500 hover:scale-105">

          <h2 className="text-xl sm:text-2xl font-bold">
            EXECUTIVE
          </h2>

          <h3 className="text-2xl sm:text-3xl font-bold mt-3">
            $12/mon
          </h3>

          <p className="mt-4">
            The gold standard for deep financial risk analysis
          </p>

          <div className="mt-6 space-y-3">
            <p>unlimited deep validation</p>
            <p>full financial history access</p>
            <p>real-time credit risk score</p>
            <p>enterprise api access</p>
            <p>24/7 priority concierge</p>
          </div>

          <button className="mt-8 w-full py-3 rounded-2xl bg-orange-500">
            Upgrade the process
          </button>

        </div>

      </div>

    </div>
  )
}

export default Plan