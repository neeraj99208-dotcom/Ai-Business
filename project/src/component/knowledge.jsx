import React from "react";
import { Link } from "react-router-dom";
import Revenue from "./revenueEg.png"
const Know=()=>{
    return(
        <div className="bg-black text-white min-h-screen">
            <div className="text-5xl pt-12 flex justify-center item-center text-purple-500 ">
                Start learning about Business term
            </div>
            <div className="flex justify-center pt-30 text-4xl">
                Scheme By Government
            </div>
            <div className="flex justify-center mt-20 gap-20">
                <Link to="https://www.standupmitra.in/" className="flex flex-wrap justify-center text-purple-500 pt-3 pb-2 h-[15vh] w-[25%] border border-white  rounded">
                    Stand up india
                    <span className="pl-4  text-zinc-300" >
                        Loans of ₹10 lakh to ₹1 crore for eligible SC/ST and new enterprises women
                    </span>
                </Link>
                <Link to="https://www.startupindia.gov.in/content/sih/en/startup-scheme.html" className="flex flex-wrap pb-2 text-purple-500 justify-center pt-3  h-[15vh] w-[25%] border border-white">
                    Startup India
                    <span className=" pl-6 pr-2  text-zinc-300">  
                        Support and funding opportunities. It was launch on 16 January 2016.
                    </span>
                </Link>
                <Link to="https://msme.maharashtra.gov.in/provider/state-government/?utm_source=chatgpt.com" className="flex flex-wrap pb-2  text-purple-500 justify-center pt-3 h-[15vh] w-[25%] border border-white">
                    Maharashtra DIC Loan Scheme
                    <span className="pl-8 text-zinc-300">
                        The Directorate of Industries lists a District Industries Centre (DIC)  
                    </span>
                </Link>
            </div>
            <div className="flex justify-center text-4xl mt-30">
               Some Business Topics
            </div>
            <div className=" pl-25 flex flex-wrap gap-25">
            <div className="border border-white rounded-2xl h-[56vh] w-90 mt-30 pr-4  justify-center">
                <span className="text-2xl pt-4 flex justify-center">
                    EBITDA
                </span>
                <span className="mt-5 flex flex-wrap pl-5 justify-center" >
                    EBITDA stands for Earnings Before Interest, Taxes, Depreciation, and Amortization.  
                    
                <span className="mt-2">
                    It measures a business's operating performance before these expenses.
                    It helps compare the operating performance of different businesses.
                </span>
                <span>
                    EBITDA does not show the actual net profit or cash flow of
                     a business because it excludes interest, taxes, depreciation, and amortization.
                </span>
                <span className="mt-2 flex flex-wrap">
                    Formula:
                <span>
                    EBITDA: EBIT + Depreciation + Amortization.
                </span> 
                <span className="pt-3">
                    Example:
                <span className="flex flex-wrap">
                    EBIT = ₹50,000, Depreciation = ₹5,000, Amortization = ₹2,000 → EBITDA = ₹57,000.
                </span> 
                </span>
                </span>                   
                </span>
            </div>
            <div className="border border-white rounded-2xl h-[56vh]  w-90 mt-30">
                <span className="text-2xl pt-4 flex justify-center">
                    Net Profit
                </span>
                <span className="mt-5 flex flex-wrap pl-5 justify-center">
                    Net Profit is the money a business has left after deducting all expenses from its total revenue.
                <span className="mt-2">
                    Expenses include operating costs, salaries, interest, taxes, depreciation, and other applicable costs.
                    It shows whether a business is making an overall profit or loss.
                    Expenses include operating costs, salaries, interest, taxes, depreciation, and other applicable costs.
                    It shows whether a business is making an overall profit or loss.
                </span>             
                <span className="mt-2 flex flex-wrap">
                    Formula:
                <span >
                    Net Profit = Total Revenue − Total Expenses.
                </span> 
                <span>
                     Example:
                </span>
                <span className="flex flex-wrap" >
                    Revenue = ₹1,00,000 and total expenses = ₹70,000 → Net Profit = ₹30,000.
                </span>
                </span>
                </span>
            </div>
            <div className="border border-white rounded-2xl h-[55vh] pr-4 w-90 mt-30">
                <span className="text-2xl pt-4 flex justify-center">
                    Gross-profit
                </span>
                <span className="mt-5 flex flex-wrap pl-5 justify-center">
                    Gross Profit is the money a business earns after deducting the direct cost of producing or purchasing the goods sold.
                <span className="mt-2">
                    It does not include other expenses like rent, salaries, marketing, interest, or taxes.
                    It shows how much profit a business makes from selling its products before other operating expenses.
                </span>
                <span className="mt-2 flex flex-wrap">
                    Formula:
                <span >
                    Gross Profit = Revenue − Cost of Goods Sold (COGS).
                </span> 
                <span>
                     Example:
                </span>
                <span className="flex flex-wrap" >
                    Revenue = ₹1,00,000 and COGS = ₹40,000 → Gross Profit = ₹60,000.
                </span>
                </span>
                </span>
                
            </div>
            <div className="border border-white rounded-2xl h-[55vh] pr-4 w-90 mt-30">
                <span className="text-2xl pt-4 flex justify-center">
                     OPEX
                </span>
                <span className="mt-5 flex flex-wrap pl-5 justify-center">
                    OPEX stands for Operating Expenses, which are the regular costs of running a business.
                <span className="mt-2">
                    These expenses include rent, employee salaries, electricity, marketing, and software subscriptions.
                    OPEX helps a business understand how much it spends on daily operations.
                </span>
                <span >
                    OPEX generally excludes direct production costs (COGS), interest, and income taxes.
                </span>
                <span className="mt-2 flex flex-wrap">
                    Formula:
                <span >
                    Total OPEX = Sum of all operating expenses.
                </span> 
                <span>
                     Example:
                </span>
                <span className="flex flex-wrap" >
                    Rent = ₹10,000, salaries = ₹20,000, and marketing = ₹5,000 → Total OPEX = ₹35,000.
                </span>
                </span>
                </span>
               
            </div>
            <div className="border border-white rounded-2xl h-[55vh] pr-4 w-90 mt-30">
                <span className="text-2xl pt-4 flex justify-center">
                     ROI
                </span>
                <span className="mt-5 flex flex-wrap pl-5 justify-center">
                    ROI stands for Return on Investment. It measures the profit or loss earned compared with the amount invested.
                <span className="mt-2">
                    It helps businesses evaluate whether an investment is financially worthwhile.
                    A higher positive ROI generally indicates a better return relative to the investment.
                </span>
                {/* <span >
                    ROI does not show how long it took to earn the return, so consider 
                    the investment period when comparing results.
                </span> */}
                <span className="mt-2 flex flex-wrap">
                    Formula:
                <span >
                    ROI = (Net Profit from Investment ÷ Investment Cost) × 100.
                </span> 
                <span className="pt-3">
                     Example:
                </span>
                <span className="flex flex-wrap" >
                    Investment = ₹10,000 and net profit = ₹2,000 → ROI = 20%.
                </span>
                </span>
                </span>
                
            </div>
            <div className="border border-white rounded-2xl h-[55vh] pr-4 w-90 mt-30">
                <span className="text-2xl pt-4 flex justify-center">
                     Cash Flow
                </span>
                <span className="mt-5 flex flex-wrap pl-5 justify-center">
                    Cash Flow refers to the movement of money into and out of a business during a specific period.
                <span className="mt-2">
                    Cash inflow includes sales revenue, loans received, and investments.
                    Cash outflow includes rent, salaries, inventory purchases, and other payments.
                </span>
                <span className="mt-2 flex flex-wrap">
                    Formula:
                <span >
                    Net Cash Flow = Total Cash Inflows − Total Cash Outflows.
                </span> 
                <span>
                     Example:
                </span>
                <span className="flex flex-wrap" >
                    Cash inflow = ₹80,000 and cash outflow = ₹50,000 → Net Cash Flow = ₹30,000.
                </span>
                </span>
                </span> 
            </div>
            </div>
            
            <div className="flex justify-center ">
                
                <img src={Revenue} alt="" className="h-[70vh] w-[70vw] mt-40 border border-white rounded"/>
            </div>
            <div className="mt-10 pb-5 flex justify-center">
                AI Business validator
            </div>
        </div>
    )
    
}
export default Know;