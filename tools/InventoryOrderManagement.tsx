import React, { useState, useEffect, useMemo } from 'react';
import { TrashIcon, SpinnerIcon } from '../components/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

declare global {
    interface Window {
        XLSX: any;
    }
}


// --- DATA INTERFACES ---
interface Product {
  id: string; // SKU
  name: string;
  quantity: number;
  price: number;
}

interface OrderItem {
  productId: string; // SKU
  productName: string;
  quantity: number;
  price: number; // Price at time of order
}

type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Canceled';

interface Order {
  id: string; // Order ID
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  date: string;
}

// --- MAIN COMPONENT ---
const InventoryOrderManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Load data from localStorage on initial render
    useEffect(() => {
        try {
            const savedProducts = localStorage.getItem('ecom_products');
            const savedOrders = localStorage.getItem('ecom_orders');
            if (savedProducts) setProducts(JSON.parse(savedProducts));
            if (savedOrders) setOrders(JSON.parse(savedOrders));
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('ecom_products', JSON.stringify(products));
        } catch (error) {
            console.error("Failed to save products to localStorage", error);
        }
    }, [products]);

    useEffect(() => {
        try {
            localStorage.setItem('ecom_orders', JSON.stringify(orders));
        } catch (error) {
            console.error("Failed to save orders to localStorage", error);
        }
    }, [orders]);
    
    // --- CRUD and State Logic ---

    // Product handlers
    const handleProductSave = (product: Product) => {
        setProducts(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                return prev.map(p => p.id === product.id ? product : p);
            }
            return [...prev, product];
        });
    };
    const handleProductDelete = (productId: string) => {
        if (window.confirm("Are you sure you want to delete this product? This cannot be undone.")) {
            setProducts(prev => prev.filter(p => p.id !== productId));
        }
    };

    // Order handlers
    const handleOrderSave = (order: Order) => {
        setOrders(prev => {
            const existing = prev.find(o => o.id === order.id);
            if (existing) {
                return prev.map(o => o.id === order.id ? order : o);
            }
            return [...prev, order];
        });
    };
    const handleOrderDelete = (orderId: string) => {
        if (window.confirm("Are you sure you want to delete this order? This cannot be undone.")) {
             // Before deleting, check if stock needs to be returned
            const order = orders.find(o => o.id === orderId);
            if (order && (order.status === 'Shipped' || order.status === 'Delivered')) {
                // Return stock to inventory
                setProducts(prevProducts => {
                    const newProducts = [...prevProducts];
                    order.items.forEach(item => {
                        const productIndex = newProducts.findIndex(p => p.id === item.productId);
                        if (productIndex !== -1) {
                            newProducts[productIndex].quantity += item.quantity;
                        }
                    });
                    return newProducts;
                });
            }
            setOrders(prev => prev.filter(o => o.id !== orderId));
        }
    };
     const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const oldStatus = order.status;
        if (oldStatus === newStatus) return;

        // Stock adjustment logic
        setProducts(prevProducts => {
            const newProducts = [...prevProducts];
            let canChangeStatus = true;

            // Deduct stock when shipping from pending
            if (oldStatus === 'Pending' && (newStatus === 'Shipped' || newStatus === 'Delivered')) {
                for (const item of order.items) {
                    const productIndex = newProducts.findIndex(p => p.id === item.productId);
                    if (productIndex === -1 || newProducts[productIndex].quantity < item.quantity) {
                        alert(`Not enough stock for ${item.productName}. Required: ${item.quantity}, Available: ${productIndex === -1 ? 0 : newProducts[productIndex].quantity}`);
                        canChangeStatus = false;
                        break; 
                    }
                }

                if (canChangeStatus) {
                    order.items.forEach(item => {
                        const productIndex = newProducts.findIndex(p => p.id === item.productId);
                        if (productIndex !== -1) newProducts[productIndex].quantity -= item.quantity;
                    });
                }
            }
            // Return stock when canceling a shipped/delivered order
            else if ((oldStatus === 'Shipped' || oldStatus === 'Delivered') && newStatus === 'Canceled') {
                order.items.forEach(item => {
                    const productIndex = newProducts.findIndex(p => p.id === item.productId);
                    if (productIndex !== -1) newProducts[productIndex].quantity += item.quantity;
                });
            }

            if(canChangeStatus) {
                setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                return newProducts;
            }
            
            return prevProducts; // Return original products if status change failed
        });
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><SpinnerIcon className="w-10 h-10 animate-spin text-[var(--theme-primary)]" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Inventory & Order Management</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">An advanced dashboard to track products, manage sales, and export reports.</p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('inventory')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'inventory' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                        Inventory
                    </button>
                    <button onClick={() => setActiveTab('orders')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'orders' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                        Orders
                    </button>
                </nav>
            </div>

            {/* Content Area */}
            {activeTab === 'inventory' && <InventoryView products={products} onSave={handleProductSave} onDelete={handleProductDelete} />}
            {activeTab === 'orders' && <OrdersView orders={orders} products={products} onSave={handleOrderSave} onDelete={handleOrderDelete} onStatusChange={handleStatusChange} />}
        </div>
    );
};


