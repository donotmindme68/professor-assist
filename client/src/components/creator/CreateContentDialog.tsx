import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Settings, BookOpen, BrainCircuit, Upload, File, Trash2, AlertCircle } from 'lucide-react';
import { ContentAPI } from '../../api';

interface ModelParams {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

interface CreateContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (content: any) => void;
}

const OPENAI_MODELS = [
  'gpt-4o-2024-08-06',
  'gpt-4o-mini-2024-07-18',
];

const DEFAULT_MODEL_PARAMS: ModelParams = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

const CreateContentDialog: React.FC<CreateContentDialogProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   onSuccess,
                                                                 }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modelType, setModelType] = useState(OPENAI_MODELS[0]);
  const [modelParams, setModelParams] = useState<ModelParams>(DEFAULT_MODEL_PARAMS);
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateBasicInfo = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Content name is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateModelConfig = () => {
    const newErrors: { [key: string]: string } = {};

    if (!prompt.trim()) {
      newErrors.prompt = 'Training data is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentStep === 0 && validateBasicInfo()) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateModelConfig()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('isPublic', 'false');
      formData.append('modelInfo', JSON.stringify({
        type: modelType,
        params: modelParams,
        prompt,
      }));

      files.forEach(file => {
        formData.append('files', file);
      });

      const content = await ContentAPI.create(formData);
      onSuccess(content);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const steps = [
    {
      title: 'Basic Information',
      icon: BookOpen,
      fields: (
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: '' });
              }}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white`}
              placeholder="Enter content name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: '' });
              }}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white h-32 resize-none`}
              placeholder="Describe your content"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Training Files
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept=".txt,.md,.pdf,.doc,.docx"
            />
            <div className="space-y-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:border-primary-500 dark:hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center justify-center"
              >
                <Upload size={18} className="mr-2" />
                Upload Files
              </motion.button>
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <File size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">
                          {file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Model Configuration',
      icon: BrainCircuit,
      fields: (
        <div className="space-y-4">
          <div>
            <label htmlFor="modelType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model Type
            </label>
            <select
              id="modelType"
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            >
              {OPENAI_MODELS.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setErrors({ ...errors, prompt: '' });
              }}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
                errors.prompt ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white h-32 resize-none`}
              placeholder="Enter your training data or prompts"
            />
            {errors.prompt && (
              <p className="mt-1 text-sm text-red-500">{errors.prompt}</p>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
            >
              <Settings size={16} className="mr-1" />
              {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
            </button>
          </div>
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Temperature: {modelParams.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={modelParams.temperature}
                    onChange={(e) => setModelParams({ ...modelParams, temperature: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Tokens: {modelParams.maxTokens}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4096"
                    step="1"
                    value={modelParams.maxTokens}
                    onChange={(e) => setModelParams({ ...modelParams, maxTokens: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Top P: {modelParams.topP}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={modelParams.topP}
                    onChange={(e) => setModelParams({ ...modelParams, topP: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Frequency Penalty: {modelParams.frequencyPenalty}
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={modelParams.frequencyPenalty}
                    onChange={(e) => setModelParams({ ...modelParams, frequencyPenalty: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Presence Penalty: {modelParams.presencePenalty}
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={modelParams.presencePenalty}
                    onChange={(e) => setModelParams({ ...modelParams, presencePenalty: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ),
    },
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Wand2 size={24} className="text-primary-600 dark:text-primary-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Content</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {submitError && (
          <div className="px-6 pt-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-center text-red-700 dark:text-red-400">
              <AlertCircle size={20} className="mr-2 flex-shrink-0" />
              <p>{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex mb-6">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(index)}
                    className={`flex items-center ${
                      index === currentStep
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <step.icon size={18} className="mr-2" />
                    <span className="text-sm font-medium">{step.title}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className="mx-4 border-t border-gray-200 dark:border-gray-700 flex-1 self-center" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {steps[currentStep].fields}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                currentStep > 0
                  ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
              disabled={currentStep === 0 || isSubmitting}
            >
              Previous
            </button>
            <div>
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Content'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateContentDialog;