import React, { useState, useMemo } from 'react';
import { TrashIcon } from '../components/icons';

interface Course {
  id: number;
  name: string;
  credits: string;
  grade: string;
}

const gradePoints: { [key: string]: number } = {
  'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0,
};

const GpaCalculator: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: '', credits: '', grade: 'A' },
  ]);
  const [nextId, setNextId] = useState(2);

  const { gpa, invalidCourseIds } = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    const invalidIds = new Set<number>();

    courses.forEach(course => {
      const credits = parseFloat(course.credits);
      const points = gradePoints[course.grade];

      // A course is only considered for calculation if credits are a positive number
      if (!isNaN(credits) && credits > 0 && points !== undefined) {
        totalPoints += points * credits;
        totalCredits += credits;
      } else if (course.credits.trim() !== '' && (isNaN(credits) || credits <= 0)) {
        // Mark as invalid if the input is not empty but is not a positive number
        invalidIds.add(course.id);
      }
    });
    
    const calculatedGpa = totalCredits === 0 ? 0 : totalPoints / totalCredits;
    return { gpa: calculatedGpa, invalidCourseIds: invalidIds };
  }, [courses]);

  const handleCourseChange = (id: number, field: keyof Omit<Course, 'id'>, value: string) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addCourse = () => {
    setCourses([...courses, { id: nextId, name: '', credits: '', grade: 'A' }]);
    setNextId(nextId + 1);
  };

  const removeCourse = (id: number) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">GPA Calculator</h2>
        <p className="mt-1 text-md text-gray-600 dark:text-slate-400">Add your courses to calculate your Grade Point Average.</p>
      </div>

      <div className="lg:flex lg:gap-8">
        <div className="flex-grow">
          <div className="space-y-4">
            {courses.map((course, index) => {
              const isInvalid = invalidCourseIds.has(course.id);
              return (
                <div key={course.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 border border-gray-200 rounded-lg bg-white items-center dark:bg-slate-800 dark:border-slate-700">
                  <input
                    type="text"
                    placeholder={`Course ${index + 1}`}
                    value={course.name}
                    onChange={(e) => handleCourseChange(course.id, 'name', e.target.value)}
                    className="sm:col-span-6 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                  />
                  <input
                    type="number"
                    placeholder="Credits"
                    value={course.credits}
                    min="0"
                    onChange={(e) => handleCourseChange(course.id, 'credits', e.target.value)}
                    className={`sm:col-span-2 block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 ${isInvalid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] dark:border-slate-600'}`}
                  />
                  <select
                    value={course.grade}
                    onChange={(e) => handleCourseChange(course.id, 'grade', e.target.value)}
                    className="sm:col-span-2 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    {Object.keys(gradePoints).map(grade => <option key={grade} value={grade}>{grade}</option>)}
                  </select>
                  <button onClick={() => removeCourse(course.id)} className="sm:col-span-2 flex justify-center items-center h-10 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900/80">
                    <TrashIcon className="w-5 h-5"/>
                  </button>
                </div>
              )
            })}
          </div>
          <button onClick={addCourse} className="mt-4 px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors">
            Add Course
          </button>
        </div>
        <div className="flex-shrink-0 lg:w-56 mt-6 lg:mt-0">
          <div className="bg-[var(--theme-primary-light)] p-6 rounded-lg text-center border border-sky-200 dark:bg-slate-800 dark:border-sky-900">
            <h3 className="text-lg font-semibold text-[var(--theme-primary)] dark:text-sky-300">Your GPA</h3>
            <p className="text-5xl font-bold text-[var(--theme-primary)] mt-2 dark:text-[var(--theme-text-gold)]">{gpa.toFixed(3)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GpaCalculator;