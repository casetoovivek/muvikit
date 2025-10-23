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

      if (!isNaN(credits) && credits > 0 && points !== undefined) {
        totalPoints += points * credits;
        totalCredits += credits;
      } else if (course.credits.trim() !== '' && (isNaN(credits) || credits <= 0)) {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Free GPA Calculator for College & School</h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-slate-400">Easily calculate your Grade Point Average (GPA) to track your academic performance. Enter your courses, credits, and grades for an instant result.</p>
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
                    placeholder={`Course ${index + 1} (Optional)`}
                    value={course.name}
                    onChange={(e) => handleCourseChange(course.id, 'name', e.target.value)}
                    className="sm:col-span-6 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                  />
                  <input
                    type="number"
                    placeholder="Credits"
                    value={course.credits}
                    min="0"
                    onChange={(e) => handleCourseChange(course.id, 'credits', e.target.value)}
                    className={`sm:col-span-2 block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 ${isInvalid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] dark:border-slate-600'}`}
                  />
                  <select
                    value={course.grade}
                    onChange={(e) => handleCourseChange(course.id, 'grade', e.target.value)}
                    className="sm:col-span-2 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
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
            + Add Another Course
          </button>
        </div>
        <div className="flex-shrink-0 lg:w-56 mt-6 lg:mt-0">
          <div className="bg-[var(--theme-primary-light)] p-6 rounded-lg text-center border border-sky-200 dark:bg-slate-800 dark:border-sky-900">
            <h3 className="text-lg font-semibold text-[var(--theme-primary)] dark:text-sky-300">Your GPA</h3>
            <p className="text-5xl font-bold text-[var(--theme-primary)] mt-2 dark:text-[var(--theme-text-gold)]">{gpa.toFixed(3)}</p>
          </div>
        </div>
      </div>
       <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6 max-w-4xl mx-auto">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is a GPA Calculator?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">A GPA (Grade Point Average) Calculator is a tool used by students to calculate their academic performance. It works by taking the grades you've earned in your courses and the number of credits each course is worth. By converting letter grades (like A, B, C) into a numerical scale (typically 0.0 to 4.0), it computes a weighted average that reflects your overall academic standing. This is crucial for college applications, scholarships, and monitoring your progress throughout a semester or your entire academic career.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This GPA Calculator</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Enter Course Details:</strong> For each course, enter the number of credits (or hours) it's worth.</li>
            <li><strong>Select Your Grade:</strong> Use the dropdown menu to select the letter grade you received for that course.</li>
            <li><strong>Add More Courses:</strong> Click the "+ Add Another Course" button to add as many rows as you need for all your subjects.</li>
            <li><strong>View Your GPA:</strong> The calculator will automatically update your GPA in real-time in the box on the right.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Using This Tool</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Instant Calculation:</strong> Get your accurate GPA calculated immediately as you enter your grades.</li>
            <li><strong>Supports Standard Grading:</strong> Uses a standard 4.0 grading scale with plus (+) and minus (-) grades.</li>
            <li><strong>Plan for the Future:</strong> Experiment with potential future grades to see how they will impact your overall GPA.</li>
            <li><strong>Simple and Free:</strong> An easy-to-use interface that is completely free and requires no sign-up.</li>
          </ul>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Related Tools</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
                To help with your studies, try our <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">Pomodoro Timer</a> for focus or the <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">Student Routine Maker</a> to plan your week.
            </p>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">How is GPA calculated?</h3>
                <p>GPA is calculated by multiplying the grade point for each course by its number of credits to get "quality points." The total quality points are then divided by the total number of credits.</p>
              </div>
              <div>
                <h3 className="font-semibold">What is the difference between weighted and unweighted GPA?</h3>
                <p>This calculator computes an unweighted GPA on a 4.0 scale. A weighted GPA gives extra points for more challenging courses like AP or Honors, often on a 5.0 scale. Our calculator is best for standard college and high school courses.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default GpaCalculator;