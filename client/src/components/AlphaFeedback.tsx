import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  AlertTriangle, 
  Send, 
  X,
  Shield,
  Lock
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
// Using native select instead of missing UI component

interface AlphaFeedbackProps {
  currentUser: any;
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackMessage {
  type: 'bug' | 'feature' | 'general' | 'urgent';
  title: string;
  description: string;
  currentSection?: string;
  deviceInfo?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export function AlphaFeedback({ currentUser, isOpen, onClose }: AlphaFeedbackProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general' | 'urgent'>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detect current section and device info
  const currentSection = window.location.pathname.includes('messaging') ? 'Messaging' : 
                        window.location.search.includes('section=') ? 
                        new URLSearchParams(window.location.search).get('section') || 'Main App' : 'Main App';

  const deviceInfo = `${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'} | ${navigator.userAgent.split(' ')[0]}`;

  const sendFeedbackMutation = useMutation({
    mutationFn: async (feedback: FeedbackMessage) => {
      console.log('🔄 Starting feedback submission for:', feedback.title);
      
      // First, create or get existing conversation with admin
      console.log('📞 Creating conversation with admin...');
      const conversationResponse = await apiRequest('/api/messaging/feedback-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          stagename: currentUser.stagename
        })
      });

      if (!conversationResponse.ok) {
        const errorText = await conversationResponse.text();
        console.error('❌ Conversation creation failed:', errorText);
        throw new Error(`Failed to create feedback conversation: ${errorText}`);
      }

      const conversation = await conversationResponse.json();
      console.log('✅ Conversation created:', conversation.id);

      // Format the feedback message with metadata
      const feedbackMessage = {
        conversationId: conversation.id,
        content: formatFeedbackMessage(feedback),
        messageType: 'feedback',
        priority: feedback.urgency,
        metadata: {
          feedbackType: feedback.type,
          urgency: feedback.urgency,
          section: currentSection,
          device: deviceInfo,
          timestamp: new Date().toISOString(),
          userId: currentUser.id,
          userType: currentUser.isAlphaTester ? 'alpha' : 'user',
          accessKey: currentUser.accessKey
        }
      };

      console.log('📨 Sending feedback message...');
      // Send the message through the encrypted messaging system
      const messageResponse = await apiRequest('/api/messaging/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackMessage)
      });

      if (!messageResponse.ok) {
        const errorText = await messageResponse.text();
        console.error('❌ Message sending failed:', errorText);
        throw new Error(`Failed to send feedback: ${errorText}`);
      }

      const result = await messageResponse.json();
      console.log('✅ Feedback sent successfully:', result);
      return result;
    },
    onSuccess: () => {
      setIsSubmitting(false);
      toast({
        title: "Feedback Sent! 🎸",
        description: "Your feedback has been encrypted and sent directly to the developer. Thank you for helping improve MoshUnion!",
      });
      
      // Clear form
      setTitle('');
      setDescription('');
      setFeedbackType('bug');
      setUrgency('medium');
      onClose();
    },
    onError: (error) => {
      setIsSubmitting(false);
      console.error('Feedback error:', error);
      toast({
        title: "Failed to Send Feedback",
        description: "There was an issue sending your feedback. Please try again or contact support.",
        variant: "destructive"
      });
    }
  });

  const formatFeedbackMessage = (feedback: FeedbackMessage): string => {
    const typeIcon = {
      bug: '🐛',
      feature: '💡',
      general: '💬',
      urgent: '🚨'
    };

    const urgencyIcon = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };

    return `${typeIcon[feedback.type]} **${feedback.title}**

**Type:** ${feedback.type.toUpperCase()}
**Urgency:** ${urgencyIcon[feedback.urgency]} ${feedback.urgency.toUpperCase()}
**Section:** ${currentSection}
**Device:** ${deviceInfo}
**User:** ${currentUser.stagename} (${currentUser.accessKey})

**Description:**
${feedback.description}

---
*Sent via Alpha Feedback System - Encrypted Message*
*Timestamp: ${new Date().toLocaleString()}*`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and description for your feedback.",
        variant: "destructive"
      });
      return;
    }

    const feedback: FeedbackMessage = {
      type: feedbackType,
      title: title.trim(),
      description: description.trim(),
      currentSection,
      deviceInfo,
      urgency
    };

    setIsSubmitting(true);
    sendFeedbackMutation.mutate(feedback);
  };

  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="w-4 h-4" />;
      case 'feature': return <Lightbulb className="w-4 h-4" />;
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default: return 'bg-green-500/20 text-green-300 border-green-500/50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-black border-red-500/30">
        <CardHeader className="border-b border-red-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-red-300 flex items-center gap-2">
                  Alpha Feedback System
                  <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50">
                    <Lock className="w-3 h-3 mr-1" />
                    Encrypted
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-400">
                  Send feedback directly to the developer via encrypted messaging
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              data-testid="button-close-feedback"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Feedback Type</label>
              <select 
                value={feedbackType} 
                onChange={(e) => setFeedbackType(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="bug">🐛 Bug Report</option>
                <option value="feature">💡 Feature Request</option>
                <option value="urgent">🚨 Urgent Issue</option>
                <option value="general">💬 General Feedback</option>
              </select>
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Urgency Level</label>
              <select 
                value={urgency} 
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="low">🟢 Low - General improvement</option>
                <option value="medium">🟡 Medium - Noticeable issue</option>
                <option value="high">🟠 High - Significant problem</option>
                <option value="critical">🔴 Critical - App breaking</option>
              </select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Title</label>
              <Input
                type="text"
                placeholder="Brief description of the issue or suggestion..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                data-testid="input-feedback-title"
                maxLength={100}
              />
              <div className="text-xs text-gray-500 text-right">{title.length}/100</div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Detailed Description</label>
              <Textarea
                placeholder="Please provide as much detail as possible. Include steps to reproduce for bugs, or specific requirements for features..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 min-h-[120px]"
                data-testid="textarea-feedback-description"
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 text-right">{description.length}/1000</div>
            </div>

            {/* Context Info */}
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Context Information</h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                <div>
                  <span className="font-medium">Current Section:</span>
                  <div>{currentSection}</div>
                </div>
                <div>
                  <span className="font-medium">Device:</span>
                  <div>{deviceInfo}</div>
                </div>
                <div>
                  <span className="font-medium">User:</span>
                  <div>{currentUser.stagename}</div>
                </div>
                <div>
                  <span className="font-medium">Access Key:</span>
                  <div>{currentUser.accessKey}</div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
                data-testid="button-submit-feedback"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Encrypted Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}