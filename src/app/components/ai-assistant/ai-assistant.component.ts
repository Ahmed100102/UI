import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'code' | 'analysis';
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.css']
})
export class AiAssistantComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  messages: Message[] = [];
  currentMessage: string = '';
  isTyping: boolean = false;
  
  suggestions: Suggestion[] = [
    {
      id: '1',
      title: 'Analyze Error Patterns',
      description: 'Find common patterns in recent error logs',
      icon: 'fas fa-chart-line'
    },
    {
      id: '2',
      title: 'Performance Optimization',
      description: 'Get suggestions to improve system performance',
      icon: 'fas fa-tachometer-alt'
    },
    {
      id: '3',
      title: 'Security Analysis',
      description: 'Review security vulnerabilities and recommendations',
      icon: 'fas fa-shield-alt'
    },
    {
      id: '4',
      title: 'Resource Usage',
      description: 'Analyze CPU, memory, and disk usage patterns',
      icon: 'fas fa-server'
    }
  ];

  ngOnInit() {
    this.initializeChat();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  initializeChat() {
    const welcomeMessage: Message = {
      id: this.generateId(),
      content: 'Hello! I\'m your AI assistant. I can help you analyze logs, troubleshoot issues, optimize performance, and provide insights about your system. How can I assist you today?',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'text'
    };
    this.messages.push(welcomeMessage);
  }

  sendMessage() {
    if (!this.currentMessage.trim()) return;

    const userMessage: Message = {
      id: this.generateId(),
      content: this.currentMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    this.messages.push(userMessage);
    const messageToProcess = this.currentMessage;
    this.currentMessage = '';
    
    this.processMessage(messageToProcess);
  }

  processMessage(message: string) {
    this.isTyping = true;
    
    // Simulate AI processing delay
    setTimeout(() => {
      const response = this.generateAIResponse(message);
      const assistantMessage: Message = {
        id: this.generateId(),
        content: response.content,
        sender: 'assistant',
        timestamp: new Date(),
        type: response.type
      };
      
      this.messages.push(assistantMessage);
      this.isTyping = false;
    }, 1500);
  }

  generateAIResponse(message: string): { content: string; type: 'text' | 'code' | 'analysis' } {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('error') || lowerMessage.includes('bug')) {
      return {
        content: `I've analyzed your error patterns. Here are the key findings:

**Top Error Categories:**
• Database connection timeouts (45% of errors)
• Memory allocation failures (23% of errors)
• API rate limiting (18% of errors)
• Authentication failures (14% of errors)

**Recommendations:**
1. Increase database connection pool size
2. Implement memory monitoring alerts
3. Add exponential backoff for API calls
4. Review authentication token expiration settings

Would you like me to provide specific configuration examples for any of these solutions?`,
        type: 'analysis'
      };
    }
    
    if (lowerMessage.includes('performance') || lowerMessage.includes('slow')) {
      return {
        content: `Based on your system metrics, I've identified several performance optimization opportunities:

**Current Performance Issues:**
• Average response time: 2.3s (target: <1s)
• CPU utilization: 78% (high)
• Memory usage: 85% (critical)
• Database query time: 450ms average

**Optimization Suggestions:**
1. Enable query caching for frequently accessed data
2. Implement connection pooling
3. Add database indexing for slow queries
4. Consider horizontal scaling for high-traffic endpoints

Here's a sample configuration for connection pooling:

\`\`\`javascript
const pool = {
  max: 20,
  min: 5,
  acquire: 30000,
  idle: 10000
};
\`\`\``,
        type: 'code'
      };
    }
    
    if (lowerMessage.includes('security') || lowerMessage.includes('vulnerability')) {
      return {
        content: `Security analysis completed. Here's your security status:

**Security Score: 7.5/10** ⚠️

**Identified Vulnerabilities:**
• SSL certificate expires in 15 days
• 3 outdated dependencies with known CVEs
• Missing rate limiting on authentication endpoints
• Insufficient logging for security events

**Immediate Actions Required:**
1. Renew SSL certificate
2. Update dependencies: express@4.18.2, lodash@4.17.21
3. Implement rate limiting (max 5 attempts/minute)
4. Enable security event logging

**Compliance Status:**
✅ GDPR compliant
✅ SOC 2 Type II ready
⚠️ PCI DSS - requires SSL update`,
        type: 'analysis'
      };
    }
    
    if (lowerMessage.includes('resource') || lowerMessage.includes('usage')) {
      return {
        content: `Resource usage analysis for the last 24 hours:

**CPU Usage:**
• Average: 65%
• Peak: 92% (occurred at 14:30)
• Trend: Increasing (+12% from yesterday)

**Memory Usage:**
• Current: 7.2GB / 8GB (90%)
• Peak: 7.8GB (97%)
• Memory leaks detected in payment-service

**Disk Usage:**
• System: 45GB / 100GB (45%)
• Logs: 12GB (growing 2GB/day)
• Database: 28GB

**Recommendations:**
1. Scale up memory to 16GB
2. Implement log rotation (keep 7 days)
3. Investigate memory leak in payment-service
4. Set up automated scaling triggers at 80% CPU`,
        type: 'analysis'
      };
    }
    
    // Default response
    return {
      content: `I understand you're asking about "${message}". I can help you with:

• **Log Analysis** - Find patterns, errors, and anomalies
• **Performance Monitoring** - Identify bottlenecks and optimization opportunities  
• **Security Assessment** - Vulnerability scanning and compliance checks
• **Resource Management** - CPU, memory, and disk usage optimization
• **Troubleshooting** - Step-by-step problem resolution
• **Best Practices** - Industry-standard recommendations

Could you provide more specific details about what you'd like me to analyze or help you with?`,
      type: 'text'
    };
  }

  useSuggestion(suggestion: Suggestion) {
    this.currentMessage = `Help me with: ${suggestion.title} - ${suggestion.description}`;
    this.sendMessage();
  }

  clearChat() {
    this.messages = [];
    this.initializeChat();
  }

  exportChat() {
    const chatData = {
      timestamp: new Date().toISOString(),
      messages: this.messages
    };
    
    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-chat-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  formatTimestamp(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}