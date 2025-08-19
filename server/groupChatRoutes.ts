import type { Express } from "express";
import { storage } from "./storage";
import { insertGroupChatSchema as createGroupChatSchema, insertGroupChatMemberSchema, insertGroupMessageSchema, insertGroupMessageReactionSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService } from "./objectStorage";

// Authentication middleware placeholder - replace with actual auth
const requireAuth = (req: any, res: any, next: any) => {
  // For testing, use a mock user. In production, check session/JWT
  req.user = { id: 'test-user-1', stagename: 'MetalHead' };
  next();
};

export function registerGroupChatRoutes(app: Express) {
  const objectStorage = new ObjectStorageService();

  // Create a new group chat
  app.post('/api/group-chats', requireAuth, async (req, res) => {
    try {
      const groupData = createGroupChatSchema.parse({
        ...req.body,
        createdBy: req.user.id,
      });

      const newGroup = await storage.createGroupChat(groupData);

      res.status(201).json({
        success: true,
        group: newGroup,
        message: 'Group chat created successfully',
      });
    } catch (error) {
      console.error('Error creating group chat:', error);
      res.status(400).json({
        success: false,
        error: error instanceof z.ZodError ? error.errors : 'Failed to create group chat',
      });
    }
  });

  // Get user's group chats
  app.get('/api/group-chats', requireAuth, async (req, res) => {
    try {
      const groups = await storage.getUserGroupChats(req.user.id);
      res.json({
        success: true,
        groups,
      });
    } catch (error) {
      console.error('Error fetching group chats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch group chats',
      });
    }
  });

  // Get specific group chat details
  app.get('/api/group-chats/:groupId', requireAuth, async (req, res) => {
    try {
      const { groupId } = req.params;
      
      // Check if user is a member
      const groups = await storage.getUserGroupChats(req.user.id);
      const userGroup = groups.find(g => g.id === groupId);
      
      if (!userGroup) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You are not a member of this group',
        });
      }

      const group = await storage.getGroupChat(groupId);
      const members = await storage.getGroupMembers(groupId);

      res.json({
        success: true,
        group,
        members,
        userRole: userGroup.memberRole,
      });
    } catch (error) {
      console.error('Error fetching group details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch group details',
      });
    }
  });

  // Add member to group (admin only)
  app.post('/api/group-chats/:groupId/members', requireAuth, async (req, res) => {
    try {
      const { groupId } = req.params;
      const { userId, role = 'member' } = req.body;

      // Check admin permissions
      const permissions = await storage.checkGroupAdminPermissions(groupId, req.user.id);
      if (!permissions.isAdmin || !permissions.permissions.canAddMembers) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Insufficient permissions to add members',
        });
      }

      const memberData = insertGroupChatMemberSchema.parse({
        groupId,
        userId,
        role,
      });

      const newMember = await storage.addGroupMember(memberData);

      res.status(201).json({
        success: true,
        member: newMember,
        message: 'Member added successfully',
      });
    } catch (error) {
      console.error('Error adding group member:', error);
      res.status(400).json({
        success: false,
        error: error instanceof z.ZodError ? error.errors : 'Failed to add member',
      });
    }
  });

  // Remove member from group (admin only)
  app.delete('/api/group-chats/:groupId/members/:userId', requireAuth, async (req, res) => {
    try {
      const { groupId, userId } = req.params;

      // Check admin permissions
      const permissions = await storage.checkGroupAdminPermissions(groupId, req.user.id);
      if (!permissions.isAdmin || !permissions.permissions.canRemoveMembers) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Insufficient permissions to remove members',
        });
      }

      const success = await storage.removeGroupMember(groupId, userId);

      if (success) {
        res.json({
          success: true,
          message: 'Member removed successfully',
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Member not found or already removed',
        });
      }
    } catch (error) {
      console.error('Error removing group member:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove member',
      });
    }
  });

  // Update member role (creator/admin only)
  app.patch('/api/group-chats/:groupId/members/:userId/role', requireAuth, async (req, res) => {
    try {
      const { groupId, userId } = req.params;
      const { role, permissions } = req.body;

      // Check admin permissions
      const adminPermissions = await storage.checkGroupAdminPermissions(groupId, req.user.id);
      if (!adminPermissions.isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Insufficient permissions to update roles',
        });
      }

      const success = await storage.updateGroupMemberRole(groupId, userId, role, permissions);

      if (success) {
        res.json({
          success: true,
          message: 'Member role updated successfully',
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Member not found',
        });
      }
    } catch (error) {
      console.error('Error updating member role:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update member role',
      });
    }
  });

  // Get group messages
  app.get('/api/group-chats/:groupId/messages', requireAuth, async (req, res) => {
    try {
      const { groupId } = req.params;
      const { limit, before } = req.query;

      // Check if user is a member
      const groups = await storage.getUserGroupChats(req.user.id);
      const userGroup = groups.find(g => g.id === groupId);
      
      if (!userGroup) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You are not a member of this group',
        });
      }

      const messages = await storage.getGroupMessages(
        groupId,
        limit ? parseInt(limit as string) : 50,
        before as string
      );

      // Update user's last read timestamp
      await storage.updateGroupMemberLastRead(groupId, req.user.id);

      res.json({
        success: true,
        messages,
      });
    } catch (error) {
      console.error('Error fetching group messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch messages',
      });
    }
  });

  // Send message to group
  app.post('/api/group-chats/:groupId/messages', requireAuth, async (req, res) => {
    try {
      const { groupId } = req.params;
      
      // Check if user is a member
      const groups = await storage.getUserGroupChats(req.user.id);
      const userGroup = groups.find(g => g.id === groupId);
      
      if (!userGroup) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You are not a member of this group',
        });
      }

      const messageData = insertGroupMessageSchema.parse({
        ...req.body,
        groupId,
        senderId: req.user.id,
      });

      const newMessage = await storage.createGroupMessage(messageData);

      res.status(201).json({
        success: true,
        message: newMessage,
      });
    } catch (error) {
      console.error('Error sending group message:', error);
      res.status(400).json({
        success: false,
        error: error instanceof z.ZodError ? error.errors : 'Failed to send message',
      });
    }
  });

  // Add reaction to message
  app.post('/api/group-chats/:groupId/messages/:messageId/reactions', requireAuth, async (req, res) => {
    try {
      const { groupId, messageId } = req.params;
      const { emoji } = req.body;

      // Check if user is a member
      const groups = await storage.getUserGroupChats(req.user.id);
      const userGroup = groups.find(g => g.id === groupId);
      
      if (!userGroup) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You are not a member of this group',
        });
      }

      const reactionData = insertGroupMessageReactionSchema.parse({
        messageId,
        userId: req.user.id,
        emoji,
      });

      const reaction = await storage.addGroupMessageReaction(reactionData);

      res.status(201).json({
        success: true,
        reaction,
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      res.status(400).json({
        success: false,
        error: error instanceof z.ZodError ? error.errors : 'Failed to add reaction',
      });
    }
  });

  // Remove reaction from message
  app.delete('/api/group-chats/:groupId/messages/:messageId/reactions', requireAuth, async (req, res) => {
    try {
      const { groupId, messageId } = req.params;
      const { emoji } = req.query;

      // Check if user is a member
      const groups = await storage.getUserGroupChats(req.user.id);
      const userGroup = groups.find(g => g.id === groupId);
      
      if (!userGroup) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You are not a member of this group',
        });
      }

      const success = await storage.removeGroupMessageReaction(messageId, req.user.id, emoji as string);

      if (success) {
        res.json({
          success: true,
          message: 'Reaction removed successfully',
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Reaction not found',
        });
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove reaction',
      });
    }
  });

  // Upload media file
  app.post('/api/group-chats/:groupId/upload', requireAuth, async (req, res) => {
    try {
      const { groupId } = req.params;
      
      // Check if user is a member
      const groups = await storage.getUserGroupChats(req.user.id);
      const userGroup = groups.find(g => g.id === groupId);
      
      if (!userGroup) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You are not a member of this group',
        });
      }

      // Check if group allows media sharing
      const group = await storage.getGroupChat(groupId);
      if (!group || !group.allowMediaSharing) {
        return res.status(403).json({
          success: false,
          error: 'Media sharing is disabled for this group',
        });
      }

      // Get upload URL from object storage
      const uploadURL = await objectStorage.getObjectEntityUploadURL();

      res.json({
        success: true,
        uploadURL,
      });
    } catch (error) {
      console.error('Error getting upload URL:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get upload URL',
      });
    }
  });

  // Process media upload (after file is uploaded to object storage)
  app.post('/api/group-chats/:groupId/media', requireAuth, async (req, res) => {
    try {
      const { groupId } = req.params;
      const { mediaUrl, fileName, mimeType, fileSize, width, height, duration } = req.body;

      // Check if user is a member
      const groups = await storage.getUserGroupChats(req.user.id);
      const userGroup = groups.find(g => g.id === groupId);
      
      if (!userGroup) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You are not a member of this group',
        });
      }

      // Create media upload record
      const mediaUpload = await storage.createMediaUpload({
        uploaderId: req.user.id,
        fileName,
        originalName: fileName,
        mimeType,
        fileSize,
        width,
        height,
        duration,
        storageUrl: mediaUrl,
        processingStatus: 'completed',
        isPublic: false,
      });

      // Normalize the media URL for group messages
      const normalizedPath = objectStorage.normalizeObjectEntityPath(mediaUrl);

      res.json({
        success: true,
        mediaUpload,
        normalizedPath,
      });
    } catch (error) {
      console.error('Error processing media upload:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process media upload',
      });
    }
  });

  // Leave group
  app.post('/api/group-chats/:groupId/leave', requireAuth, async (req, res) => {
    try {
      const { groupId } = req.params;

      const success = await storage.removeGroupMember(groupId, req.user.id);

      if (success) {
        res.json({
          success: true,
          message: 'Left group successfully',
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'You are not a member of this group',
        });
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to leave group',
      });
    }
  });
}