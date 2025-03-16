import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import pptx from 'pptx2json';
import tmp from 'tmp'
import openai from "./aiClient.ts"
import {FineTuningJob} from "openai/resources/fine-tuning/jobs/jobs";
import PDFParser from 'pdf2json';
import {ASSISTANT_SYSTEM_PROMPT, TRAINING_SYSTEM_PROMPT} from "./constants.ts";

const extractText = async (filePath: string, fileType: string): Promise<string> => {
  try {
    const fileBuffer = fs.readFileSync(filePath);

    switch (fileType) {
      case '.txt':
        return fileBuffer.toString();

      case '.docx':
        const {value: docxText} = await mammoth.extractRawText({path: filePath});
        return docxText;

      case '.pdf':
        return new Promise((resolve, reject) => {
          const pdfParser = new PDFParser();
          let text = '';

          pdfParser.on('pdfParser_dataReady', (data) => {
            text = data.Pages.map((page: any) =>
              page.Texts.map((textItem: any) =>
                decodeURIComponent(textItem.R[0].T)
              ).join(' ')
            ).join('\n');
            resolve(text);
          });

          pdfParser.on('pdfParser_dataError', (error) => {
            reject(new Error(`Failed to parse PDF: ${error.message}`));
          });

          pdfParser.parseBuffer(fileBuffer);
        });

      // case '.ppt':
      // case '.pptx':
      //   const pptxText =  new pptx(filePath);
      //   return pptxText.slides.map(slide => slide.text).join('\n');

      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
};

// Splits text into blocks of a specified size
const splitTextIntoBlocks = (text: string, blockSize: number): string[] => {
  const blocks: string[] = [];
  for (let i = 0; i < text.length; i += blockSize) {
    blocks.push(text.slice(i, i + blockSize));
  }
  return blocks;
};

const generateFineTuningDataset = async (text: string, prompt: string, model: string): Promise<string> => {

  const response = await openai.chat.completions.create({
    model,
    messages: [
      {role: "system", content: TRAINING_SYSTEM_PROMPT},
      {role: "user", content: `GUIDE:${prompt}\n\n THE DATA:\n${text}`},
    ],
    max_tokens: 10000,
  });


  return response.choices[0].message.content?.trim() || ""
};


const validateDatasetFormat = (dataset: string): boolean => {
  try {
    // Split the dataset into lines
    const lines = dataset.split('\n');
    if (lines.length < 10) return false;

    // Validate each line
    for (const line of lines) {
      if (!line.trim()) continue; // Skip empty lines

      const parsed = JSON.parse(line);

      // Check if the parsed object has the "messages" property and it's an array
      if (
        !Array.isArray(parsed.messages) ||
        !parsed.messages.every((message: any) =>
          message.hasOwnProperty('role') &&
          message.hasOwnProperty('content') &&
          typeof message.role === 'string' &&
          typeof message.content === 'string'
        )
      ) {
        return false; // Invalid format
      }
    }

    return true; // All lines are valid
  } catch (error) {
    return false; // Parsing or validation failed
  }
};
// Processes uploaded files and generates a fine-tuning dataset
const processFiles = async (files: Express.Multer.File[], {prompt, model}: {
  prompt: string,
  model: string
}): Promise<string> => {
  const allDatasets: string[] = [];
  const maxRetries = 3; // Number of retries for generating a valid dataset

  for (const file of files) {
    const filePath = file.path;
    const fileType = path.extname(file.originalname).toLowerCase();

    if (!['.txt', '.ppt', '.pptx', '.doc', '.docx', '.pdf'].includes(fileType)) {
      console.error(`Unsupported file type: ${fileType}`);
      continue; // Skip unsupported files
    }

    try {
      const text = (await extractText(filePath, fileType)).replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim();
      const blocks = splitTextIntoBlocks(text, 10000);

      for (const block of blocks) {
        let dataset: string | null = null;
        let retries = 0;

        while (retries < maxRetries) {
          try {
            dataset = await generateFineTuningDataset(block, prompt, model);
            if (validateDatasetFormat(dataset)) {
              allDatasets.push(dataset);
              break; // Exit retry loop if dataset is valid
            }
          } catch (error) {
            console.error(`Error generating dataset for block: ${error.message}`);
          }
          retries++;
        }

        if (!dataset || !validateDatasetFormat(dataset)) {
          console.error(`Failed to generate valid dataset for block after ${maxRetries} retries`);
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file.originalname}: ${error.message}`);
    }
  }

  if (allDatasets.length > 0) {
    return allDatasets.join('\n');
  } else {
    throw new Error('No valid datasets were generated from the files');
  }
};

// Uploads the dataset to OpenAI and starts a fine-tuning job
export const train_content = async (files: Express.Multer.File[], prompt: string, model: string): Promise<FineTuningJob> => {
  try {
    // Generate the dataset
    const dataset = await processFiles(files, {prompt, model});

    // Save the dataset to a temporary file
    const tmpFile = tmp.fileSync({postfix: '.jsonl'});
    try {
      fs.writeFileSync(tmpFile.name, dataset);

      // Upload the dataset to OpenAI
      const fileUploadResponse = await openai.files.create({
          file: fs.createReadStream(tmpFile.name),
          purpose: 'fine-tune'
        }
      );

      const fineTuneResponse = await openai.fineTuning.jobs.create({
        training_file: fileUploadResponse.id,
        model
      });

      return fineTuneResponse;
    } finally {
      tmpFile.removeCallback()
    }

  } catch (error) {
    throw new Error(`Failed to train content: ${error.message}`);
  }
}


const test = async () => {
  // let text = await extractText("/home/yoni_ash/Downloads/Documents/Simplified CV.pdf", ".pdf")
  // fs.writeFileSync('scratches/output.txt', text)
  //
  // let job = await train_content([{
  //   path: "/home/yoni_ash/Documents/Professor Assist Change log.pdf",
  //   originalname: "Professor Assist Change log.pdf"
  // } as Express.Multer.File], "Give me a good dataset", "gpt-4o-mini-2024-07-18")
  // console.log(job)

  // let job = await openai.fineTuning.jobs.retrieve("ftjob-C8MsyNUHEQb9lAFDJpIi68Mo");
  // console.log(job)
}

/*{
  object: 'fine_tuning.job',
  id: 'ftjob-KyjtdsoXSXpOKmOEjk8hFfm4',
  model: 'gpt-4o-mini-2024-07-18',
  created_at: 1741717251,
  finished_at: null,
  fine_tuned_model: null,
  organization_id: 'org-FLZo3MFUOJzDKL1ZbmLUxAIV',
  result_files: [],
  status: 'validating_files',
  validation_file: null,
  training_file: 'file-BPiWsu4AiEEDfds9HzmC92',
  hyperparameters: {
    n_epochs: 'auto',
    batch_size: 'auto',
    learning_rate_multiplier: 'auto'
  },
  trained_tokens: null,
  error: {},
  user_provided_suffix: null,
  seed: 691234223,
  estimated_finish: null,
  integrations: [],
  metadata: null,
  method: { type: 'supervised', supervised: { hyperparameters: [Object] } }
}
*/

test().then()