import React, { useState, useMemo } from 'react';
import { SearchIcon } from '../components/icons';

// --- TYPE DEFINITIONS ---
interface Calculator {
  id: string;
  name: string;
  category: string;
  component: React.FC;
}

// --- HELPER & UI COMPONENTS ---
const CalculatorWrapper: React.FC<{ title: string; children: React.ReactNode; disclaimer?: string }> = ({ title, children, disclaimer }) => (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
            {children}
        </div>
        {disclaimer && <p className="text-xs text-slate-500 italic dark:text-slate-400">{disclaimer}</p>}
    </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; unit?: string }> = ({ label, unit, ...props }) => (
    <div className="flex-1">
        {label && <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{label}</label>}
         <div className="relative">
            <input {...props} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
            {unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-500">{unit}</span>}
        </div>
    </div>
);

const Result: React.FC<{ label: string; value: string | number; unit?: string }> = ({ label, value, unit }) => (
    <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md text-center">
        <p className="font-semibold text-slate-600 dark:text-slate-300">{label}</p>
        <p className="font-mono text-xl text-[var(--theme-primary)] dark:text-sky-300">
            {value} {unit && <span className="text-sm">{unit}</span>}
        </p>
    </div>
);

// --- FITNESS CALCULATORS ---

const BMICalculator: React.FC = () => {
    const [weight, setWeight] = useState('70');
    const [height, setHeight] = useState('175');
    const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
    const [ft, setFt] = useState('5');
    const [inc, setInc] = useState('9');
    const [lbs, setLbs] = useState('154');


    const { bmi, category } = useMemo(() => {
        let w_kg = 0;
        let h_m = 0;

        if (unit === 'metric') {
            const w = parseFloat(weight);
            const h_cm = parseFloat(height);
            if (isNaN(w) || isNaN(h_cm) || w <= 0 || h_cm <= 0) return { bmi: 0, category: '' };
            w_kg = w;
            h_m = h_cm / 100;
        } else { // imperial
            const w_lbs = parseFloat(lbs);
            const h_ft = parseFloat(ft);
            const h_in = parseFloat(inc);
            if (isNaN(w_lbs) || isNaN(h_ft) || isNaN(h_in) || w_lbs <= 0 || (h_ft <= 0 && h_in <= 0)) return { bmi: 0, category: '' };
            const totalInches = (h_ft * 12) + h_in;
            w_kg = w_lbs * 0.453592;
            h_m = totalInches * 0.0254; // convert inches to meters
        }

        const bmiVal = w_kg / (h_m ** 2);
        
        if (bmiVal <= 0 || !isFinite(bmiVal)) return { bmi: 0, category: '' };

        let cat = '';
        if (bmiVal < 18.5) cat = 'Underweight';
        else if (bmiVal < 25) cat = 'Normal weight';
        else if (bmiVal < 30) cat = 'Overweight';
        else cat = 'Obesity';
        
        return { bmi: bmiVal, category: cat };
    }, [weight, height, unit, ft, inc, lbs]);

    return (
        <CalculatorWrapper title="BMI Calculator" disclaimer="BMI is a general screening tool and does not account for body composition. Consult a healthcare professional for a complete health assessment.">
            <div className="flex gap-2">
                <button onClick={() => setUnit('metric')} className={`flex-1 p-2 rounded ${unit === 'metric' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}>Metric (kg, cm)</button>
                <button onClick={() => setUnit('imperial')} className={`flex-1 p-2 rounded ${unit === 'imperial' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}>Imperial (lbs, ft, in)</button>
            </div>
            {unit === 'metric' ? (
                <div className="flex gap-2">
                    <Input label="Weight" value={weight} onChange={e => setWeight(e.target.value)} type="number" unit="kg" />
                    <Input label="Height" value={height} onChange={e => setHeight(e.target.value)} type="number" unit="cm" />
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <Input label="Weight" value={lbs} onChange={e => setLbs(e.target.value)} type="number" unit="lbs" />
                    <div className="flex gap-2">
                        <Input label="Height" value={ft} onChange={e => setFt(e.target.value)} type="number" unit="ft" />
                        <Input label="" value={inc} onChange={e => setInc(e.target.value)} type="number" unit="in" />
                    </div>
                </div>
            )}
            {bmi > 0 && <Result label="Your BMI" value={`${bmi.toFixed(1)} (${category})`} />}
        </CalculatorWrapper>
    );
};

const BMRCalorieTDEECalculator: React.FC<{ mode: 'BMR' | 'Calorie' | 'TDEE' }> = ({ mode }) => {
    const [age, setAge] = useState('30');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [weight, setWeight] = useState('70');
    const [height, setHeight] = useState('175');
    const [activity, setActivity] = useState('1.375');

    const { bmr, tdee } = useMemo(() => {
        const a=parseFloat(age), w=parseFloat(weight), h=parseFloat(height);
        if([a,w,h].some(isNaN) || [a,w,h].some(v => v <= 0)) return { bmr: 0, tdee: 0 };
        const bmrVal = (10 * w) + (6.25 * h) - (5 * a) + (gender === 'male' ? 5 : -161); // Mifflin-St Jeor
        const tdeeVal = bmrVal * parseFloat(activity);
        return { bmr: bmrVal, tdee: tdeeVal };
    }, [age, gender, weight, height, activity]);
    
    const title = mode === 'BMR' ? 'BMR Calculator' : (mode === 'TDEE' ? 'TDEE Calculator' : 'Calorie Calculator');

    return (
        <CalculatorWrapper title={title}>
             <div className="grid grid-cols-2 gap-4">
                <Input label="Age" value={age} onChange={e => setAge(e.target.value)} type="number" />
                <div>
                    <label className="block text-sm mb-1">Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full p-2 border rounded dark:bg-slate-700 h-10">
                        <option value="male">Male</option><option value="female">Female</option>
                    </select>
                </div>
                <Input label="Weight" value={weight} onChange={e => setWeight(e.target.value)} type="number" unit="kg" />
                <Input label="Height" value={height} onChange={e => setHeight(e.target.value)} type="number" unit="cm" />
            </div>
             {(mode === 'Calorie' || mode === 'TDEE') && (
                <div>
                    <label className="block text-sm mb-1">Activity Level</label>
                    <select value={activity} onChange={e => setActivity(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700">
                        <option value="1.2">Sedentary (little or no exercise)</option>
                        <option value="1.375">Lightly active (light exercise/sports 1-3 days/week)</option>
                        <option value="1.55">Moderately active (moderate exercise/sports 3-5 days/week)</option>
                        <option value="1.725">Very active (hard exercise/sports 6-7 days a week)</option>
                        <option value="1.9">Extra active (very hard exercise & physical job)</option>
                    </select>
                </div>
            )}
            {bmr > 0 && mode === 'BMR' && <Result label="Basal Metabolic Rate" value={bmr.toFixed(0)} unit="calories/day" />}
            {tdee > 0 && (mode === 'Calorie' || mode === 'TDEE') && <Result label="Maintenance Calories (TDEE)" value={tdee.toFixed(0)} unit="calories/day" />}
            {tdee > 0 && mode === 'Calorie' && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <Result label="Weight Loss (~20%)" value={(tdee * 0.8).toFixed(0)} unit="cal/day" />
                    <Result label="Weight Gain (~20%)" value={(tdee * 1.2).toFixed(0)} unit="cal/day" />
                </div>
            )}
        </CalculatorWrapper>
    );
};

const BodyFatCalculator: React.FC = () => {
    const [gender, setGender] = useState('male');
    const [height, setHeight] = useState('175');
    const [neck, setNeck] = useState('40');
    const [waist, setWaist] = useState('85');
    const [hips, setHips] = useState('90');
    
    const bodyFat = useMemo(() => {
        const h=parseFloat(height), n=parseFloat(neck), w=parseFloat(waist), hip=parseFloat(hips);
        if(isNaN(h) || isNaN(n) || isNaN(w) || h <= 0 || n <= 0 || w <= 0) return 0;

        if(gender === 'male') {
            return 86.010 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76;
        } else { // female
            if(isNaN(hip) || hip <= 0) return 0;
            return 163.205 * Math.log10(w + hip - n) - 97.684 * Math.log10(h) - 78.387;
        }
    }, [gender, height, neck, waist, hips]);

    return (
        <CalculatorWrapper title="Body Fat Calculator (U.S. Navy Method)" disclaimer="This is an estimation. For accurate measurements, consult a professional.">
            <div>
                <label className="block text-sm mb-1">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700">
                    <option value="male">Male</option><option value="female">Female</option>
                </select>
            </div>
            <div className="flex gap-2">
                <Input label="Height" value={height} onChange={e => setHeight(e.target.value)} type="number" unit="cm" />
                <Input label="Neck" value={neck} onChange={e => setNeck(e.target.value)} type="number" unit="cm" />
            </div>
            <div className="flex gap-2">
                <Input label="Waist" value={waist} onChange={e => setWaist(e.target.value)} type="number" unit="cm" />
                {gender === 'female' && <Input label="Hips" value={hips} onChange={e => setHips(e.target.value)} type="number" unit="cm" />}
            </div>
            {bodyFat > 0 && <Result label="Estimated Body Fat" value={bodyFat.toFixed(1)} unit="%" />}
        </CalculatorWrapper>
    );
};

const IdealWeightCalculator: React.FC = () => {
    const [gender, setGender] = useState('male');
    const [height, setHeight] = useState('175');

    const idealWeight = useMemo(() => {
        const h_cm = parseFloat(height);
        if(isNaN(h_cm) || h_cm <= 0) return '0 - 0';
        const h_in = h_cm / 2.54;
        const inchesOver5Ft = Math.max(0, h_in - 60);
        let weight_kg = 0;

        if(gender === 'male') {
            weight_kg = 52 + (1.9 * inchesOver5Ft);
        } else {
            weight_kg = 49 + (1.7 * inchesOver5Ft);
        }
        
        return `${(weight_kg * 0.9).toFixed(1)} - ${(weight_kg * 1.1).toFixed(1)}`; // Provide a range
    }, [gender, height]);
    
    return (
        <CalculatorWrapper title="Ideal Weight Calculator">
             <div className="flex gap-2">
                <Input label="Height" value={height} onChange={e => setHeight(e.target.value)} type="number" unit="cm" />
                <div>
                    <label className="block text-sm mb-1">Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 h-10">
                        <option value="male">Male</option><option value="female">Female</option>
                    </select>
                </div>
            </div>
            <Result label="Ideal Weight Range (J.D. Robinson Formula)" value={idealWeight} unit="kg" />
        </CalculatorWrapper>
    );
};

const OneRepMaxCalculator: React.FC = () => {
    const [weight, setWeight] = useState('100');
    const [reps, setReps] = useState('5');
    
    const oneRepMax = useMemo(() => {
        const w = parseFloat(weight);
        const r = parseInt(reps);
        if(isNaN(w) || isNaN(r) || w <= 0 || r <= 0) return 0;
        return w / (1.0278 - 0.0278 * r); // Brzycki formula
    }, [weight, reps]);
    
    return (
        <CalculatorWrapper title="One Rep Max (1RM) Calculator" disclaimer="This formula is most accurate for reps between 1 and 10.">
            <div className="flex gap-2">
                <Input label="Weight Lifted" value={weight} onChange={e => setWeight(e.target.value)} type="number" unit="kg" />
                <Input label="Repetitions" value={reps} onChange={e => setReps(e.target.value)} type="number" />
            </div>
            {oneRepMax > 0 && <Result label="Estimated One Rep Max" value={oneRepMax.toFixed(1)} unit="kg" />}
        </CalculatorWrapper>
    );
};

const TargetHeartRateCalculator: React.FC = () => {
    const [age, setAge] = useState('30');
    const { moderate, vigorous } = useMemo(() => {
        const a = parseInt(age);
        if(isNaN(a) || a <= 0) return {};
        const maxHR = 220 - a;
        return {
            moderate: `${Math.round(maxHR * 0.5)} - ${Math.round(maxHR * 0.7)}`,
            vigorous: `${Math.round(maxHR * 0.7)} - ${Math.round(maxHR * 0.85)}`
        };
    }, [age]);
    return (
        <CalculatorWrapper title="Target Heart Rate Calculator">
            <Input label="Age" value={age} onChange={e => setAge(e.target.value)} type="number" />
            {moderate && <Result label="Moderate Intensity Zone (50-70%)" value={moderate} unit="bpm" />}
            {vigorous && <Result label="Vigorous Intensity Zone (70-85%)" value={vigorous} unit="bpm" />}
        </CalculatorWrapper>
    );
};

const PaceCalculator: React.FC = () => {
    const [distance, setDistance] = useState('5');
    const [hours, setHours] = useState('0');
    const [minutes, setMinutes] = useState('25');
    const [seconds, setSeconds] = useState('0');

    const { pace, speed } = useMemo(() => {
        const d_km = parseFloat(distance);
        const h = parseInt(hours) || 0;
        const m = parseInt(minutes) || 0;
        const s = parseInt(seconds) || 0;
        if (isNaN(d_km) || d_km <= 0) return { pace: '...', speed: '...'};

        const totalSeconds = (h * 3600) + (m * 60) + s;
        if (totalSeconds <= 0) return { pace: '...', speed: '...'};

        const pace_min_km = (totalSeconds / 60) / d_km;
        const pace_minutes = Math.floor(pace_min_km);
        const pace_seconds = Math.round((pace_min_km - pace_minutes) * 60);

        const speed_kmh = d_km / (totalSeconds / 3600);

        return {
            pace: `${pace_minutes}:${pace_seconds.toString().padStart(2, '0')}`,
            speed: speed_kmh.toFixed(2)
        };
    }, [distance, hours, minutes, seconds]);

    return (
        <CalculatorWrapper title="Pace Calculator">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Distance" value={distance} onChange={e => setDistance(e.target.value)} type="number" unit="km" />
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Time</label>
                    <div className="flex gap-2">
                        <Input value={hours} onChange={e => setHours(e.target.value)} type="number" unit="h" />
                        <Input value={minutes} onChange={e => setMinutes(e.target.value)} type="number" unit="m" />
                        <Input value={seconds} onChange={e => setSeconds(e.target.value)} type="number" unit="s" />
                    </div>
                </div>
            </div>
            <Result label="Pace" value={pace} unit="min/km" />
            <Result label="Speed" value={speed} unit="km/h" />
        </CalculatorWrapper>
    );
};

const ArmyBodyFatCalculator: React.FC = () => {
    return <BodyFatCalculator />;
};

const LeanBodyMassCalculator: React.FC = () => {
    const [gender, setGender] = useState('male');
    const [weight, setWeight] = useState('70');
    const [height, setHeight] = useState('175');

    const lbm = useMemo(() => {
        const w = parseFloat(weight);
        const h = parseFloat(height);
        if(isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return 0;
        
        if (gender === 'male') {
            return (0.407 * w) + (0.267 * h) - 19.2; // Boer formula
        } else {
            return (0.252 * w) + (0.473 * h) - 48.3; // Boer formula
        }
    }, [gender, weight, height]);

    return (
        <CalculatorWrapper title="Lean Body Mass Calculator" disclaimer="This is an estimation based on the Boer formula.">
            <div className="flex gap-2">
                <Input label="Weight" value={weight} onChange={e => setWeight(e.target.value)} type="number" unit="kg" />
                <Input label="Height" value={height} onChange={e => setHeight(e.target.value)} type="number" unit="cm" />
                 <div>
                    <label className="block text-sm mb-1">Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full p-2 border rounded dark:bg-slate-700 h-10">
                        <option value="male">Male</option><option value="female">Female</option>
                    </select>
                </div>
            </div>
            {lbm > 0 && <Result label="Lean Body Mass" value={lbm.toFixed(1)} unit="kg" />}
        </CalculatorWrapper>
    );
};

const HealthyWeightCalculator: React.FC = () => {
    const [height, setHeight] = useState('175');
    
    const range = useMemo(() => {
        const h_cm = parseFloat(height);
        if(isNaN(h_cm) || h_cm <= 0) return '...';
        const h_m = h_cm / 100;
        const lower = 18.5 * (h_m ** 2);
        const upper = 24.9 * (h_m ** 2);
        return `${lower.toFixed(1)} - ${upper.toFixed(1)}`;
    }, [height]);

    return (
        <CalculatorWrapper title="Healthy Weight Calculator" disclaimer="Based on a healthy BMI range of 18.5 - 24.9.">
            <Input label="Height" value={height} onChange={e => setHeight(e.target.value)} type="number" unit="cm" />
            <Result label="Healthy Weight Range" value={range} unit="kg" />
        </CalculatorWrapper>
    );
};

const CaloriesBurnedCalculator: React.FC = () => {
    const [activity, setActivity] = useState('9.8'); // Running
    const [duration, setDuration] = useState('30');
    const [weight, setWeight] = useState('70');

    const calories = useMemo(() => {
        const met = parseFloat(activity);
        const dur_min = parseFloat(duration);
        const w_kg = parseFloat(weight);
        if(isNaN(met) || isNaN(dur_min) || isNaN(w_kg) || dur_min <= 0 || w_kg <= 0) return '...';
        return (met * 3.5 * w_kg / 200) * dur_min;
    }, [activity, duration, weight]);

    const activities = [
        { name: 'Running (10 km/h)', met: 9.8 },
        { name: 'Walking (5 km/h)', met: 3.8 },
        { name: 'Cycling (moderate)', met: 7.5 },
        { name: 'Swimming (freestyle)', met: 8.0 },
        { name: 'Weight Lifting (vigorous)', met: 6.0 },
        { name: 'Aerobics (general)', met: 6.5 },
    ];
    
    return (
        <CalculatorWrapper title="Calories Burned Calculator">
            <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1">
                    <label className="block text-sm mb-1">Activity</label>
                    <select value={activity} onChange={e => setActivity(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 h-10">
                        {activities.map(a => <option key={a.name} value={a.met}>{a.name}</option>)}
                    </select>
                </div>
                 <Input label="Duration" value={duration} onChange={e => setDuration(e.target.value)} type="number" unit="min" />
                 <Input label="Weight" value={weight} onChange={e => setWeight(e.target.value)} type="number" unit="kg" />
            </div>
            <Result label="Estimated Calories Burned" value={typeof calories === 'number' ? calories.toFixed(0) : calories} unit="kcal" />
        </CalculatorWrapper>
    );
};

// --- PREGNANCY CALCULATORS ---

const DueDateCalculator: React.FC<{ mode: 'DueDate' | 'Pregnancy' | 'Conception' }> = ({ mode }) => {
    const [lmp, setLmp] = useState(new Date().toISOString().split('T')[0]);
    
    const { dueDate, currentWeek, conceptionDate } = useMemo(() => {
        const lmpDate = new Date(lmp);
        if (isNaN(lmpDate.getTime())) return { dueDate: null, currentWeek: null, conceptionDate: null };
        
        const due = new Date(lmpDate.getTime());
        due.setDate(due.getDate() + 280);
        
        const conception = new Date(lmpDate.getTime());
        conception.setDate(conception.getDate() + 14);

        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const week = Math.floor(diffDays / 7);
        const day = diffDays % 7;
        
        return { dueDate: due, currentWeek: `${week} weeks, ${day} days`, conceptionDate: conception };
    }, [lmp]);
    
    const title = mode === 'DueDate' ? 'Due Date Calculator' : (mode === 'Conception' ? 'Pregnancy Conception Calculator' : 'Pregnancy Calculator');

    return (
        <CalculatorWrapper title={title}>
            <Input label="First Day of Last Menstrual Period (LMP)" type="date" value={lmp} onChange={e => setLmp(e.target.value)} />
            {dueDate && (mode === 'DueDate' || mode === 'Pregnancy') && <Result label="Estimated Due Date" value={dueDate.toDateString()} />}
            {conceptionDate && mode.includes('Conception') && <Result label="Estimated Conception Date" value={conceptionDate.toDateString()} />}
            {currentWeek && mode === 'Pregnancy' && <Result label="Current Pregnancy Stage" value={currentWeek} />}
        </CalculatorWrapper>
    );
};

const OvulationCalculator: React.FC = () => {
    const [lmp, setLmp] = useState(new Date().toISOString().split('T')[0]);
    const [cycle, setCycle] = useState('28');

    const { fertileWindow, ovulationDate } = useMemo(() => {
        const lmpDate = new Date(lmp);
        const cycleLength = parseInt(cycle);
        if(isNaN(lmpDate.getTime()) || isNaN(cycleLength)) return {};
        
        const ovDate = new Date(lmpDate.getTime());
        ovDate.setDate(ovDate.getDate() + cycleLength - 14);

        const fertileStart = new Date(ovDate.getTime());
        fertileStart.setDate(fertileStart.getDate() - 5);
        const fertileEnd = new Date(ovDate.getTime());
        fertileEnd.setDate(fertileEnd.getDate() + 1);

        return { ovulationDate: ovDate.toDateString(), fertileWindow: `${fertileStart.toDateString()} - ${fertileEnd.toDateString()}` };
    }, [lmp, cycle]);

    return (
        <CalculatorWrapper title="Ovulation Calculator">
            <Input label="First Day of Last Period" type="date" value={lmp} onChange={e => setLmp(e.target.value)} />
            <Input label="Average Cycle Length" type="number" value={cycle} onChange={e => setCycle(e.target.value)} unit="days" />
            {ovulationDate && <Result label="Estimated Ovulation Date" value={ovulationDate} />}
            {fertileWindow && <Result label="Fertile Window" value={fertileWindow} />}
        </CalculatorWrapper>
    );
};

const PregnancyWeightGainCalculator: React.FC = () => {
    const [bmi, setBmi] = useState('22');
    
    const gain = useMemo(() => {
        const preBmi = parseFloat(bmi);
        if(isNaN(preBmi) || preBmi <= 0) return '...';
        if (preBmi < 18.5) return '12.5 - 18 kg';
        if (preBmi < 25) return '11.5 - 16 kg';
        if (preBmi < 30) return '7 - 11.5 kg';
        return '5 - 9 kg';
    }, [bmi]);

    return (
        <CalculatorWrapper title="Pregnancy Weight Gain Calculator" disclaimer="Based on IOM guidelines. This is a general recommendation for total weight gain during pregnancy.">
            <Input label="Pre-pregnancy BMI" value={bmi} onChange={e => setBmi(e.target.value)} type="number" />
            <Result label="Recommended Total Weight Gain" value={gain} />
        </CalculatorWrapper>
    );
};

const ConceptionCalculatorFromDueDate: React.FC = () => {
    const [dueDate, setDueDate] = useState(new Date(new Date().setDate(new Date().getDate() + 280)).toISOString().split('T')[0]);
    
    const conceptionDate = useMemo(() => {
        const due = new Date(dueDate);
        if (isNaN(due.getTime())) return '...';
        const conception = new Date(due.getTime());
        conception.setDate(conception.getDate() - 266);
        return conception.toDateString();
    }, [dueDate]);

    return (
        <CalculatorWrapper title="Conception Calculator">
            <Input label="Estimated Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            <Result label="Approximate Conception Date" value={conceptionDate} />
        </CalculatorWrapper>
    );
};

const PeriodCalculator: React.FC = () => {
     const [lmp, setLmp] = useState(new Date().toISOString().split('T')[0]);
    const [cycle, setCycle] = useState('28');

    const { nextPeriod } = useMemo(() => {
        const lmpDate = new Date(lmp);
        const cycleLength = parseInt(cycle);
        if(isNaN(lmpDate.getTime()) || isNaN(cycleLength)) return {};
        
        const nextDate = new Date(lmpDate.getTime());
        nextDate.setDate(nextDate.getDate() + cycleLength);

        return { nextPeriod: nextDate.toDateString() };
    }, [lmp, cycle]);

    return (
        <CalculatorWrapper title="Period Calculator">
            <Input label="First Day of Last Period" type="date" value={lmp} onChange={e => setLmp(e.target.value)} />
            <Input label="Average Cycle Length" type="number" value={cycle} onChange={e => setCycle(e.target.value)} unit="days" />
            {nextPeriod && <Result label="Estimated Next Period" value={nextPeriod} />}
        </CalculatorWrapper>
    );
};

// --- OTHER HEALTH ---
const BACCalculator: React.FC = () => {
    const [drinks, setDrinks] = useState('2');
    const [weight, setWeight] = useState('70');
    const [gender, setGender] = useState('male');
    const [hours, setHours] = useState('1');

    const bac = useMemo(() => {
        const d = parseFloat(drinks);
        const w = parseFloat(weight);
        const h = parseFloat(hours);
        const r = gender === 'male' ? 0.68 : 0.55;
        if([d,w,h].some(isNaN) || w <= 0) return '...';
        
        const alcoholGrams = d * 14;
        const weightGrams = w * 1000;
        
        const calculatedBac = (alcoholGrams / (weightGrams * r)) * 100 - (h * 0.015);
        return Math.max(0, calculatedBac).toFixed(3);
    }, [drinks, weight, gender, hours]);
    
    return (
        <CalculatorWrapper title="Blood Alcohol Content (BAC) Calculator" disclaimer="ESTIMATE ONLY. This calculation is for informational purposes and not for legal use. Do not use this to determine if it is safe to drive. Many factors affect BAC. If you've been drinking, do not drive.">
             <div className="grid grid-cols-2 gap-4">
                <Input label="Standard Drinks" value={drinks} onChange={e => setDrinks(e.target.value)} type="number" />
                <Input label="Body Weight" value={weight} onChange={e => setWeight(e.target.value)} type="number" unit="kg" />
                <Input label="Hours Since Last Drink" value={hours} onChange={e => setHours(e.target.value)} type="number" />
                <div>
                    <label className="block text-sm mb-1">Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full p-2 border rounded dark:bg-slate-700 h-10">
                        <option value="male">Male</option><option value="female">Female</option>
                    </select>
                </div>
            </div>
            <Result label="Estimated BAC" value={`${bac} %`} />
        </CalculatorWrapper>
    );
};

const MacroCalculator: React.FC = () => {
    const [calories, setCalories] = useState('2000');
    const [protein, setProtein] = useState('30');
    const [carbs, setCarbs] = useState('40');
    const [fat, setFat] = useState('30');

    const macros = useMemo(() => {
        const cals = parseFloat(calories);
        const p = parseFloat(protein) / 100;
        const c = parseFloat(carbs) / 100;
        const f = parseFloat(fat) / 100;
        if(isNaN(cals) || isNaN(p) || isNaN(c) || isNaN(f)) return {};

        return {
            proteinGrams: (cals * p) / 4,
            carbGrams: (cals * c) / 4,
            fatGrams: (cals * f) / 9,
        };
    }, [calories, protein, carbs, fat]);
    
    return (
        <CalculatorWrapper title="Macro Calculator">
            <Input label="Daily Calorie Goal" value={calories} onChange={e => setCalories(e.target.value)} type="number" unit="kcal" />
            <div className="grid grid-cols-3 gap-2">
                <Input label="Protein" value={protein} onChange={e => setProtein(e.target.value)} type="number" unit="%" />
                <Input label="Carbs" value={carbs} onChange={e => setCarbs(e.target.value)} type="number" unit="%" />
                <Input label="Fat" value={fat} onChange={e => setFat(e.target.value)} type="number" unit="%" />
            </div>
            {macros.proteinGrams && (
                <div className="grid grid-cols-3 gap-2">
                    <Result label="Protein" value={macros.proteinGrams.toFixed(0)} unit="g" />
                    <Result label="Carbs" value={macros.carbGrams.toFixed(0)} unit="g" />
                    <Result label="Fat" value={macros.fatGrams.toFixed(0)} unit="g" />
                </div>
            )}
        </CalculatorWrapper>
    );
};

const CarbohydrateCalculator: React.FC = () => {
    const [weight, setWeight] = useState('70');
    const [activity, setActivity] = useState('moderate');
    const carbs = useMemo(() => {
        const w = parseFloat(weight);
        if(isNaN(w)) return '...';
        let multiplier = 4; // moderate
        if (activity === 'light') multiplier = 3;
        if (activity === 'high') multiplier = 6;
        return `${(w * multiplier).toFixed(0)} g/day`;
    }, [weight, activity]);
    return (
        <CalculatorWrapper title="Carbohydrate Calculator">
             <div className="flex gap-2">
                <Input label="Weight" value={weight} onChange={e => setWeight(e.target.value)} type="number" unit="kg" />
                <select value={activity} onChange={e => setActivity(e.target.value)} className="p-2 border rounded dark:bg-slate-700 h-10 self-end">
                    <option value="light">Light Activity</option>
                    <option value="moderate">Moderate Activity</option>
                    <option value="high">High Activity</option>
                </select>
            </div>
            <Result label="Daily Carb Intake" value={carbs} />
        </CalculatorWrapper>
    );
};

const ProteinCalculator: React.FC = () => {
    const [weight, setWeight] = useState('70');
    const [goal, setGoal] = useState('maintenance');
    const protein = useMemo(() => {
        const w = parseFloat(weight);
        if(isNaN(w)) return '...';
        let multiplier = 1.2; // maintenance
        if (goal === 'loss') multiplier = 1.6;
        if (goal === 'gain') multiplier = 1.8;
        return `${(w * multiplier).toFixed(0)} g/day`;
    }, [weight, goal]);
    return (
        <CalculatorWrapper title="Protein Calculator">
             <div className="flex gap-2">
                <Input label="Weight" value={weight} onChange={e => setWeight(e.target.value)} type="number" unit="kg" />
                <select value={goal} onChange={e => setGoal(e.target.value)} className="p-2 border rounded dark:bg-slate-700 h-10 self-end">
                    <option value="maintenance">Maintenance</option>
                    <option value="loss">Fat Loss</option>
                    <option value="gain">Muscle Gain</option>
                </select>
            </div>
            <Result label="Daily Protein Intake" value={protein} />
        </CalculatorWrapper>
    );
};

const FatIntakeCalculator: React.FC = () => {
    const [calories, setCalories] = useState('2000');
    const fat = useMemo(() => {
        const c = parseFloat(calories);
        if(isNaN(c)) return '...';
        const fatCalories = c * 0.25; // 25% of total calories
        return `${(fatCalories / 9).toFixed(0)} g/day`;
    }, [calories]);
    return (
        <CalculatorWrapper title="Fat Intake Calculator">
            <Input label="Daily Calorie Goal" value={calories} onChange={e => setCalories(e.target.value)} type="number" unit="kcal" />
            <Result label="Daily Fat Intake (25% of calories)" value={fat} />
        </CalculatorWrapper>
    );
};

const GFRCalculator: React.FC = () => {
    const [creatinine, setCreatinine] = useState('1.0');
    const [age, setAge] = useState('40');
    const [gender, setGender] = useState('male');
    const [race, setRace] = useState('other');
    
    const gfr = useMemo(() => {
        const scr = parseFloat(creatinine);
        const a = parseInt(age);
        if(isNaN(scr) || isNaN(a) || scr <=0 || a <= 0) return '...';

        const k = gender === 'female' ? 0.7 : 0.9;
        const alpha = gender === 'female' ? -0.329 : -0.411;
        
        let gfrVal = 141 * Math.pow(Math.min(scr / k, 1), alpha) * Math.pow(Math.max(scr / k, 1), -1.209) * Math.pow(0.993, a);
        if (gender === 'female') gfrVal *= 1.018;
        if (race === 'black') gfrVal *= 1.159;
        
        return gfrVal.toFixed(0);
    }, [creatinine, age, gender, race]);

    return (
        <CalculatorWrapper title="GFR Calculator (CKD-EPI)" disclaimer="MEDICAL DISCLAIMER: This calculator is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.">
             <div className="grid grid-cols-2 gap-4">
                <Input label="Serum Creatinine" value={creatinine} onChange={e => setCreatinine(e.target.value)} type="number" unit="mg/dL" />
                <Input label="Age" value={age} onChange={e => setAge(e.target.value)} type="number" />
                <select value={gender} onChange={e => setGender(e.target.value as any)} className="p-2 border rounded dark:bg-slate-700 h-10">
                    <option value="male">Male</option><option value="female">Female</option>
                </select>
                <select value={race} onChange={e => setRace(e.target.value)} className="p-2 border rounded dark:bg-slate-700 h-10">
                    <option value="other">Non-Black</option><option value="black">Black</option>
                </select>
            </div>
            <Result label="Estimated GFR" value={gfr} unit="mL/min/1.73m²" />
        </CalculatorWrapper>
    );
};

const BodyTypeCalculator: React.FC = () => {
    const [frame, setFrame] = useState('medium');
    const [gain, setGain] = useState('proportionally');
    const type = useMemo(() => {
        if (frame === 'small' && gain === 'hard') return 'Ectomorph';
        if (frame === 'large' && gain === 'easy') return 'Endomorph';
        if (frame === 'medium' && gain === 'proportionally') return 'Mesomorph';
        if (frame === 'small' && gain === 'proportionally') return 'Ecto-Mesomorph';
        if (frame === 'large' && gain === 'proportionally') return 'Meso-Endomorph';
        return 'Combination Type';
    }, [frame, gain]);

    return (
        <CalculatorWrapper title="Body Type Calculator (Somatotype)">
             <div>
                <label className="block text-sm mb-1">How would you describe your body frame?</label>
                <select value={frame} onChange={e => setFrame(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700">
                    <option value="small">Thin, long limbs, small joints (e.g., wrists)</option>
                    <option value="medium">Athletic build, well-defined muscles</option>
                    <option value="large">Blocky, thick rib cage, wide joints</option>
                </select>
            </div>
            <div>
                <label className="block text-sm mb-1">How does your body respond to diet/exercise?</label>
                <select value={gain} onChange={e => setGain(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700">
                    <option value="hard">Hard to gain weight or muscle</option>
                    <option value="proportionally">Gain/lose weight and muscle proportionally</option>
                    <option value="easy">Gain fat and muscle easily, but hard to lose fat</option>
                </select>
            </div>
            <Result label="Likely Body Type" value={type} />
        </CalculatorWrapper>
    );
};

const BodySurfaceAreaCalculator: React.FC = () => {
    const [weight, setWeight] = useState('70');
    const [height, setHeight] = useState('175');
    const bsa = useMemo(() => {
        const w = parseFloat(weight);
        const h = parseFloat(height);
        if(isNaN(w) || isNaN(h) || w <=0 || h <= 0) return '...';
        return Math.sqrt((w * h) / 3600).toFixed(2);
    }, [weight, height]);
    return (
        <CalculatorWrapper title="Body Surface Area (BSA) Calculator" disclaimer="MEDICAL DISCLAIMER: For informational purposes only. Do not use for medical decisions.">
             <div className="flex gap-2">
                <Input label="Weight" value={weight} onChange={e => setWeight(e.target.value)} type="number" unit="kg" />
                <Input label="Height" value={height} onChange={e => setHeight(e.target.value)} type="number" unit="cm" />
            </div>
            <Result label="BSA (Mosteller Formula)" value={bsa} unit="m²" />
        </CalculatorWrapper>
    );
};


// --- LIST OF ALL CALCULATORS ---
const allCalculators: Calculator[] = [
    // Fitness
    { id: 'bmi', name: 'BMI Calculator', category: 'Fitness', component: BMICalculator },
    { id: 'calorie', name: 'Calorie Calculator', category: 'Fitness', component: () => <BMRCalorieTDEECalculator mode="Calorie" /> },
    { id: 'body-fat', name: 'Body Fat Calculator', category: 'Fitness', component: BodyFatCalculator },
    { id: 'bmr', name: 'BMR Calculator', category: 'Fitness', component: () => <BMRCalorieTDEECalculator mode="BMR" /> },
    { id: 'ideal-weight', name: 'Ideal Weight Calculator', category: 'Fitness', component: IdealWeightCalculator },
    { id: 'pace', name: 'Pace Calculator', category: 'Fitness', component: PaceCalculator },
    { id: 'army-body-fat', name: 'Army Body Fat Calculator', category: 'Fitness', component: ArmyBodyFatCalculator },
    { id: 'lean-body-mass', name: 'Lean Body Mass Calculator', category: 'Fitness', component: LeanBodyMassCalculator },
    { id: 'healthy-weight', name: 'Healthy Weight Calculator', category: 'Fitness', component: HealthyWeightCalculator },
    { id: 'calories-burned', name: 'Calories Burned Calculator', category: 'Fitness', component: CaloriesBurnedCalculator },
    { id: 'one-rep-max', name: 'One Rep Max Calculator', category: 'Fitness', component: OneRepMaxCalculator },
    { id: 'target-heart-rate', name: 'Target Heart Rate Calculator', category: 'Fitness', component: TargetHeartRateCalculator },
    // Pregnancy
    { id: 'pregnancy', name: 'Pregnancy Calculator', category: 'Pregnancy', component: () => <DueDateCalculator mode="Pregnancy" /> },
    { id: 'pregnancy-weight-gain', name: 'Pregnancy Weight Gain Calculator', category: 'Pregnancy', component: PregnancyWeightGainCalculator },
    { id: 'pregnancy-conception', name: 'Pregnancy Conception Calculator', category: 'Pregnancy', component: () => <DueDateCalculator mode="Conception" /> },
    { id: 'due-date', name: 'Due Date Calculator', category: 'Pregnancy', component: () => <DueDateCalculator mode="DueDate" /> },
    { id: 'ovulation', name: 'Ovulation Calculator', category: 'Pregnancy', component: OvulationCalculator },
    { id: 'conception', name: 'Conception Calculator', category: 'Pregnancy', component: ConceptionCalculatorFromDueDate },
    { id: 'period', name: 'Period Calculator', category: 'Pregnancy', component: PeriodCalculator },
    // Other Health
    { id: 'macro', name: 'Macro Calculator', category: 'Other Health', component: MacroCalculator },
    { id: 'carbohydrate', name: 'Carbohydrate Calculator', category: 'Other Health', component: CarbohydrateCalculator },
    { id: 'protein', name: 'Protein Calculator', category: 'Other Health', component: ProteinCalculator },
    { id: 'fat-intake', name: 'Fat Intake Calculator', category: 'Other Health', component: FatIntakeCalculator },
    { id: 'tdee', name: 'TDEE Calculator', category: 'Other Health', component: () => <BMRCalorieTDEECalculator mode="TDEE" /> },
    { id: 'gfr', name: 'GFR Calculator', category: 'Other Health', component: GFRCalculator },
    { id: 'body-type', name: 'Body Type Calculator', category: 'Other Health', component: BodyTypeCalculator },
    { id: 'body-surface-area', name: 'Body Surface Area Calculator', category: 'Other Health', component: BodySurfaceAreaCalculator },
    { id: 'bac', name: 'BAC Calculator', category: 'Other Health', component: BACCalculator },
];

// --- MAIN HUB COMPONENT ---
const HealthCalculators: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string>('bmi');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const categories = useMemo(() => {
        const categoryOrder = ['Fitness', 'Pregnancy', 'Other Health'];
        const grouped: { [key: string]: Calculator[] } = {};
        allCalculators.forEach(calc => {
            if (!grouped[calc.category]) grouped[calc.category] = [];
            grouped[calc.category].push(calc);
        });
        return categoryOrder.map(key => ({ name: key, calculators: grouped[key] }));
    }, []);

    const filteredCalculators = useMemo(() => 
        allCalculators.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())), 
    [searchTerm]);

    const SelectedComponent = useMemo(() => 
        allCalculators.find(c => c.id === selectedId)?.component || (() => <div>Not Found</div>),
    [selectedId]);
    
    const handleSelect = (id: string) => {
        setSelectedId(id);
        setIsSidebarOpen(false);
    };
    
     const SidebarContent = () => (
        <>
            <div className="p-4 border-b dark:border-slate-700">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search calculators..." className="w-full pl-9 p-2 border rounded-md text-sm dark:bg-slate-700 dark:border-slate-600"/>
                </div>
            </div>
            <nav className="p-2 flex-1 overflow-y-auto">
                {searchTerm ? (
                    <ul>
                        {filteredCalculators.map(c => (
                            <li key={c.id}><button onClick={() => handleSelect(c.id)} className={`w-full text-left flex items-center px-2 py-2 text-sm rounded-md group ${selectedId === c.id ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300' : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700'}`}>{c.name}</button></li>
                        ))}
                    </ul>
                ) : (
                    categories.map(cat => (
                        <div key={cat.name} className="mb-4">
                            <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">{cat.name}</h3>
                            <ul className="mt-1">
                                {cat.calculators.map(c => (
                                     <li key={c.id}><button onClick={() => handleSelect(c.id)} className={`w-full text-left flex items-center px-2 py-2 text-sm rounded-md group ${selectedId === c.id ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300' : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700'}`}>{c.name}</button></li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </nav>
        </>
    );

    const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>);
    const XIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);

    return (
        <div className="flex flex-col md:flex-row -m-6 lg:-m-10 h-full">
            <header className="lg:hidden flex items-center justify-between p-4 border-b dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
                <h2 className="text-lg font-bold">{allCalculators.find(c => c.id === selectedId)?.name || 'Calculators'}</h2>
                <button onClick={() => setIsSidebarOpen(true)} className="p-1"><MenuIcon className="w-6 h-6" /></button>
            </header>
            
            <div className="flex flex-1 overflow-hidden">
                <aside className="w-72 bg-white border-r border-slate-200 flex-shrink-0 flex-col dark:bg-slate-800 dark:border-slate-700 hidden lg:flex"><SidebarContent /></aside>
                <div className={`lg:hidden fixed inset-0 z-40 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <aside className="w-72 bg-white h-full flex flex-col dark:bg-slate-800 border-r dark:border-slate-700">
                        <div className="p-4 flex justify-between items-center border-b dark:border-slate-700 flex-shrink-0">
                            <h3 className="font-bold">Select Calculator</h3>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-1"><XIcon className="w-6 h-6" /></button>
                        </div>
                        <SidebarContent />
                    </aside>
                </div>
                {isSidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setIsSidebarOpen(false)}></div>}

                <main className="flex-1 p-6 lg:p-10 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                    <SelectedComponent />
                </main>
            </div>
        </div>
    );
};

export default HealthCalculators;