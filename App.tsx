import React, { useState, useEffect } from 'react';

import { Tool } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
// FIX: Corrected import path for Dashboard
import Dashboard from './pages/Dashboard';

import { 
    TextIcon, ImageIcon, DevIcon, FinanceIcon, OtherIcon, PdfIcon, WriteIcon, ConvertIcon,
    AnalyzeIcon, ShippingIcon, InventoryIcon, AnalyticsIcon, KeywordIcon, TraderIcon,
    DomainIcon,
    ChartIcon,
    WhatsAppIcon,
    CouponIcon,
    StudentIcon
// FIX: Corrected import path for icons
} from './components/icons';

// Import all tools
import ImageCropper from './tools/ImageCropper';
import TextAnalyzer from './tools/TextAnalyzer';
import CaseConverter from './tools/CaseConverter';
import DiscountCalculator from './tools/DiscountCalculator';
import GpaCalculator from './tools/GpaCalculator';
import LoremIpsumGenerator from './tools/LoremIpsumGenerator';
import PasswordGenerator from './tools/PasswordGenerator';
import PercentageCalculator from './tools/PercentageCalculator';
import PomodoroTimer from './tools/PomodoroTimer';
import QrCodeGenerator from './tools/QrCodeGenerator';
import RandomNumberGenerator from './tools/RandomNumberGenerator';
import UnitConverter from './tools/UnitConverter';
import ToDoList from './tools/ToDoList';
import NotesTaker from './tools/NotesTaker';
import PlagiarismChecker from './tools/PlagiarismChecker';
import ImageConverter from './tools/ImageConverter';
import ImageResizer from './tools/ImageResizer';
import ColorPicker from './tools/ColorPicker';
import LoanCalculator from './tools/LoanCalculator';
import UrlShortener from './tools/UrlShortener';
import JsonFormatter from './tools/JsonFormatter';
import InvoiceGenerator from './tools/InvoiceGenerator';
import StockScanner from './tools/StockScanner';
import ProfitLossCalculator from './tools/ProfitLossCalculator';
import AverageStockPriceCalculator from './tools/AverageStockPriceCalculator';
import RiskRewardCalculator from './tools/RiskRewardCalculator';
import PositionSizeCalculator from './tools/PositionSizeCalculator';
import DomainChecker from './tools/DomainChecker';

// New PDF Tools
import MergePdf from './tools/MergePdf';
import SplitPdf from './tools/SplitPdf';
import CompressPdf from './tools/CompressPdf';
import ProtectPdf from './tools/ProtectPdf';
import UnlockPdf from './tools/UnlockPdf';
import RotatePdf from './tools/RotatePdf';
import ESignPdf from './tools/ESignPdf';
import AddPageNumbersToPdf from './tools/AddPageNumbersToPdf';
import PdfCreator from './tools/PdfCreator';
import PdfToWord from './tools/PdfToWord';
import PdfToText from './tools/PdfToText';
import PdfToJpg from './tools/PdfToJpg';
import ImageToPdf from './tools/ImageToPdf';
import ExtractImagesFromPdf from './tools/ExtractImagesFromPdf';

// New Image Tools
import RemoveBackground from './tools/RemoveBackground';
import AiImageGenerator from './tools/AiImageGenerator';
import UpscaleImage from './tools/UpscaleImage';
import RemoveWatermark from './tools/RemoveWatermark';
import RemoveObjectsFromPhoto from './tools/RemoveObjectsFromPhoto';
import ImageToText from './tools/ImageToText';
import CompressImage from './tools/CompressImage';
import MergeImages from './tools/MergeImages';

// New AI Writing Tools
import EssayWriter from './tools/EssayWriter';
import ContentImprover from './tools/ContentImprover';
import ParagraphWriter from './tools/ParagraphWriter';
import GrammarFixer from './tools/GrammarFixer';
import ListicleWriter from './tools/ListicleWriter';
import BlogIdeas from './tools/BlogIdeas';
import HeadlineGenerator from './tools/HeadlineGenerator';
import InstagramCaptionGenerator from './tools/InstagramCaptionGenerator';
import LinkedInPostGenerator from './tools/LinkedInPostGenerator';
import TwitterGenerator from './tools/TwitterGenerator';
import RealEstateDescriptionGenerator from './tools/RealEstateDescriptionGenerator';
import BusinessNameGenerator from './tools/BusinessNameGenerator';
import PressReleaseWriter from './tools/PressReleaseWriter';
import ColdEmailWriter from './tools/ColdEmailWriter';
import YouTubeScriptWriter from './tools/YouTubeScriptWriter';

