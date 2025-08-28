import { Router } from 'express';
import OpenAI from 'openai';
import { storage } from './storage';
import { randomUUID } from 'crypto';

const router = Router();

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// In-memory storage for AI chat conversations (extend to database if needed)
const conversations = new Map<string, ChatConversation>();

// Get all AI chat conversations for a user
router.get('/conversations', async (req, res) => {
  try {
    const userId = (req.session as any)?.user?.id || 'demo-user-testing';
    
    // Get user's conversations
    const userConversations = Array.from(conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    res.json(userConversations);
  } catch (error) {
    console.error('Error fetching AI conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get specific AI chat conversation
router.get('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = conversations.get(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json(conversation);
  } catch (error) {
    console.error('Error fetching AI conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Create new AI chat conversation
router.post('/conversations', async (req, res) => {
  try {
    const userId = (req.session as any)?.user?.id || 'demo-user-testing';
    const { title } = req.body;
    
    const conversation: ChatConversation = {
      id: randomUUID(),
      userId,
      title: title || 'New AI Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    conversations.set(conversation.id, conversation);
    
    res.json(conversation);
  } catch (error) {
    console.error('Error creating AI conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Send message to AI and get response
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = (req.session as any)?.user?.id || 'demo-user-testing';
    
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    let conversation = conversations.get(conversationId);
    
    // Create new conversation if it doesn't exist
    if (!conversation) {
      conversation = {
        id: conversationId,
        userId,
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    // Add user message
    const userMessage: ChatMessage = {
      id: randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };
    
    conversation.messages.push(userMessage);
    
    // Prepare messages for OpenAI (include system prompt for MoshUnion context)
    const openaiMessages = [
      {
        role: 'system' as const,
        content: `You are MoshBot, the official AI assistant for MoshUnion - a music community platform for metal and rock enthusiasts. You help users discover bands, get concert recommendations, discuss music, and navigate the platform. 

Your personality:
- Passionate about metal and rock music
- Knowledgeable about bands, concerts, and music history
- Helpful and friendly, but with an edge that fits the metal community
- Use music-related references and terms naturally
- Occasionally use metal/rock emojis like 🤘, 🎸, 🔥

You can help with:
- Band recommendations and discovery
- Concert and tour information
- Music history and facts
- Platform navigation
- General music discussions
- Reviews and opinions

Keep responses conversational, engaging, and focused on the music community experience.`
      },
      ...conversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];
    
    // Get AI response
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: openaiMessages,
      max_tokens: 500,
      temperature: 0.7
    });
    
    const aiContent = response.choices[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error('No response from AI');
    }
    
    // Add AI response
    const aiMessage: ChatMessage = {
      id: randomUUID(),
      role: 'assistant',
      content: aiContent,
      timestamp: new Date().toISOString()
    };
    
    conversation.messages.push(aiMessage);
    conversation.updatedAt = new Date().toISOString();
    
    // Update conversation title if this is the first exchange
    if (conversation.messages.length === 2) {
      conversation.title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
    }
    
    conversations.set(conversationId, conversation);
    
    res.json({
      userMessage,
      aiMessage,
      conversation
    });
    
  } catch (error) {
    console.error('Error processing AI chat message:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete AI conversation
router.delete('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = (req.session as any)?.user?.id || 'demo-user-testing';
    
    const conversation = conversations.get(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    if (conversation.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    conversations.delete(conversationId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting AI conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

export { router as aiChatRoutes };