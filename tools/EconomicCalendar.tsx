import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SpinnerIcon, SearchIcon, BellIcon, DownloadIcon } from '../components/icons';

// --- TYPE DEFINITIONS ---
interface EconomicEvent {
    id: string;
    utcTime: string;
    countryCode: string;
    currency: string;
    event: string;
    impact: 'High' | 'Medium' | 'Low';
    actual: string;
    forecast: string;
    previous: string;
    description: string;
    source: string;
}

type ImpactFilter = 'All' | 'High' | 'Medium' | 'Low';

const timezones = {
    'Local': Intl.DateTimeFormat().resolvedOptions().timeZone,
    'UTC': 'UTC',
    'IST': 'Asia/Kolkata',
    'New York': 'America/New_York',
    'London': 'Europe/London',
};

const CACHE_PREFIX = 'economic_calendar_';
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// --- MAIN COMPONENT ---
const EconomicCalendar: React.FC = () => {
    const [events, setEvents] = useState<EconomicEvent[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [filters, setFilters] = useState({ impact: 'All' as ImpactFilter, search: '' });
    const [timezone, setTimezone] = useState('Local');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Connecting to market data feeds...');
    const [error, setError] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);
    const [notificationStatus, setNotificationStatus] = useState(Notification.permission);

    const fetchEvents = useCallback(async (targetDate: string) => {
        setIsLoading(true);
        // Do not clear the error here, so if cache is shown and fetch fails, the error appears
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const prompt = `
                You are an economic data API. Use your real-time search capabilities to find all major economic events for the date: ${targetDate}.
                Your response MUST be a valid JSON array of objects. Each object must have this exact structure:
                {
                  "utcTime": "string (ISO 8601 format, e.g., '2024-07-29T12:30:00Z')",
                  "countryCode": "string (2-letter ISO code, e.g., 'US')",
                  "currency": "string (3-letter currency code, e.g., 'USD')",
                  "event": "string (e.g., 'Non-Farm Payrolls')",
                  "impact": "string ('High', 'Medium', or 'Low')",
                  "actual": "string ('N/A' if not released)",
                  "forecast": "string ('N/A' if unavailable)",
                  "previous": "string ('N/A' if unavailable)",
                  "description": "string (one-sentence explanation)",
                  "source": "string (publishing body, e.g., 'BLS')"
                }
                Do not include any text, explanations, or markdown syntax before or after the JSON array. If no events are found, return an empty array [].
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { 
                    tools: [{ googleSearch: {} }],
                },
            });
            
            let jsonString = response.text.trim();
            if (jsonString.startsWith('```json')) {
                jsonString = jsonString.substring(7, jsonString.length - 3).trim();
            } else if (jsonString.startsWith('```')) {
                 jsonString = jsonString.substring(3, jsonString.length - 3).trim();
            }

            const data = JSON.parse(jsonString);

            if(Array.isArray(data)) {
                 const newEvents = data.map((item, index) => ({ ...item, id: `${targetDate}-${index}` }));
                 setEvents(newEvents);
                 setError(''); // Clear error on successful fetch
                 // Cache the new data
                 const cacheData = {
                     timestamp: Date.now(),
                     data: newEvents
                 };
                 localStorage.setItem(`${CACHE_PREFIX}${targetDate}`, JSON.stringify(cacheData));
            } else {
                throw new Error("AI did not return a valid array.");
            }
        } catch (e) {
            console.error(e);
            setError("Failed to fetch fresh economic data. Displaying cached data if available.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const cacheKey = `${CACHE_PREFIX}${date}`;
        let cacheLoaded = false;
        
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const { timestamp, data } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION_MS) {
                    setEvents(data);
                    setIsLoading(false); // Instantly show cached data
                    cacheLoaded = true;
                }
            }
        } catch (e) {
            console.error("Failed to read from cache", e);
            localStorage.removeItem(cacheKey); // Clear corrupted cache
        }
        
        if (!cacheLoaded) {
            setEvents([]); // Clear old data if cache is invalid
            setIsLoading(true);
        }

        // Always fetch fresh data.
        fetchEvents(date);
    }, [date, fetchEvents]);
    
    useEffect(() => {
        if (isLoading && events.length === 0) { // Only show messages on initial blocking load
            const messages = [
                "Connecting to market data feeds...",
                "Fetching real-time events...",
                "Analyzing economic indicators...",
                "Compiling the calendar...",
                "Finalizing data..."
            ];
            let messageIndex = 0;
            const intervalId = setInterval(() => {
                messageIndex = (messageIndex + 1) % messages.length;
                setLoadingMessage(messages[messageIndex]);
            }, 2500);

            return () => clearInterval(intervalId);
        }
    }, [isLoading, events.length]);


    useEffect(() => {
        let intervalId: number | undefined;
        if (autoRefresh) {
            intervalId = window.setInterval(() => fetchEvents(date), 30000); // Refresh every 30 seconds
        }
        return () => clearInterval(intervalId);
    }, [autoRefresh, date, fetchEvents]);

    const filteredEvents = useMemo(() => {
        return events
            .filter(e => filters.impact === 'All' || e.impact === filters.impact)
            .filter(e => 
                e.event.toLowerCase().includes(filters.search.toLowerCase()) ||
                e.currency.toLowerCase().includes(filters.search.toLowerCase()) ||
                e.countryCode.toLowerCase().includes(filters.search.toLowerCase())
            )
            .sort((a, b) => new Date(a.utcTime).getTime() - new Date(b.utcTime).getTime());
    }, [events, filters]);

    const handleSetAlert = (event: EconomicEvent) => {
        if (notificationStatus !== 'granted') {
            Notification.requestPermission().then(permission => {
                setNotificationStatus(permission);
                if (permission === 'granted') {
                    scheduleNotification(event);
                } else {
                    alert('Please enable notifications to set alerts.');
                }
            });
        } else {
            scheduleNotification(event);
        }
    };

    const scheduleNotification = (event: EconomicEvent) => {
        const eventTime = new Date(event.utcTime).getTime();
        const alertTime = eventTime - 15 * 60 * 1000; // 15 minutes before
        const now = Date.now();

        if (alertTime > now) {
            setTimeout(() => {
                new Notification(`Upcoming Event: ${event.currency}`, {
                    body: `${event.event} is in 15 minutes.`,
                    icon: 'https://aistudio.google.com/favicon.ico'
                });
            }, alertTime - now);
            alert(`Alert set for ${event.event} (15 minutes prior).`);
        } else {
            alert('This event has already passed or is too soon to set an alert.');
        }
    };

    return (
        <div className="space-y-6">
            {selectedEvent && <EventDetailsModal event={selectedEvent} timezone={timezone} onClose={() => setSelectedEvent(null)} />}
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Economic Calendar</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Track real-time economic events impacting the markets.</p>
            </div>

            <FilterBar date={date} setDate={setDate} filters={filters} setFilters={setFilters} timezone={timezone} setTimezone={setTimezone} autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh} data={filteredEvents} />

            {isLoading && events.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-64">
                    <SpinnerIcon className="w-10 h-10 animate-spin text-[var(--theme-primary)]" />
                    <p className="mt-4 text-slate-500 dark:text-slate-400">{loadingMessage}</p>
                </div>
            ) : error && events.length === 0 ? (
                <div className="p-4 text-center bg-red-50 text-red-700 rounded-lg dark:bg-red-900/50 dark:text-red-300">{error}</div>
            ) : (
                <>
                {error && <div className="p-2 text-center text-sm bg-yellow-50 text-yellow-700 rounded-lg dark:bg-yellow-900/50 dark:text-yellow-300">{error}</div>}
                <EventTable events={filteredEvents} timezone={timezone} onSetAlert={handleSetAlert} onSelectEvent={setSelectedEvent} />
                </>
            )}
            <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is an Economic Calendar?</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">An Economic Calendar is a vital tool for traders, investors, and economists that lists upcoming macroeconomic events and data releases scheduled for various countries. These events, such as GDP announcements, inflation reports (CPI), employment figures (Non-Farm Payrolls), and central bank interest rate decisions, can significantly impact financial markets, including forex, stocks, and commodities. Our AI-powered calendar fetches this data in real-time to help you stay ahead of market-moving news.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Tool</h2>
                    <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
                        <li><strong>Select a Date:</strong> Use the date picker to view events for a specific day.</li>
                        <li><strong>Set Your Timezone:</strong> Choose your local timezone to see event times adjusted for your location.</li>
                        <li><strong>Filter Events:</strong> Use the impact filters (High, Medium, Low) and the search bar to narrow down the events that are most relevant to you.</li>
                        <li><strong>View Details & Set Alerts:</strong> Click on an event name to see a detailed description. Click the bell icon to set a browser notification 15 minutes before the event is released.</li>
                        <li><strong>Export Data:</strong> Use the PDF or CSV buttons to download the calendar data for your records.</li>
                    </ol>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
                    <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
                        <div>
                            <h3 className="font-semibold">What do 'Actual', 'Forecast', and 'Previous' mean?</h3>
                            <p><strong>Previous:</strong> The result from the prior reporting period. <strong>Forecast:</strong> The consensus estimate from market analysts. <strong>Actual:</strong> The official data released at the specified time. The market often reacts to the difference between the Actual and Forecast numbers.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">How do I use the "Impact" filter?</h3>
                            <p>"High" impact events (like interest rate decisions) are most likely to cause significant market volatility. "Low" impact events typically have a minimal market effect. Filtering by impact helps you focus on what matters most.</p>
                        </div>
                         <div>
                            <h3 className="font-semibold">How do the alerts work?</h3>
                            <p>When you set an alert, your browser will schedule a push notification to appear 15 minutes before the event's scheduled time. This requires you to grant notification permissions and keep the browser tab open.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

