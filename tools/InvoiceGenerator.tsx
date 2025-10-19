import React, { useState, useMemo } from 'react';
import { TrashIcon } from '../components/icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Item {
  id: number;
  description: string;
  quantity: string;
  rate: string;
}

interface Address {
  name: string;
  address: string;
  city: string;
  country: string;
}

const InvoiceGenerator: React.FC = () => {
  const [currency, setCurrency] = useState('$');
  const [logo, setLogo] = useState<string | null>(null);
  const [from, setFrom] = useState<Address>({ name: 'Your Company', address: '123 Your Street', city: 'Your City, ST 12345', country: 'Your Country' });
  const [billTo, setBillTo] = useState<Address>({ name: 'Client Company', address: '456 Client Avenue', city: 'Client City, ST 67890', country: 'Client Country' });
  const [shipTo, setShipTo] = useState<Address>({ name: '', address: '', city: '', country: '' });
  const [useShipping, setUseShipping] = useState(false);
  
  const [invoiceNumber, setInvoiceNumber] = useState('INV-001');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState('Due on receipt');
  const [dueDate, setDueDate] = useState('');
  const [poNumber, setPoNumber] = useState('');

  const [items, setItems] = useState<Item[]>([
    { id: 1, description: 'Premium Website Design', quantity: '1', rate: '2500' },
    { id: 2, description: 'Custom Logo Design', quantity: '1', rate: '800' },
  ]);
  const [nextId, setNextId] = useState(3);

  const [notes, setNotes] = useState('Thank you for your business. We appreciate your prompt payment.');
  const [taxRate, setTaxRate] = useState('8');
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [discountValue, setDiscountValue] = useState('10');
  const [shipping, setShipping] = useState('50');

  const [loading, setLoading] = useState(false);

  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0), 0);
    
    let discountAmount = 0;
    const discount = parseFloat(discountValue) || 0;
    if (discountType === 'percent') {
        discountAmount = (subtotal * discount) / 100;
    } else {
        discountAmount = discount;
    }

    const shippingCost = parseFloat(shipping) || 0;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = (subtotalAfterDiscount * (parseFloat(taxRate) || 0)) / 100;
    const total = subtotalAfterDiscount + taxAmount + shippingCost;

    return { subtotal, discountAmount, shippingCost, taxAmount, total };
  }, [items, taxRate, discountType, discountValue, shipping]);
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setLogo(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddressChange = (setter: React.Dispatch<React.SetStateAction<Address>>, field: keyof Address, value: string) => {
    setter(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (id: number, field: keyof Omit<Item, 'id'>, value: string) => {
    setItems(items.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    setItems([...items, { id: nextId, description: '', quantity: '1', rate: '0' }]);
    setNextId(nextId + 1);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleDownloadPdf = async () => {
    const invoiceElement = document.getElementById('invoice-preview');
    if (!invoiceElement) return;

    setLoading(true);
    try {
        const canvas = await html2canvas(invoiceElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice-${invoiceNumber}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        setLoading(false);
    }
  };
  
  const addressInputs = (title: string, address: Address, setter: React.Dispatch<React.SetStateAction<Address>>) => (
    <div className="bg-white p-4 rounded-lg border space-y-2 dark:bg-slate-800 dark:border-slate-700">
      <h3 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      <input value={address.name} onChange={e => handleAddressChange(setter, 'name', e.target.value)} placeholder="Name / Company" className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" />
      <input value={address.address} onChange={e => handleAddressChange(setter, 'address', e.target.value)} placeholder="Address" className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" />
      <input value={address.city} onChange={e => handleAddressChange(setter, 'city', e.target.value)} placeholder="City, State, Zip" className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" />
      <input value={address.country} onChange={e => handleAddressChange(setter, 'country', e.target.value)} placeholder="Country" className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 flex justify-between items-start dark:border-slate-700">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Advanced Invoice Generator</h2>
          <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Create and download a professional, customized invoice.</p>
        </div>
        <button onClick={handleDownloadPdf} disabled={loading} className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400">
          {loading ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* Form Inputs */}
        <div className="lg:col-span-1 xl:col-span-1 space-y-4 h-full overflow-y-auto">
            {/* Logo & Currency */}
            <div className="bg-white p-4 rounded-lg border space-y-3 dark:bg-slate-800 dark:border-slate-700">
                 <h3 className="font-semibold text-slate-700 dark:text-slate-200">Settings</h3>
                 <div className="flex gap-2">
                    <label className="flex-1 dark:text-slate-300">Currency:
                        <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="$">USD ($)</option>
                            <option value="€">EUR (€)</option>
                            <option value="£">GBP (£)</option>
                            <option value="₹">INR (₹)</option>
                        </select>
                    </label>
                 </div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Company Logo:
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"/>
                 </label>
            </div>
            
            {addressInputs('From', from, setFrom)}
            {addressInputs('Bill To', billTo, setBillTo)}

            <div className="bg-white p-4 rounded-lg border space-y-2 dark:bg-slate-800 dark:border-slate-700">
                <label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                    <input type="checkbox" checked={useShipping} onChange={e => setUseShipping(e.target.checked)} className="h-4 w-4 rounded text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] dark:bg-slate-700 dark:border-slate-600"/> Ship To
                </label>
                {useShipping && (
                    <div className="space-y-2 pt-2">
                        <input value={shipTo.name} onChange={e => handleAddressChange(setShipTo, 'name', e.target.value)} placeholder="Name / Company" className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" />
                        <input value={shipTo.address} onChange={e => handleAddressChange(setShipTo, 'address', e.target.value)} placeholder="Address" className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" />
                        <input value={shipTo.city} onChange={e => handleAddressChange(setShipTo, 'city', e.target.value)} placeholder="City, State, Zip" className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" />
                        <input value={shipTo.country} onChange={e => handleAddressChange(setShipTo, 'country', e.target.value)} placeholder="Country" className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" />
                    </div>
                )}
            </div>

            <div className="bg-white p-4 rounded-lg border space-y-2 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">Invoice Details</h3>
                <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="Invoice #" className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" />
                <input value={poNumber} onChange={e => setPoNumber(e.target.value)} placeholder="PO Number" className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" />
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                <input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="Payment Terms" className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" />
            </div>

            <div className="bg-white p-4 rounded-lg border space-y-2 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">Items</h3>
                {items.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-1 items-center">
                        <input value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} placeholder="Description" className="col-span-5 p-1 border border-slate-300 rounded text-sm bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" />
                        <input value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} type="number" placeholder="Qty" className="col-span-2 p-1 border border-slate-300 rounded text-sm bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" />
                        <input value={item.rate} onChange={e => handleItemChange(item.id, 'rate', e.target.value)} type="number" placeholder="Rate" className="col-span-3 p-1 border border-slate-300 rounded text-sm bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" />
                        <button onClick={() => removeItem(item.id)} className="col-span-2 flex justify-center items-center h-8 bg-red-100 text-red-600 rounded hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900/80">
                           <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button onClick={addItem} className="w-full py-1 bg-slate-200 rounded hover:bg-slate-300 font-semibold text-sm dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">Add Item</button>
            </div>
            
            <div className="bg-white p-4 rounded-lg border space-y-3 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">Totals</h3>
                 <div className="flex gap-2">
                    <label className="flex-1 dark:text-slate-300">Discount:
                        <div className="flex">
                            <input value={discountValue} onChange={e => setDiscountValue(e.target.value)} type="number" className="w-full p-2 border border-slate-300 rounded-l bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                            <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="p-2 border-t border-b border-r border-slate-300 rounded-r bg-slate-50 text-slate-900 dark:bg-slate-600 dark:border-slate-600 dark:text-white">
                                <option value="percent">%</option>
                                <option value="amount">{currency}</option>
                            </select>
                        </div>
                    </label>
                    <label className="flex-1 dark:text-slate-300">Tax (%):<input value={taxRate} onChange={e => setTaxRate(e.target.value)} type="number" className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/></label>
                </div>
                <label className="dark:text-slate-300">Shipping:<input value={shipping} onChange={e => setShipping(e.target.value)} type="number" className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/></label>
            </div>

            <div className="bg-white p-4 rounded-lg border space-y-2 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">Notes</h3>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white" rows={4} />
            </div>
        </div>

        {/* Invoice Preview */}
        <div className="lg:col-span-2 xl:col-span-3">
          <div id="invoice-preview" className="bg-white p-12 shadow-lg min-h-[1123px] w-[794px]"> {/* A4 */}
            <header className="flex justify-between items-start pb-8">
              {logo ? <img src={logo} alt="Company Logo" className="max-h-24 max-w-xs"/> : <div className="w-24 h-24 bg-slate-200 rounded-lg"></div>}
              <div className="text-right">
                <h1 className="text-4xl font-bold text-[var(--theme-primary)]">INVOICE</h1>
                <p className="text-slate-500">#{invoiceNumber}</p>
              </div>
            </header>
            
            <section className="flex justify-between mt-8 pb-8 border-b-4 border-slate-200">
                <div className="text-left text-sm">
                    <p className="font-bold text-slate-600 mb-2">From:</p>
                    <p className="font-bold">{from.name}</p>
                    <p>{from.address}</p>
                    <p>{from.city}</p>
                    <p>{from.country}</p>
                </div>
                <div className="text-left text-sm">
                    <p className="font-bold text-slate-600 mb-2">Bill To:</p>
                    <p className="font-bold">{billTo.name}</p>
                    <p>{billTo.address}</p>
                    <p>{billTo.city}</p>
                    <p>{billTo.country}</p>
                </div>
                {useShipping && (
                <div className="text-left text-sm">
                    <p className="font-bold text-slate-600 mb-2">Ship To:</p>
                    <p className="font-bold">{shipTo.name || billTo.name}</p>
                    <p>{shipTo.address || billTo.address}</p>
                    <p>{shipTo.city || billTo.city}</p>
                    <p>{shipTo.country || billTo.country}</p>
                </div>
                )}
                 <div className="text-right text-sm">
                    <div className="grid grid-cols-2 gap-x-4">
                        <span className="font-bold text-slate-600">Date:</span><span>{new Date(date).toLocaleDateString()}</span>
                        <span className="font-bold text-slate-600">Due Date:</span><span>{dueDate ? new Date(dueDate).toLocaleDateString() : 'N/A'}</span>
                        <span className="font-bold text-slate-600">Payment Terms:</span><span>{paymentTerms}</span>
                        <span className="font-bold text-slate-600">PO Number:</span><span>{poNumber || 'N/A'}</span>
                    </div>
                </div>
            </section>

            <section className="mt-10">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--theme-primary-light)] text-[var(--theme-primary)]">
                  <tr>
                    <th className="p-3 font-bold rounded-l-lg">Item</th>
                    <th className="p-3 font-bold text-right">Qty</th>
                    <th className="p-3 font-bold text-right">Rate</th>
                    <th className="p-3 font-bold text-right rounded-r-lg">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-right">{(parseFloat(item.quantity) || 0).toFixed(2)}</td>
                      <td className="p-3 text-right">{currency}{(parseFloat(item.rate) || 0).toFixed(2)}</td>
                      <td className="p-3 text-right font-semibold">{currency}{((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="flex justify-end mt-8">
              <div className="w-full max-w-sm space-y-2 text-sm text-slate-700">
                <div className="flex justify-between"><span>Subtotal</span><span>{currency}{calculations.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Discount</span><span className="text-green-600">-{currency}{calculations.discountAmount.toFixed(2)}</span></div>
                 <div className="flex justify-between"><span>Shipping</span><span>{currency}{calculations.shippingCost.toFixed(2)}</span></div>
                <div className="flex justify-between border-b pb-2"><span>Tax ({taxRate}%)</span><span>{currency}{calculations.taxAmount.toFixed(2)}</span></div>
                <div className="flex justify-between text-2xl font-bold text-black bg-[var(--theme-primary-light)] p-3 rounded-lg"><span>Total</span><span>{currency}{calculations.total.toFixed(2)}</span></div>
              </div>
            </section>
            
            <footer className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="font-bold text-slate-600 text-sm">Notes</h3>
              <p className="text-slate-500 text-xs whitespace-pre-wrap">{notes}</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;