import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">About Muvikit Technologies</h1>
        <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">Your All-in-One Platform for Free, Smart, and Powerful Digital Tools.</p>
      </div>
      <div className="bg-white p-8 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6 max-w-4xl mx-auto text-slate-600 dark:text-slate-300 leading-relaxed">
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Our Mission</h2>
            <p className="mt-2">
            At Muvikit, our mission is to empower everyone—from students and creators to traders and small business owners—by providing professional-grade digital tools that are accessible, easy to use, and completely free. We believe that powerful technology should not be locked behind expensive subscriptions. We are committed to building a comprehensive suite of utilities that simplify complex tasks, boost productivity, and unlock new possibilities for our users.
            </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 pt-4">What We Offer</h2>
          <p className="mt-2">Muvikit is home to a rapidly growing collection of over 150 tools designed to meet the diverse needs of a digital world. Our platform is organized into intuitive categories to help you find exactly what you need, when you need it:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>For Traders & Investors:</strong> Dive deep into the markets with our AI Stock Screener, Advanced Trader Journal, real-time Economic Calendar, and a full suite of over 60 Financial Calculators.</li>
            <li><strong>For E-commerce Sellers:</strong> Optimize your business with the WhatsApp Marketing Suite, AI Keyword Research Tool, E-commerce Profitability Calculator, and specialized label croppers.</li>
            <li><strong>For Students & Academics:</strong> Enhance your learning with the AI Student Routine Maker, GPA Calculator, AI Essay Writer, and a powerful Plagiarism Checker.</li>
            <li><strong>For Developers & Designers:</strong> Streamline your workflow with our JSON Formatter, URL Shortener, Color Picker, and Domain Availability Checker.</li>
            <li><strong>For Content Creators:</strong> Spark creativity with our AI Image Generator, Background Remover, YouTube Script Writer, and various social media content generators.</li>
            <li><strong>For Everyday Tasks:</strong> Handle any document with our comprehensive PDF and file conversion tools, manage tasks with the Productivity Hub, and so much more.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 pt-4">Our Vision for the Future</h2>
          <p className="mt-2">
          We are constantly innovating and expanding our toolkit. Our vision is to make Muvikit the ultimate destination for anyone looking to accomplish a digital task, big or small. By integrating the latest AI technologies and focusing on a clean, user-centric design, we are building a platform that is not only powerful but also a joy to use. We are driven by the success of our users and are always listening to feedback to build the tools you need most.
          </p>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 pt-4">Meet Our Founders</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center md:text-left">
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Vivek Kumar Sah</h3>
                    <p className="text-sm font-medium text-[var(--theme-primary)] dark:text-sky-400">Founder & Visionary</p>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                        Vivek Kumar Sah is the visionary behind Muvikit.com, driving the overall direction and strategic development of the platform's extensive tool collection.
                    </p>
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Mukul Kumar Sah (Big Brother)</h3>
                    <p className="text-sm font-medium text-[var(--theme-primary)] dark:text-sky-400">Co-Founder & Technical Lead</p>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                        Mukul Kumar Sah serves as the Co-Founder and technical lead, ensuring all Muvikit tools are built for optimal performance, speed, and user experience.
                    </p>
                </div>
            </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 pt-4">Get in Touch</h2>
          <p className="mt-2">We love hearing from our users! Whether you have a suggestion for a new tool, feedback on an existing one, or a business inquiry, please don't hesitate to reach out.</p>
          <div className="mt-3 space-y-1">
              <p><strong>Email:</strong> <a href="mailto:MuvikitTechnologies@gmail.com" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">MuvikitTechnologies@gmail.com</a></p>
              <p><strong>Website:</strong> <a href="https://www.muvikit.com" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">www.muvikit.com</a></p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
