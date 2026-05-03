import { streamText } from 'ai'
import { anthropic } from '@anthropic-ai/sdk'

const client = new anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder',
})

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = await streamText({
      model: client,
      messages,
      tools: {
        str_replace_editor: {
          description: 'Create, view, or edit files',
          parameters: {
            type: 'object',
            properties: {
              command: { type: 'string', enum: ['create', 'str_replace', 'view'] },
              path: { type: 'string' },
              file_text: { type: 'string' },
            },
            required: ['command', 'path']
          }
        },
        file_manager: {
          description: 'Delete or rename files',
          parameters: {
            type: 'object',
            properties: {
              command: { type: 'string', enum: ['delete', 'rename'] },
              path: { type: 'string' },
              new_path: { type: 'string' }
            },
            required: ['command', 'path']
          }
        }
      },
      system: `You are an expert React developer. Help users create React components by writing JSX code.

When creating components:
1. Always write modern functional React components with TypeScript
2. Use proper imports and exports
3. Include appropriate props interfaces when needed
4. Create clean, well-structured code
5. Use Tailwind CSS for styling

Use the str_replace_editor tool to create files with the component code.`,
    })

    return result.toAIStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}