// --- INVENTORY COMPONENT ---
const InventoryView: React.FC<{ products: Product[]; onSave: (p: Product) => void; onDelete: (id: string) => void; }> = ({ products, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const exportToPdf = () => {
        const doc = new jsPDF();
        doc.text("Inventory Report", 14, 15);
        autoTable(doc, {
            head: [['SKU', 'Product Name', 'Quantity', 'Price']],
            body: products.map(p => [p.id, p.name, p.quantity, `$${p.price.toFixed(2)}`]),
            startY: 20,
        });
        doc.save('inventory-report.pdf');
    };

    const exportToExcel = () => {
        const ws = window.XLSX.utils.json_to_sheet(products.map(p => ({ SKU: p.id, Name: p.name, Quantity: p.quantity, Price: p.price })));
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Inventory");
        window.XLSX.writeFile(wb, "inventory-report.xlsx");
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Products ({products.length})</h3>
                <div className="flex gap-2">
                     <button onClick={exportToPdf} className="px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300">Export PDF</button>
                     <button onClick={exportToExcel} className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300">Export Excel</button>
                    <button onClick={handleAddNew} className="px-4 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-sm hover:opacity-90">Add Product</button>
                </div>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th className="px-6 py-3">SKU</th>
                            <th className="px-6 py-3">Product Name</th>
                            <th className="px-6 py-3">Quantity</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} className="bg-white border-b hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{p.id}</td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{p.name}</td>
                                <td className="px-6 py-4">{p.quantity}</td>
                                <td className="px-6 py-4">${p.price.toFixed(2)}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => handleEdit(p)} className="font-medium text-[var(--theme-primary)] hover:underline dark:text-sky-400">Edit</button>
                                    <button onClick={() => onDelete(p.id)} className="font-medium text-red-600 hover:underline dark:text-red-400">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <ProductModal product={editingProduct} onSave={onSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

// --- ORDERS COMPONENT ---
const OrdersView: React.FC<{ orders: Order[]; products: Product[]; onSave: (o: Order) => void; onDelete: (id: string) => void; onStatusChange: (id: string, status: OrderStatus) => void; }> = ({ orders, products, onSave, onDelete, onStatusChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const exportToPdf = () => {
        const doc = new jsPDF();
        doc.text("Orders Report", 14, 15);
        autoTable(doc, {
            head: [['Order ID', 'Date', 'Customer', 'Items', 'Total', 'Status']],
            body: orders.map(o => [o.id, new Date(o.date).toLocaleDateString(), o.customerName, o.items.map(i => `${i.quantity}x ${i.productName}`).join(', '), `$${o.totalAmount.toFixed(2)}`, o.status]),
            startY: 20,
        });
        doc.save('orders-report.pdf');
    };
    const exportToExcel = () => {
        const data = orders.map(o => ({
            'Order ID': o.id,
            'Date': new Date(o.date).toLocaleDateString(),
            'Customer': o.customerName,
            'Items': o.items.map(i => `${i.quantity}x ${i.productName}`).join(', '),
            'Total': o.totalAmount,
            'Status': o.status
        }));
        const ws = window.XLSX.utils.json_to_sheet(data);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Orders");
        window.XLSX.writeFile(wb, "orders-report.xlsx");
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case 'Shipped': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case 'Delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'Canceled': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Orders ({orders.length})</h3>
                 <div className="flex gap-2">
                     <button onClick={exportToPdf} className="px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300">Export PDF</button>
                     <button onClick={exportToExcel} className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300">Export Excel</button>
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-sm hover:opacity-90">Create Order</button>
                </div>
            </div>
            {/* Table */}
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th className="px-6 py-3">Order ID</th>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Items</th>
                            <th className="px-6 py-3">Total</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id} className="bg-white border-b hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{o.id}</td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{o.customerName}</td>
                                <td className="px-6 py-4">{new Date(o.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{o.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                                <td className="px-6 py-4 font-semibold">${o.totalAmount.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <select value={o.status} onChange={(e) => onStatusChange(o.id, e.target.value as OrderStatus)} className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-none focus:ring-0 ${getStatusColor(o.status)}`}>
                                        <option value="Pending">Pending</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Canceled">Canceled</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => onDelete(o.id)} className="font-medium text-red-600 hover:underline dark:text-red-400">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <OrderModal products={products} onSave={onSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};


// --- MODAL COMPONENTS ---
const ProductModal: React.FC<{ product: Product | null; onSave: (p: Product) => void; onClose: () => void; }> = ({ product, onSave, onClose }) => {
    const [formData, setFormData] = useState<Product>(product || { id: '', name: '', quantity: 0, price: 0 });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['quantity', 'price'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4 dark:bg-slate-800">
                <h2 className="text-xl font-bold">{product ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="id" value={formData.id} onChange={handleChange} placeholder="SKU" required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" disabled={!!product} />
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="Price" required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg hover:opacity-90">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const OrderModal: React.FC<{ products: Product[]; onSave: (o: Order) => void; onClose: () => void; }> = ({ products, onSave, onClose }) => {
    const [customerName, setCustomerName] = useState('');
    const [items, setItems] = useState<OrderItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const totalAmount = useMemo(() => items.reduce((sum, item) => sum + (item.price * item.quantity), 0), [items]);

    const handleAddItem = () => {
        const product = products.find(p => p.id === selectedProduct);
        if (!product || selectedQuantity <= 0) return;
        
        setItems(prev => {
            const existing = prev.find(i => i.productId === product.id);
            if (existing) {
                return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + selectedQuantity } : i);
            }
            return [...prev, { productId: product.id, productName: product.name, quantity: selectedQuantity, price: product.price }];
        });
        setSelectedProduct('');
        setSelectedQuantity(1);
    };

    const handleRemoveItem = (productId: string) => {
        setItems(prev => prev.filter(i => i.productId !== productId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!customerName || items.length === 0) {
            alert("Please provide a customer name and add at least one item.");
            return;
        }
        const newOrder: Order = {
            id: `ORD-${Date.now()}`,
            customerName,
            items,
            status: 'Pending',
            totalAmount,
            date: new Date().toISOString(),
        };
        onSave(newOrder);
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl space-y-4 dark:bg-slate-800">
                <h2 className="text-xl font-bold">Create New Order</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer Name" required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    {/* Add Items Section */}
                    <div className="p-4 border rounded space-y-2 dark:border-slate-600">
                        <h3 className="font-semibold">Order Items</h3>
                        <div className="flex gap-2 items-center">
                            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="flex-grow p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                <option value="">Select a product...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.quantity} in stock)</option>)}
                            </select>
                            <input type="number" value={selectedQuantity} onChange={e => setSelectedQuantity(parseInt(e.target.value) || 1)} min="1" className="w-20 p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            <button type="button" onClick={handleAddItem} className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">+</button>
                        </div>
                        {/* Items List */}
                        <div className="max-h-40 overflow-y-auto">
                           {items.map(item => (
                               <div key={item.productId} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded mt-1">
                                   <span>{item.quantity} x {item.productName} @ ${item.price.toFixed(2)}</span>
                                   <button type="button" onClick={() => handleRemoveItem(item.productId)}><TrashIcon className="w-4 h-4 text-red-500"/></button>
                               </div>
                           ))}
                        </div>
                    </div>
                    {/* Total */}
                    <div className="text-right font-bold text-lg">Total: ${totalAmount.toFixed(2)}</div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg hover:opacity-90">Create Order</button>
                    </div>
                </form>
            </div>
        </div>
    )
};


export default InventoryOrderManagement;