// --- UI SUB-COMPONENTS ---
const FilterBar: React.FC<any> = ({ date, setDate, filters, setFilters, timezone, setTimezone, autoRefresh, setAutoRefresh, data }) => {
    
    const exportToPdf = () => {
        const doc = new jsPDF();
        doc.text(`Economic Events for ${date}`, 14, 15);
        autoTable(doc, {
            head: [['Time', 'Currency', 'Event', 'Impact', 'Actual', 'Forecast', 'Previous']],
            body: data.map((e: EconomicEvent) => [
                new Date(e.utcTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: timezones[timezone as keyof typeof timezones] }),
                e.currency,
                e.event,
                e.impact,
                e.actual,
                e.forecast,
                e.previous
            ]),
            startY: 20
        });
        doc.save(`economic_calendar_${date}.pdf`);
    };

    const exportToCsv = () => {
        const headers = ['Time', 'Currency', 'Event', 'Impact', 'Actual', 'Forecast', 'Previous'];
        const rows = data.map((e: EconomicEvent) => [
            new Date(e.utcTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: timezones[timezone as keyof typeof timezones] }),
            e.currency, `"${e.event.replace(/"/g, '""')}"`, e.impact, e.actual, e.forecast, e.previous
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `economic_calendar_${date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 border border-slate-300 rounded-md bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                <select value={timezone} onChange={e => setTimezone(e.target.value)} className="p-2 border border-slate-300 rounded-md bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    {Object.keys(timezones).map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
                <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-1 rounded-md">
                    {(['All', 'High', 'Medium', 'Low'] as ImpactFilter[]).map(impact => (
                        <button key={impact} onClick={() => setFilters({ ...filters, impact })} className={`flex-1 text-sm py-1 rounded ${filters.impact === impact ? 'bg-white dark:bg-slate-600 shadow-sm' : ''}`}>{impact}</button>
                    ))}
                </div>
                <div className="relative md:col-span-2 lg:col-span-2">
                     <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                    <input type="text" placeholder="Search event, currency..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} className="w-full p-2 pl-9 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                </div>
            </div>
             <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="rounded"/> Auto-refresh</label>
                <div className="flex gap-4">
                    <button onClick={exportToPdf} className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold"><DownloadIcon className="w-4 h-4"/> PDF</button>
                    <button onClick={exportToCsv} className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold"><DownloadIcon className="w-4 h-4"/> CSV</button>
                </div>
            </div>
        </div>
    );
};

const EventTable: React.FC<{ events: EconomicEvent[], timezone: string, onSetAlert: (e: EconomicEvent) => void, onSelectEvent: (e: EconomicEvent) => void }> = ({ events, timezone, onSetAlert, onSelectEvent }) => {
    const getImpactColor = (impact: ImpactFilter) => {
        if (impact === 'High') return 'bg-red-500';
        if (impact === 'Medium') return 'bg-orange-500';
        return 'bg-green-500';
    };
    return (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700 text-xs uppercase text-left">
                    <tr>
                        {['Time', 'Currency', 'Event', 'Actual', 'Forecast', 'Previous', ''].map(h => <th key={h} className="p-3">{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {events.map(e => (
                        <tr key={e.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <td className="p-3 whitespace-nowrap">{new Date(e.utcTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: timezones[timezone as keyof typeof timezones] })}</td>
                            <td className="p-3 font-semibold flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${getImpactColor(e.impact)}`}></span>
                                {e.currency}
                            </td>
                            <td className="p-3 font-medium cursor-pointer hover:underline" onClick={() => onSelectEvent(e)}>{e.event}</td>
                            <td className="p-3 font-mono">{e.actual}</td>
                            <td className="p-3 font-mono">{e.forecast}</td>
                            <td className="p-3 font-mono">{e.previous}</td>
                            <td className="p-3"><button onClick={() => onSetAlert(e)} className="p-1 text-slate-500 hover:text-blue-600"><BellIcon className="w-4 h-4"/></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {events.length === 0 && <p className="text-center p-8 text-slate-500 dark:text-slate-400">No events found for the selected criteria.</p>}
        </div>
    );
};

const EventDetailsModal: React.FC<{ event: EconomicEvent, timezone: string, onClose: () => void }> = ({ event, timezone, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4" onClick={onClose}>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-lg space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{event.event} ({event.currency})</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{event.description}</p>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                    <p className="text-xs">Actual</p><p className="font-bold text-lg">{event.actual}</p>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                    <p className="text-xs">Forecast</p><p className="font-bold text-lg">{event.forecast}</p>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                    <p className="text-xs">Previous</p><p className="font-bold text-lg">{event.previous}</p>
                </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
                <p><strong>Time:</strong> {new Date(event.utcTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short', timeZone: timezones[timezone as keyof typeof timezones] })}</p>
                <p><strong>Source:</strong> {event.source}</p>
            </div>
            <div className="text-right pt-2"><button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">Close</button></div>
        </div>
    </div>
);

export default EconomicCalendar;