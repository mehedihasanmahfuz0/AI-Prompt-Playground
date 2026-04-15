import type { Template } from '@/types'

export const TEMPLATES: Template[] = [
  {
    id: 'blog-writer',
    name: 'Blog Writer',
    category: 'Content',
    description: 'Generate a structured blog post on any topic for a target audience.',
    prompt: `Write a comprehensive blog post about {{topic}} for {{audience}}.

Structure:
- Catchy headline
- Introduction (hook the reader)
- 3-4 main sections with subheadings
- Practical takeaways
- Conclusion with a call to action

Tone: {{tone}}
Word count: approximately {{word_count}} words`,
  },
  {
    id: 'code-explainer',
    name: 'Code Explainer',
    category: 'Development',
    description: 'Explain code clearly to developers of any level.',
    prompt: `Explain the following {{language}} code to a {{level}} developer:

\`\`\`{{language}}
{{code}}
\`\`\`

Include:
1. What the code does (plain English overview)
2. Line-by-line or block-by-block breakdown
3. Any gotchas, edge cases, or best practices worth noting`,
  },
  {
    id: 'product-description',
    name: 'Product Description',
    category: 'Marketing',
    description: 'Write compelling product copy that converts.',
    prompt: `Write a compelling product description for {{product_name}}.

Key details:
- Main benefit: {{main_benefit}}
- Target customer: {{target_customer}}
- Price point: {{price}}

Format: 2-3 sentences of emotional hook, followed by 4-6 bullet points of features/benefits. End with a strong call to action. Tone should be {{tone}}.`,
  },
  {
    id: 'email-writer',
    name: 'Professional Email',
    category: 'Business',
    description: 'Draft clear, professional emails for any situation.',
    prompt: `Write a professional email from {{sender_role}} to {{recipient_role}}.

Purpose: {{email_purpose}}
Key points to include: {{key_points}}
Desired outcome: {{desired_outcome}}

Tone: {{tone}}
Length: concise — no more than 150 words.`,
  },
  {
    id: 'system-prompt',
    name: 'AI System Prompt',
    category: 'AI / LLM',
    description: 'Design a system prompt for a custom AI assistant.',
    prompt: `Create a system prompt for an AI assistant with the following role:

Role: {{role}}
Primary task: {{primary_task}}
Target users: {{target_users}}
Tone and personality: {{tone}}
Constraints (what it should NOT do): {{constraints}}

The system prompt should be clear, specific, and prevent the AI from going off-topic.`,
  },
  {
    id: 'sql-query',
    name: 'SQL Query Generator',
    category: 'Development',
    description: 'Generate SQL queries from plain English requirements.',
    prompt: `Generate a {{dialect}} SQL query for the following requirement:

Requirement: {{requirement}}

Table schema:
{{schema}}

Rules:
- Use proper aliasing
- Add comments for complex logic
- Optimize for readability
- Handle NULL values appropriately`,
  },
  {
    id: 'story-writer',
    name: 'Short Story',
    category: 'Creative',
    description: 'Generate a short story with a specific genre and theme.',
    prompt: `Write a {{genre}} short story with the following details:

Main character: {{character}}
Setting: {{setting}}
Central conflict: {{conflict}}
Theme: {{theme}}

Length: approximately 400-600 words. End with a memorable final line.`,
  },
  {
    id: 'interview-prep',
    name: 'Interview Prep',
    category: 'Career',
    description: 'Prepare thoughtful answers to interview questions.',
    prompt: `Help me prepare an answer for this interview question at {{company}}:

Question: {{question}}
My background: {{background}}
Role I am applying for: {{role}}

Format the answer using the STAR method (Situation, Task, Action, Result). Keep it under 2 minutes when spoken aloud.`,
  },
]

export const CATEGORIES = [...new Set(TEMPLATES.map((t) => t.category))]