// New File Conversion Tools
import WordToPdf from './tools/WordToPdf';
import ExcelToPdf from './tools/ExcelToPdf';
import PowerPointToPdf from './tools/PowerPointToPdf';
import UniversalFileAnalyzer from './tools/UniversalFileAnalyzer';

// New E-commerce Tools
import EcommerceLabelCropper from './tools/EcommerceLabelCropper';
import InventoryOrderManagement from './tools/InventoryOrderManagement';
import GoogleAnalyticsDashboard from './tools/GoogleAnalyticsDashboard';
import KeywordResearchTool from './tools/KeywordResearchTool';
import WhatsAppMarketingSuite from './tools/WhatsAppMarketingSuite';

// New Pro Trader Tools
import ProTradingJournal from './tools/ProTradingJournal';
import AiChartAnalyst from './tools/AiChartAnalyst';

// Adblocker Modal
import AdblockerModal from './components/AdblockerModal';
import CouponFinder from './tools/CouponFinder';
import StudentRoutineMaker from './tools/StudentRoutineMaker';


// --- Tool Navigation Component ---
interface ToolNavigationProps {
  onPrevClick: () => void;
  onNextClick: () => void;
  prevToolName: string;
  nextToolName: string;
}

const ToolNavigation: React.FC<ToolNavigationProps> = ({ onPrevClick, onNextClick, prevToolName, nextToolName }) => {
  return (
    <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
      <button
        onClick={onPrevClick}
        className="text-left group max-w-[45%] p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label={`Go to previous tool: ${prevToolName}`}
      >
        <span className="text-sm text-slate-500 dark:text-slate-400">Previous Tool</span>
        <div className="flex items-center gap-2 text-md lg:text-lg font-semibold text-slate-700 group-hover:text-[var(--theme-primary)] dark:text-slate-200 dark:group-hover:text-sky-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="truncate">{prevToolName}</span>
        </div>
      </button>
      <button
        onClick={onNextClick}
        className="text-right group max-w-[45%] p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label={`Go to next tool: ${nextToolName}`}
      >
        <span className="text-sm text-slate-500 dark:text-slate-400">Next Tool</span>
        <div className="flex items-center gap-2 text-md lg:text-lg font-semibold text-slate-700 group-hover:text-[var(--theme-primary)] dark:text-slate-200 dark:group-hover:text-sky-300">
          <span className="truncate">{nextToolName}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </div>
      </button>
    </div>
  );
};


