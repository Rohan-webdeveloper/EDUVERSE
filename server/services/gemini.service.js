const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
const getGenAI = () => {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
};

const MODELS_TO_TRY = [
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.5-flash'
];

const getModel = (jsonMode = false) => {
  return {
    generateContent: async (prompt) => {
      let lastError;
      for (const modelName of MODELS_TO_TRY) {
        try {
          const options = { model: modelName };
          if (jsonMode) {
            options.generationConfig = { responseMimeType: 'application/json' };
          }
          const model = getGenAI().getGenerativeModel(options);
          const result = await model.generateContent(prompt);
          return result;
        } catch (error) {
          console.warn(`Gemini model ${modelName} failed, trying next fallback. Error:`, error.message);
          lastError = error;
        }
      }
      throw new Error(`All Gemini fallback models failed. Last error: ${lastError?.message}`);
    }
  };
};

/**
 * Generate notes for a video/topic
 */
const generateNotes = async ({ topic, videoTitle, type = 'short', subject = '', exam = '' }) => {
  const typeMap = {
    short: 'concise short notes with bullet points',
    long: 'comprehensive detailed notes with explanations',
    formula: 'a formula sheet with all important formulas and their applications',
    concepts: 'key concepts and definitions',
    questions: '10 important exam questions with answers',
  };
  const prompt = `You are an expert ${subject || 'educational'} tutor preparing study material for ${exam || 'students'}.

Generate ${typeMap[type] || 'notes'} for the topic: "${topic}"${videoTitle ? ` from the video titled: "${videoTitle}"` : ''}.

Format the output in clean Markdown with:
- Clear headings (##, ###)
- Bullet points for key information
- Bold for important terms
- Examples where relevant
- ${exam ? `Tips specific to ${exam} exam` : ''}

Keep it educational, accurate, and student-friendly.`;

  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * Solve a doubt/question
 */
const solveDoubt = async ({ question, subject = '', exam = '', level = 'intermediate' }) => {
  const prompt = `You are a brilliant ${subject || 'educational'} expert and teacher helping a ${exam || 'student'} student.

Question: "${question}"

Provide a comprehensive explanation with:
1. **Simple Explanation** (2-3 sentences for quick understanding)
2. **Detailed Explanation** (thorough breakdown with theory)
3. **Real-world Examples** (2-3 practical examples)
4. **Key Points to Remember** (bullet list)
5. **Common Mistakes to Avoid**
6. **Exam Tips** (for ${exam || 'competitive exams'})

Format in clean Markdown. Be accurate, clear, and encouraging.`;

  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * Generate study roadmap
 */
const generateRoadmap = async ({ goal, duration, currentLevel = 'beginner', subjects = [] }) => {
  const prompt = `You are an expert academic counselor and study strategist.

A student wants to: "${goal}"
Timeframe: ${duration}
Current Level: ${currentLevel}
Subjects to focus on: ${subjects.length ? subjects.join(', ') : 'as required by the goal'}

Generate a detailed, actionable study roadmap with:
1. **Overview** - Brief strategy summary
2. **Phase-wise Plan** - Break the ${duration} into phases (weekly/monthly)
3. **Daily Schedule** - Suggested daily study hours and activities
4. **Topic Priority List** - High to low priority topics
5. **Weekly Milestones** - What to achieve each week
6. **Recommended Resources** - Types of resources (video topics, books, etc.)
7. **Mock Test Schedule** - When and how often to take tests
8. **Revision Strategy** - How to revise effectively
9. **Motivational Tips** - Keep the student motivated

Format as a comprehensive, well-structured Markdown document. Make it realistic and achievable.`;

  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * Clean control characters ONLY inside string literals in a JSON string.
 * Preserves structural newlines/tabs outside strings, but escapes them inside.
 */
const cleanRawControlChars = (jsonStr) => {
  let result = '';
  let inString = false;
  let escape = false;
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    if (escape) {
      result += char;
      escape = false;
      continue;
    }
    if (char === '\\') {
      result += char;
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }
    if (inString) {
      if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else if (char.charCodeAt(0) < 32) {
        result += ''; // remove other control chars
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }
  return result;
};

/**
 * Generate quiz questions
 */
const generateQuiz = async ({ topic, subject = '', difficulty = 'intermediate', numQuestions = 10, exam = '' }) => {
  const prompt = `You are an expert ${subject || 'educational'} examiner creating a quiz for ${exam || 'students'}.

Generate exactly ${numQuestions} multiple-choice questions (MCQs) on: "${topic}"
Difficulty: ${difficulty}
${exam ? `Target Exam: ${exam}` : ''}

Return ONLY a valid JSON array (no markdown, no explanation) in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why the answer is correct"
  }
]

The correctAnswer is the index (0-3) of the correct option. Ensure questions are accurate and educational.`;

  const model = getModel(true);
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  
  try {
    return JSON.parse(cleanRawControlChars(text));
  } catch (e) {
    // Fallback: extract JSON array, clean it, and parse
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Failed to parse quiz questions');
    return JSON.parse(cleanRawControlChars(jsonMatch[0]));
  }
};

/**
 * Generate AI summary of a video
 */
const generateSummary = async ({ videoTitle, topic = '', channelTitle = '' }) => {
  const prompt = `You are an educational content analyst. Generate a comprehensive summary for students about this educational video:

Video Title: "${videoTitle}"
Channel: "${channelTitle}"
${topic ? `Topic: "${topic}"` : ''}

Provide:
1. **What You'll Learn** (3-5 key learning outcomes)
2. **Key Concepts Covered** (main topics)
3. **Prerequisites** (what students should know beforehand)
4. **Quick Summary** (100 words)

Format in clean Markdown.`;

  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * Career guidance
 */
const generateCareerGuidance = async ({ interests, skills, currentLevel, goal = '' }) => {
  const prompt = `You are an expert career counselor specializing in Indian and global education and career paths.

Student Profile:
- Interests: ${interests}
- Current Skills: ${skills}
- Level: ${currentLevel}
- Career Goal: ${goal || 'not specified'}

Provide comprehensive career guidance including:
1. **Recommended Career Paths** (top 3-5 with descriptions)
2. **Skills to Develop** (priority order)
3. **Certifications to Pursue** (with platforms)
4. **Learning Roadmap** (step by step)
5. **Job Market Insights** (demand, salary range)
6. **Competitive Exams** (if applicable)
7. **Inspiring Examples** (success stories)

Format in detailed, motivating Markdown.`;

  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * Evaluate quiz and provide feedback
 */
const evaluateQuiz = async ({ topic, questions, score, percentage }) => {
  const prompt = `You are a supportive educational evaluator. A student just completed a quiz on "${topic}".

Results:
- Score: ${score}/${questions.length}
- Percentage: ${percentage}%
- Wrong Answers: ${questions.filter(q => !q.isCorrect).length}

Provide:
1. **Performance Summary** (encouraging tone)
2. **Strengths** (what they did well)
3. **Areas to Improve** (specific topics)
4. **Next Steps** (concrete action plan)
5. **Motivational Message**

Keep it encouraging and constructive. Format in Markdown.`;

  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
};

module.exports = {
  generateNotes,
  solveDoubt,
  generateRoadmap,
  generateQuiz,
  generateSummary,
  generateCareerGuidance,
  evaluateQuiz,
};
