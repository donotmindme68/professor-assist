import { BookOpen, Users, Brain, ArrowRight, LayoutDashboard, LogIn } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import {getUser} from "@/utils";
import {useNavigate} from "react-router-dom";

export default function WelcomePage() {
  const user = getUser();

  const navigateTo = useNavigate()

  const handleNavigation = (path: string) => {
     navigateTo(path)
  };

  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Rich Content Creation',
      description: 'Professors can create and upload interactive learning materials easily'
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI-Enhanced Learning',
      description: 'Advanced AI tools to augment and personalize the learning experience'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Interactive Learning',
      description: 'Students can engage with content and collaborate effectively'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <ThemeToggle />

      {/* Navigation */}
      <nav className="absolute top-4 left-4">
        {user ? (
          <button
            onClick={() => handleNavigation('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
        ) : (
          <button
            onClick={() => handleNavigation('/auth')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
        )}
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20">
        <div className="text-center max-w-3xl mx-auto py-20">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
            Transform Your Learning Experience
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            An AI-powered platform where professors create engaging content and students learn interactively
          </p>
          <button
            onClick={() => handleNavigation(user ? '/dashboard' : '/auth')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg group"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto pb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}