const tools: Tool[] = [
    // The Pro Trader Tools
    { id: 'pro-trading-journal', name: 'Pro Trading Journal', description: 'A comprehensive journal to log, review, and analyze your trades.', icon: <TraderIcon />, component: ProTradingJournal, category: 'The Pro Trader' },
    { id: 'stock-scanner', name: 'Stock Screener', description: 'AI-powered fundamental analysis of any stock, index or forex pair.', icon: <FinanceIcon />, component: StockScanner, category: 'The Pro Trader' },
    { id: 'ai-chart-analyst', name: 'AI Chart Analyst', description: 'Upload any chart image for AI-powered technical analysis and insights.', icon: <ChartIcon />, component: AiChartAnalyst, category: 'The Pro Trader' },
    { id: 'profit-loss-calculator', name: 'Profit/Loss Calculator', description: 'Calculate trade profit or loss.', icon: <FinanceIcon />, component: ProfitLossCalculator, category: 'The Pro Trader' },
    { id: 'avg-stock-price-calculator', name: 'Avg. Stock Price Calculator', description: 'Calculate average share price.', icon: <FinanceIcon />, component: AverageStockPriceCalculator, category: 'The Pro Trader' },
    { id: 'risk-reward-calculator', name: 'Risk/Reward Calculator', description: 'Determine trade risk vs. reward.', icon: <FinanceIcon />, component: RiskRewardCalculator, category: 'The Pro Trader' },
    { id: 'position-size-calculator', name: 'Position Size Calculator', description: 'Calculate shares to buy based on risk.', icon: <FinanceIcon />, component: PositionSizeCalculator, category: 'The Pro Trader' },
    
    // E-commerce Tools
    { id: 'whatsapp-marketing-suite', name: 'WhatsApp Marketing Suite', description: 'Automate campaigns, abandoned carts, and manage chats.', icon: <WhatsAppIcon />, component: WhatsAppMarketingSuite, category: 'E-commerce Tools' },
    { id: 'google-analytics-dashboard', name: 'Google Trends Explorer', description: 'Explore real-time Google search trends for any keyword.', icon: <AnalyticsIcon />, component: GoogleAnalyticsDashboard, category: 'E-commerce Tools' },
    { id: 'keyword-research-tool', name: 'AI Keyword Research Tool', description: 'Discover keywords with search volume and sales potential.', icon: <KeywordIcon />, component: KeywordResearchTool, category: 'E-commerce Tools' },
    { id: 'ecommerce-label-cropper', name: 'E.com Seller Label Cropper', description: 'Crop and merge shipping labels for various marketplaces.', icon: <ShippingIcon />, component: EcommerceLabelCropper, category: 'E-commerce Tools' },
    { id: 'inventory-order-management', name: 'Inventory & Order Management', description: 'Track products, manage orders, and export reports.', icon: <InventoryIcon />, component: InventoryOrderManagement, category: 'E-commerce Tools' },

    // Student Tools
    { id: 'student-routine-maker', name: 'Student Routine Maker', description: 'Plan, track, and optimize your study schedule with AI suggestions.', icon: <StudentIcon />, component: StudentRoutineMaker, category: 'Student Tools' },
    { id: 'gpa-calculator', name: 'GPA Calculator', description: 'Calculate your Grade Point Average.', icon: <OtherIcon />, component: GpaCalculator, category: 'Student Tools' },
    { id: 'pomodoro-timer', name: 'Pomodoro Timer', description: 'Boost focus with a Pomodoro timer.', icon: <OtherIcon />, component: PomodoroTimer, category: 'Student Tools' },
    
    // Text Tools
    { id: 'text-analyzer', name: 'Text Analyzer', description: 'Count words, characters, sentences.', icon: <TextIcon />, component: TextAnalyzer, category: 'Text' },
    { id: 'case-converter', name: 'Case Converter', description: 'Change text case to upper, lower, etc.', icon: <TextIcon />, component: CaseConverter, category: 'Text' },
    { id: 'lorem-ipsum', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text.', icon: <TextIcon />, component: LoremIpsumGenerator, category: 'Text' },
    { id: 'notes-taker', name: 'Notes Taker', description: 'A simple notepad with auto-save.', icon: <TextIcon />, component: NotesTaker, category: 'Text' },
    { id: 'plagiarism-checker', name: 'Plagiarism Checker', description: 'Check text for plagiarism with AI.', icon: <TextIcon />, component: PlagiarismChecker, category: 'Text' },
    
    // Image Tools
    { id: 'image-cropper', name: 'Image Cropper', description: 'Crop images to your desired size.', icon: <ImageIcon />, component: ImageCropper, category: 'Image' },
    { id: 'image-converter', name: 'Image Converter', description: 'Convert images to different formats.', icon: <ImageIcon />, component: ImageConverter, category: 'Image' },
    { id: 'image-resizer', name: 'Image Resizer', description: 'Resize images to specific dimensions.', icon: <ImageIcon />, component: ImageResizer, category: 'Image' },
    { id: 'qr-code-generator', name: 'QR Code Generator', description: 'Create QR codes from text or URLs.', icon: <ImageIcon />, component: QrCodeGenerator, category: 'Image' },
    { id: 'color-picker', name: 'Color Picker', description: 'Pick colors and get HEX/RGB/HSL codes.', icon: <ImageIcon />, component: ColorPicker, category: 'Image' },
    { id: 'remove-background', name: 'Remove Background', description: 'Automatically remove the background from an image.', icon: <ImageIcon />, component: RemoveBackground, category: 'Image' },
    { id: 'ai-image-generator', name: 'AI Image Generator', description: 'Create unique images from text prompts.', icon: <ImageIcon />, component: AiImageGenerator, category: 'Image' },
    { id: 'upscale-image', name: 'Upscale Image', description: 'Increase image resolution without losing quality.', icon: <ImageIcon />, component: UpscaleImage, category: 'Image' },
    { id: 'remove-watermark', name: 'Remove Watermark', description: 'Remove watermarks or unwanted logos from images.', icon: <ImageIcon />, component: RemoveWatermark, category: 'Image' },
    { id: 'remove-objects', name: 'Remove Objects from Photo', description: 'Erase unwanted objects or people from photos.', icon: <ImageIcon />, component: RemoveObjectsFromPhoto, category: 'Image' },
    { id: 'image-to-text', name: 'Image to Text (OCR)', description: 'Extract text from an image.', icon: <ImageIcon />, component: ImageToText, category: 'Image' },
    { id: 'compress-image', name: 'Compress Image', description: 'Reduce image file size while maintaining quality.', icon: <ImageIcon />, component: CompressImage, category: 'Image' },
    { id: 'merge-images', name: 'Merge Images', description: 'Combine multiple images into a single file.', icon: <ImageIcon />, component: MergeImages, category: 'Image' },

    // Developer Tools
    { id: 'domain-checker', name: 'Domain Checker', description: 'Check domain availability and get WHOIS data.', icon: <DomainIcon />, component: DomainChecker, category: 'Developer' },
    { id: 'coupon-finder', name: 'Domain & Hosting Coupons', description: 'Find the latest discount codes for domain registrars and web hosts.', icon: <CouponIcon />, component: CouponFinder, category: 'Developer' },
    { id: 'json-formatter', name: 'JSON Formatter', description: 'Beautify and validate JSON data.', icon: <DevIcon />, component: JsonFormatter, category: 'Developer' },
    { id: 'url-shortener', name: 'URL Shortener', description: 'Create short links for easy sharing.', icon: <DevIcon />, component: UrlShortener, category: 'Developer' },
    { id: 'password-generator', name: 'Password Generator', description: 'Create secure, random passwords.', icon: <DevIcon />, component: PasswordGenerator, category: 'Developer' },
    
    // Finance & Business Tools
    { id: 'discount-calculator', name: 'Discount Calculator', description: 'Calculate final price after discount.', icon: <FinanceIcon />, component: DiscountCalculator, category: 'Finance & Business' },
    { id: 'loan-calculator', name: 'Loan Calculator', description: 'Estimate your monthly loan payments.', icon: <FinanceIcon />, component: LoanCalculator, category: 'Finance & Business' },
    { id: 'invoice-generator', name: 'Invoice Generator', description: 'Create professional invoices with your logo, tax, discounts, and export to PDF.', icon: <FinanceIcon />, component: InvoiceGenerator, category: 'Finance & Business' },

    // PDF Tools
    { id: 'merge-pdf', name: 'Merge PDF', description: 'Combine multiple PDF files into one.', icon: <PdfIcon />, component: MergePdf, category: 'PDF Tools' },
    { id: 'split-pdf', name: 'Split PDF', description: 'Extract pages from a PDF file.', icon: <PdfIcon />, component: SplitPdf, category: 'PDF Tools' },
    { id: 'compress-pdf', name: 'Compress PDF', description: 'Reduce the file size of your PDF.', icon: <PdfIcon />, component: CompressPdf, category: 'PDF Tools' },
    { id: 'protect-pdf', name: 'Protect PDF', description: 'Add a password to your PDF file.', icon: <PdfIcon />, component: ProtectPdf, category: 'PDF Tools' },
    { id: 'unlock-pdf', name: 'Unlock PDF', description: 'Remove password protection from a PDF.', icon: <PdfIcon />, component: UnlockPdf, category: 'PDF Tools' },
    { id: 'rotate-pdf', name: 'Rotate PDF', description: 'Rotate pages in a PDF file.', icon: <PdfIcon />, component: RotatePdf, category: 'PDF Tools' },
    { id: 'esign-pdf', name: 'eSign PDF', description: 'Sign your PDF documents electronically.', icon: <PdfIcon />, component: ESignPdf, category: 'PDF Tools' },
    { id: 'add-page-numbers', name: 'Add Page Numbers to PDF', description: 'Insert page numbers into your PDF.', icon: <PdfIcon />, component: AddPageNumbersToPdf, category: 'PDF Tools' },
    { id: 'pdf-creator', name: 'PDF Creator', description: 'Create a PDF document from scratch.', icon: <PdfIcon />, component: PdfCreator, category: 'PDF Tools' },
    { id: 'pdf-to-word', name: 'PDF to Word', description: 'Convert your PDF files to editable Word documents.', icon: <PdfIcon />, component: PdfToWord, category: 'PDF Tools' },
    { id: 'pdf-to-text', name: 'PDF to Text/OCR', description: 'Extract text from a PDF using OCR.', icon: <PdfIcon />, component: PdfToText, category: 'PDF Tools' },
    { id: 'pdf-to-jpg', name: 'PDF to JPG', description: 'Convert pages of a PDF to JPG images.', icon: <PdfIcon />, component: PdfToJpg, category: 'PDF Tools' },
    { id: 'image-to-pdf', name: 'Image to PDF', description: 'Convert JPG, PNG, and other images to PDF.', icon: <PdfIcon />, component: ImageToPdf, category: 'PDF Tools' },
    { id: 'extract-images-from-pdf', name: 'Extract Images from PDF', description: 'Extract all images contained in a PDF file.', icon: <PdfIcon />, component: ExtractImagesFromPdf, category: 'PDF Tools' },

    // AI Writing Tools
    { id: 'essay-writer', name: 'Essay Writer', description: 'Generate high-quality essays on any topic.', icon: <WriteIcon />, component: EssayWriter, category: 'AI Writing Tools' },
    { id: 'content-improver', name: 'Content Improver', description: 'Rephrase and enhance your existing content.', icon: <WriteIcon />, component: ContentImprover, category: 'AI Writing Tools' },
    { id: 'paragraph-writer', name: 'Paragraph Writer', description: 'Generate a well-structured paragraph on a topic.', icon: <WriteIcon />, component: ParagraphWriter, category: 'AI Writing Tools' },
    { id: 'grammar-fixer', name: 'Grammar Fixer', description: 'Correct grammar and spelling mistakes.', icon: <WriteIcon />, component: GrammarFixer, category: 'AI Writing Tools' },
    { id: 'listicle-writer', name: 'Listicle Writer', description: 'Create engaging list-based articles.', icon: <WriteIcon />, component: ListicleWriter, category: 'AI Writing Tools' },
    { id: 'blog-ideas', name: 'Blog Post Ideas', description: 'Generate creative ideas for your next blog post.', icon: <WriteIcon />, component: BlogIdeas, category: 'AI Writing Tools' },
    { id: 'headline-generator', name: 'Headline Generator', description: 'Create catchy headlines for your content.', icon: <WriteIcon />, component: HeadlineGenerator, category: 'AI Writing Tools' },
    { id: 'instagram-captions', name: 'Instagram Caption Generator', description: 'Generate engaging captions for your photos.', icon: <WriteIcon />, component: InstagramCaptionGenerator, category: 'AI Writing Tools' },
    { id: 'linkedin-posts', name: 'LinkedIn Post Generator', description: 'Craft professional posts for your LinkedIn profile.', icon: <WriteIcon />, component: LinkedInPostGenerator, category: 'AI Writing Tools' },
    { id: 'twitter-generator', name: 'Tweet Generator', description: 'Generate tweets and thread ideas.', icon: <WriteIcon />, component: TwitterGenerator, category: 'AI Writing Tools' },
    { id: 'real-estate-descriptions', name: 'Real Estate Description', description: 'Write compelling property descriptions.', icon: <WriteIcon />, component: RealEstateDescriptionGenerator, category: 'AI Writing Tools' },
    { id: 'business-names', name: 'Business Name Generator', description: 'Generate creative names for your business.', icon: <WriteIcon />, component: BusinessNameGenerator, category: 'AI Writing Tools' },
    { id: 'press-release-writer', name: 'Press Release Writer', description: 'Generate professional press releases.', icon: <WriteIcon />, component: PressReleaseWriter, category: 'AI Writing Tools' },
    { id: 'cold-email-writer', name: 'Cold Email Writer', description: 'Craft effective cold emails for outreach.', icon: <WriteIcon />, component: ColdEmailWriter, category: 'AI Writing Tools' },
    { id: 'youtube-script-writer', name: 'YouTube Script Writer', description: 'Create engaging scripts for your videos.', icon: <WriteIcon />, component: YouTubeScriptWriter, category: 'AI Writing Tools' },

    // File Conversion Tools
    { id: 'word-to-pdf', name: 'Word to PDF', description: 'Convert Word documents (.doc, .docx) to PDF.', icon: <ConvertIcon />, component: WordToPdf, category: 'File Conversion' },
    { id: 'excel-to-pdf', name: 'Excel to PDF', description: 'Convert Excel spreadsheets (.xls, .xlsx) to PDF.', icon: <ConvertIcon />, component: ExcelToPdf, category: 'File Conversion' },
    { id: 'powerpoint-to-pdf', name: 'PowerPoint to PDF', description: 'Convert PowerPoint presentations (.ppt, .pptx) to PDF.', icon: <ConvertIcon />, component: PowerPointToPdf, category: 'File Conversion' },

    // Other Tools
    { id: 'percentage-calculator', name: 'Percentage Calculator', description: 'Quickly calculate percentages.', icon: <OtherIcon />, component: PercentageCalculator, category: 'Other' },
    { id: 'random-number-generator', name: 'Random Number Generator', description: 'Generate a random number in a range.', icon: <OtherIcon />, component: RandomNumberGenerator, category: 'Other' },
    { id: 'unit-converter', name: 'Unit Converter', description: 'Convert between different units.', icon: <OtherIcon />, component: UnitConverter, category: 'Other' },
    { id: 'todo-list', name: 'To-Do List', description: 'A simple to-do list to stay organized.', icon: <OtherIcon />, component: ToDoList, category: 'Other' },
    { id: 'universal-file-analyzer', name: 'Universal File Analyzer', description: 'Analyze any document (PDF, image) to get a structured summary.', icon: <AnalyzeIcon />, component: UniversalFileAnalyzer, category: 'Other' },
];

function App() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [adblockerDetected, setAdblockerDetected] = useState(false);

  useEffect(() => {
    const handleDetection = () => {
      setAdblockerDetected(true);
    };
    window.addEventListener('adblock-detected', handleDetection);
    return () => {
      window.removeEventListener('adblock-detected', handleDetection);
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSelectTool = (tool: Tool) => {
    setSelectedTool(tool);
  };

  const handleGoHome = () => {
    setSelectedTool(null);
  };

  const handleNextTool = () => {
    if (!selectedTool) return;
    const currentIndex = tools.findIndex(t => t.id === selectedTool.id);
    const nextIndex = (currentIndex + 1) % tools.length;
    setSelectedTool(tools[nextIndex]);
  };

  const handlePrevTool = () => {
    if (!selectedTool) return;
    const currentIndex = tools.findIndex(t => t.id === selectedTool.id);
    const prevIndex = (currentIndex - 1 + tools.length) % tools.length;
    setSelectedTool(tools[prevIndex]);
  };

  const currentToolIndex = selectedTool ? tools.findIndex(t => t.id === selectedTool.id) : -1;
  const prevTool = currentToolIndex !== -1 ? tools[(currentToolIndex - 1 + tools.length) % tools.length] : null;
  const nextTool = currentToolIndex !== -1 ? tools[(currentToolIndex + 1) % tools.length] : null;

  const CurrentTool = selectedTool?.component;

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-50 dark:bg-slate-900">
      {adblockerDetected && <AdblockerModal />}
      <Header onLogoClick={handleGoHome} theme={theme} toggleTheme={toggleTheme} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar tools={tools} selectedTool={selectedTool} onSelectTool={handleSelectTool} />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {CurrentTool ? (
            <div>
              <CurrentTool />
              {prevTool && nextTool && (
                <ToolNavigation
                  onPrevClick={handlePrevTool}
                  onNextClick={handleNextTool}
                  prevToolName={prevTool.name}
                  nextToolName={nextTool.name}
                />
              )}
            </div>
          ) : (
            <Dashboard tools={tools} onSelectTool={handleSelectTool} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;