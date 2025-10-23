import React, { useState, useMemo, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SpinnerIcon, DownloadIcon } from '../components/icons';

// --- TYPE DEFINITIONS ---
interface FeeStructure {
    referralFeePercent: number;
    fixedClosingFee: number;
    shippingFee: {
        local: number;
        zonal: number;
        national: number;
        weightSlab_g: number;
    };
    gstOnFeesPercent: number;
}
type Marketplace = 'Amazon.in' | 'Flipkart';
type Fulfillment = 'Self-Ship' | 'Marketplace-Fulfilled';
type ShippingZone = 'local' | 'zonal' | 'national';

const EcommerceProfitCalculator: React.FC = () => {
    // Inputs
    const [inputs, setInputs] = useState({
        sellingPrice: '1000', costPrice: '600',
        actualWeight: '0.8', length: '30', width: '20', height: '10',
        volumetricDivisor: '5000', packagingCost: '15', gstOnProduct: '18',
        marketplace: 'Amazon.in' as Marketplace, category: 'Electronics',
        fulfillment: 'Marketplace-Fulfilled' as Fulfillment, shippingZone: 'zonal' as ShippingZone,
    });
    // AI & Results State
    const [feeRules, setFeeRules] = useState<FeeStructure | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const fetchFeeRules = useCallback(async () => {
        if (!inputs.category) {
            setError('Please enter a product category to fetch fees.');
            return;
        }
        setIsLoading(true);
        setError('');
        setFeeRules(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `
                You are an e-commerce fee specialist. For ${inputs.marketplace} sellers in the '${inputs.category}' category, provide a realistic fee structure as a JSON object. Use typical values for India.
                The JSON must have these exact keys and number values:
                - "referralFeePercent"
                - "fixedClosingFee"
                - "shippingFee": an object with keys "local", "zonal", "national" (for shipping cost per slab) and "weightSlab_g" (weight slab in grams, e.g., 500)
                - "gstOnFeesPercent" (typically 18)
                Do not include any text before or after the JSON object. Example: {"referralFeePercent": 8, "fixedClosingFee": 20, "shippingFee": {"local": 40, "zonal": 55, "national": 70, "weightSlab_g": 500}, "gstOnFeesPercent": 18}
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            let jsonString = response.text.trim();
            if (jsonString.startsWith('```json')) {
                jsonString = jsonString.substring(7, jsonString.length - 3).trim();
            }
            const data = JSON.parse(jsonString);
            setFeeRules(data);
        } catch (e) {
            console.error(e);
            setError("Failed to fetch fee structure from AI. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [inputs.marketplace, inputs.category]);

    const calculations = useMemo(() => {
        const sp = parseFloat(inputs.sellingPrice) || 0;
        const cp = parseFloat(inputs.costPrice) || 0;
        const actual_kg = parseFloat(inputs.actualWeight) || 0;
        const l = parseFloat(inputs.length) || 0;
        const w = parseFloat(inputs.width) || 0;
        const h = parseFloat(inputs.height) || 0;
        const divisor = parseFloat(inputs.volumetricDivisor) || 5000;
        const packaging = parseFloat(inputs.packagingCost) || 0;
        const gst_product_rate = parseFloat(inputs.gstOnProduct) / 100 || 0;

        const volumetric_kg = (l * w * h) / divisor;
        const chargeable_kg = Math.max(actual_kg, volumetric_kg);

        if (!feeRules || sp <= 0) return { breakdown: [], summary: {} };

        const breakdown: { item: string, value: number, isNegative: boolean }[] = [];
        let netPayout = sp;

        breakdown.push({ item: 'Selling Price', value: sp, isNegative: false });

        const referralFee = sp * (feeRules.referralFeePercent / 100);
        breakdown.push({ item: `Referral Fee (${feeRules.referralFeePercent}%)`, value: referralFee, isNegative: true });

        breakdown.push({ item: 'Fixed Closing Fee', value: feeRules.fixedClosingFee, isNegative: true });
        
        const shippingSlabs = Math.ceil((chargeable_kg * 1000) / feeRules.shippingFee.weightSlab_g);
        const shippingFee = feeRules.shippingFee[inputs.shippingZone] * shippingSlabs;
        breakdown.push({ item: `Shipping Fee (${inputs.shippingZone}, ${chargeable_kg.toFixed(2)}kg)`, value: shippingFee, isNegative: true });
        
        const totalMarketplaceFees = referralFee + feeRules.fixedClosingFee + shippingFee;
        const gstOnFees = totalMarketplaceFees * (feeRules.gstOnFeesPercent / 100);
        breakdown.push({ item: `GST on Fees (${feeRules.gstOnFeesPercent}%)`, value: gstOnFees, isNegative: true });

        breakdown.push({ item: 'Packaging Cost', value: packaging, isNegative: true });

        const totalDeductionsBeforeGst = totalMarketplaceFees + gstOnFees + packaging;
        const taxableValue = sp / (1 + gst_product_rate);
        const gstOnSale = sp - taxableValue;
        
        netPayout = sp - totalDeductionsBeforeGst;
        
        const netProfit = netPayout - cp - gstOnSale; // Seller pays GST out of pocket from payout
        const margin = netPayout > 0 ? (netProfit / sp) * 100 : 0;
        
        return {
            breakdown,
            summary: {
                chargeableWeight: chargeable_kg,
                totalDeductions: totalDeductionsBeforeGst + gstOnSale,
                payout: netPayout - gstOnSale,
                netProfit,
                margin
            },
            taxInfo: {
                taxableValue,
                gstOnSale
            }
        };
    }, [inputs, feeRules]);

    const handleExportPdf = () => {
        if (!calculations.summary.netProfit) return;
        const doc = new jsPDF();
        doc.text(`Profitability Report for SKU`, 14, 15);
        autoTable(doc, {
            startY: 20,
            head: [['Metric', 'Value']],
            body: [
                ['Selling Price', `₹ ${inputs.sellingPrice}`],
                ['Cost Price', `₹ ${inputs.costPrice}`],
                ['Chargeable Weight', `${(calculations.summary.chargeableWeight || 0).toFixed(2)} kg`],
                ['---', '---'],
                ...calculations.breakdown.slice(1).map(item => [item.item, `- ₹ ${item.value.toFixed(2)}`]),
                ['---', '---'],
                ['Taxable Value', `₹ ${calculations.taxInfo?.taxableValue.toFixed(2)}`],
                ['GST on Sale (Payable)', `- ₹ ${calculations.taxInfo?.gstOnSale.toFixed(2)}`],
                ['---', '---'],
                ['Net Payout (Before CP)', `₹ ${calculations.summary.payout.toFixed(2)}`],
                ['Net Profit', `₹ ${calculations.summary.netProfit.toFixed(2)}`],
                ['Net Margin', `${calculations.summary.margin.toFixed(2)} %`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [13, 62, 128] }
        });
        doc.save('profitability-report.pdf');
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">E-commerce Profitability Calculator</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Simulate product profitability by fetching real-time fee structures with AI.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inputs Column */}
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border dark:bg-slate-800 dark:border-slate-700 space-y-3">
                        <h3 className="font-semibold">Marketplace & Fees</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <select name="marketplace" value={inputs.marketplace} onChange={handleInputChange} className="p-2 border rounded dark:bg-slate-700">
                                <option>Amazon.in</option>
                                <option>Flipkart</option>
                            </select>
                            <input name="category" value={inputs.category} onChange={handleInputChange} placeholder="Product Category" className="p-2 border rounded dark:bg-slate-700" />
                        </div>
                        <button onClick={fetchFeeRules} disabled={isLoading} className="w-full p-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-400">
                            {isLoading ? 'Fetching...' : 'Fetch Fee Structure with AI'}
                        </button>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>

                    <div className="bg-white p-4 rounded-lg border dark:bg-slate-800 dark:border-slate-700 space-y-3">
                        <h3 className="font-semibold">Product & Packaging</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <input name="sellingPrice" value={inputs.sellingPrice} onChange={handleInputChange} placeholder="Selling Price (₹)" type="number" className="p-2 border rounded dark:bg-slate-700" />
                            <input name="costPrice" value={inputs.costPrice} onChange={handleInputChange} placeholder="Cost Price (₹)" type="number" className="p-2 border rounded dark:bg-slate-700" />
                            <input name="actualWeight" value={inputs.actualWeight} onChange={handleInputChange} placeholder="Weight (kg)" type="number" step="0.1" className="p-2 border rounded dark:bg-slate-700" />
                             <input name="packagingCost" value={inputs.packagingCost} onChange={handleInputChange} placeholder="Packaging Cost (₹)" type="number" className="p-2 border rounded dark:bg-slate-700" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                             <input name="length" value={inputs.length} onChange={handleInputChange} placeholder="L (cm)" type="number" className="p-2 border rounded dark:bg-slate-700" />
                             <input name="width" value={inputs.width} onChange={handleInputChange} placeholder="W (cm)" type="number" className="p-2 border rounded dark:bg-slate-700" />
                             <input name="height" value={inputs.height} onChange={handleInputChange} placeholder="H (cm)" type="number" className="p-2 border rounded dark:bg-slate-700" />
                        </div>
                    </div>
                     <div className="bg-white p-4 rounded-lg border dark:bg-slate-800 dark:border-slate-700 space-y-3">
                         <h3 className="font-semibold">Shipping & Tax</h3>
                         <div className="grid grid-cols-2 gap-3">
                             <select name="shippingZone" value={inputs.shippingZone} onChange={handleInputChange} className="p-2 border rounded dark:bg-slate-700">
                                 <option value="local">Local</option>
                                 <option value="zonal">Zonal</option>
                                 <option value="national">National</option>
                             </select>
                             <input name="gstOnProduct" value={inputs.gstOnProduct} onChange={handleInputChange} placeholder="GST on Product (%)" type="number" className="p-2 border rounded dark:bg-slate-700" />
                         </div>
                    </div>
                </div>

                {/* Results Column */}
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border dark:bg-slate-800 dark:border-slate-700 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
                                <p className="text-sm">Net Profit</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">₹ {calculations.summary.netProfit?.toFixed(2) ?? '0.00'}</p>
                            </div>
                            <div className="p-3 bg-sky-50 dark:bg-sky-900/50 rounded-lg">
                                <p className="text-sm">Net Margin</p>
                                <p className="text-2xl font-bold text-sky-700 dark:text-sky-300">{calculations.summary.margin?.toFixed(2) ?? '0.00'} %</p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handleExportPdf} disabled={!calculations.summary.netProfit} className="flex items-center gap-2 text-sm font-semibold p-2 bg-slate-100 rounded-md hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600">
                                <DownloadIcon className="w-4 h-4" /> Export PDF
                            </button>
                        </div>
                        <div className="space-y-2 pt-2 border-t dark:border-slate-600">
                             <h4 className="font-semibold text-center">Profitability Breakdown</h4>
                             <div className="text-sm space-y-1 max-h-80 overflow-y-auto">
                                {calculations.breakdown?.map((item, i) => (
                                    <div key={i} className={`flex justify-between p-1 rounded ${item.isNegative ? '' : 'font-bold'}`}>
                                        <span>{item.item}</span>
                                        <span className={item.isNegative ? 'text-red-600' : 'text-green-600'}>
                                            {item.isNegative ? '-' : '+'} ₹ {item.value.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                                {calculations.taxInfo && (
                                    <>
                                        <div className="flex justify-between p-1 font-semibold border-t dark:border-slate-600">
                                             <span>GST on Sale (Payable by you)</span>
                                             <span className="text-red-600">- ₹ {calculations.taxInfo.gstOnSale.toFixed(2)}</span>
                                        </div>
                                         <div className="flex justify-between p-1 font-bold text-lg border-t-2 dark:border-slate-500">
                                             <span>Net Profit</span>
                                             <span>₹ {calculations.summary.netProfit?.toFixed(2) ?? '0.00'}</span>
                                        </div>
                                    </>
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EcommerceProfitCalculator;