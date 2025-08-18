import React, { useState, useEffect } from 'react';
import { Shield, Users, Settings, Database, Activity, Crown, UserCheck, Trash2, Ban, CheckCircle } from 'lucide-react';

interface AdminUser {
  id: string;
  stagename: string;
  email: string;
  role: string;
  isAdmin: boolean;
  permissions?: {
    full_admin?: boolean;
    user_management?: boolean;
    content_moderation?: boolean;
    band_management?: boolean;
    tour_management?: boolean;
    review_moderation?: boolean;
    photo_moderation?: boolean;
    messaging_moderation?: boolean;
  };
  isOnline: boolean;
  lastActive: string;
  reputationPoints: number;
  createdAt: string;
}

interface AdminPanelProps {
  currentUserId?: string;
}

export function AdminPanel({ currentUserId }: AdminPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [adminCode, setAdminCode] = useState('');
  const [showGrantAdmin, setShowGrantAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Grant admin access with special code
  const grantAdminAccess = async () => {
    if (adminCode === 'MOSH_ADMIN_2025') {
      try {
        const response = await fetch('/api/admin/grant-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminCode })
        });
        
        if (response.ok) {
          alert('Admin access granted! Please refresh the page.');
          setShowGrantAdmin(false);
        } else {
          alert('Failed to grant admin access');
        }
      } catch (error) {
        console.error('Error granting admin:', error);
        alert('Error granting admin access');
      }
    } else {
      alert('Invalid admin code');
    }
  };

  // Load users data
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
    setLoading(false);
  };

  // Update user role
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      });
      
      if (response.ok) {
        loadUsers(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  // Toggle admin status
  const toggleAdminStatus = async (userId: string, isAdmin: boolean) => {
    try {
      const response = await fetch('/api/admin/users/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isAdmin: !isAdmin })
      });
      
      if (response.ok) {
        loadUsers(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
    }
  };

  // Grant specific permissions to a user - only super admin can do this
  const grantSpecificPermissions = async (userId: string, permissions: Record<string, boolean>) => {
    try {
      const response = await fetch('/api/admin/grant-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, permissions })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Permissions granted successfully: ${Object.keys(permissions).join(', ')}`);
        loadUsers(); // Refresh data
        setShowPermissionModal(false);
      } else {
        const error = await response.json();
        alert(`Failed to grant permissions: ${error.error}`);
      }
    } catch (error) {
      console.error('Error granting permissions:', error);
      alert('Error granting permissions');
    }
  };

  // Open permission modal for a specific user
  const openPermissionModal = (user: AdminUser) => {
    setSelectedUser(user);
    setShowPermissionModal(true);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const tabs = [
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'admin', name: 'Grant Admin', icon: Crown },
    { id: 'settings', name: 'App Settings', icon: Settings },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'activity', name: 'Activity Log', icon: Activity }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <Shield style={{ color: '#dc2626', width: '2rem', height: '2rem' }} />
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #dc2626, #facc15)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            MoshUnion Admin Panel
          </h1>
        </div>
        <p style={{ color: '#9ca3af' }}>
          Complete administrative control over the metal community platform
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '2rem',
        borderBottom: '1px solid #374151'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 2rem',
                backgroundColor: activeTab === tab.id ? '#dc2626' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#9ca3af',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #dc2626' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon style={{ width: '1.25rem', height: '1.25rem' }} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'users' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#dc2626' }}>
              User Management
            </h2>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</div>
            ) : (
              <div style={{
                backgroundColor: '#111827',
                borderRadius: '8px',
                border: '1px solid #374151',
                overflow: 'hidden'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 2fr',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: '#1f2937',
                  fontWeight: 'bold',
                  color: '#facc15'
                }}>
                  <div>User</div>
                  <div>Role</div>
                  <div>Admin</div>
                  <div>Status</div>
                  <div>Points</div>
                  <div>Actions</div>
                </div>
                
                {users.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 2fr',
                      gap: '1rem',
                      padding: '1rem',
                      borderTop: '1px solid #374151',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{user.stagename}</div>
                      <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{user.email}</div>
                    </div>
                    
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      style={{
                        backgroundColor: '#374151',
                        color: '#ffffff',
                        border: '1px solid #4b5563',
                        borderRadius: '4px',
                        padding: '0.5rem'
                      }}
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                    
                    <button
                      onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                      style={{
                        backgroundColor: user.isAdmin ? '#dc2626' : '#374151',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      {user.isAdmin ? <Crown style={{ width: '1rem', height: '1rem' }} /> : <UserCheck style={{ width: '1rem', height: '1rem' }} />}
                    </button>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: user.isOnline ? '#10b981' : '#6b7280'
                      }}></div>
                      {user.isOnline ? 'Online' : 'Offline'}
                    </div>
                    
                    <div style={{ color: '#facc15', fontWeight: 'bold' }}>
                      {user.reputationPoints}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => openPermissionModal(user)}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.7rem'
                        }}
                        title="Grant specific permissions"
                      >
                        Permissions
                      </button>
                      
                      <button
                        onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                        style={{
                          backgroundColor: user.isAdmin ? '#dc2626' : '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem',
                          cursor: 'pointer'
                        }}
                        title={user.isAdmin ? 'Revoke all admin privileges' : 'Grant admin'}
                      >
                        {user.isAdmin ? <Ban style={{ width: '1rem', height: '1rem' }} /> : <CheckCircle style={{ width: '1rem', height: '1rem' }} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#dc2626' }}>
              Grant Admin Access
            </h2>
            
            <div style={{
              backgroundColor: '#111827',
              borderRadius: '8px',
              border: '1px solid #374151',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <Crown style={{ 
                width: '4rem', 
                height: '4rem', 
                color: '#facc15', 
                margin: '0 auto 1rem auto' 
              }} />
              
              <h3 style={{ 
                fontSize: '1.25rem', 
                marginBottom: '1rem', 
                color: '#ffffff' 
              }}>
                Grant Yourself Permanent Admin Status
              </h3>
              
              <p style={{ 
                color: '#9ca3af', 
                marginBottom: '2rem' 
              }}>
                Enter the admin code to grant yourself full administrative privileges for MoshUnion
              </p>
              
              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <input
                  type="password"
                  placeholder="Enter admin code"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: '#374151',
                    color: '#ffffff',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '1rem'
                  }}
                />
                
                <button
                  onClick={grantAdminAccess}
                  style={{
                    width: '100%',
                    padding: '1rem 2rem',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Grant Admin Access
                </button>
              </div>
              
              <div style={{
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: '#1f2937',
                borderRadius: '8px',
                border: '1px solid #374151'
              }}>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: '#fbbf24',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold'
                }}>
                  Admin Code: MOSH_ADMIN_2025
                </p>
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: '#9ca3af' 
                }}>
                  This will grant you permanent administrator privileges including user management, content moderation, and system configuration access.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#dc2626' }}>
              Application Settings
            </h2>
            <div style={{
              backgroundColor: '#111827',
              borderRadius: '8px',
              border: '1px solid #374151',
              padding: '2rem'
            }}>
              <p style={{ color: '#9ca3af' }}>
                Application configuration settings will be implemented here.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#dc2626' }}>
              Database Management
            </h2>
            <div style={{
              backgroundColor: '#111827',
              borderRadius: '8px',
              border: '1px solid #374151',
              padding: '2rem'
            }}>
              <p style={{ color: '#9ca3af' }}>
                Database administration tools will be implemented here.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#dc2626' }}>
              Activity Monitoring
            </h2>
            <div style={{
              backgroundColor: '#111827',
              borderRadius: '8px',
              border: '1px solid #374151',
              padding: '2rem'
            }}>
              <p style={{ color: '#9ca3af' }}>
                Real-time activity logs and monitoring will be implemented here.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Permission Management Modal */}
      {showPermissionModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#111827',
            borderRadius: '8px',
            border: '1px solid #374151',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#dc2626'
              }}>
                Grant Permissions: {selectedUser.stagename}
              </h3>
              <button
                onClick={() => setShowPermissionModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#facc15', marginBottom: '1rem' }}>
                Current Permissions:
              </p>
              <div style={{
                backgroundColor: '#1f2937',
                padding: '1rem',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}>
                {selectedUser.permissions && Object.keys(selectedUser.permissions).length > 0 ? (
                  Object.entries(selectedUser.permissions).map(([key, value]) => (
                    <div key={key} style={{ 
                      color: value ? '#22c55e' : '#9ca3af',
                      marginBottom: '0.25rem'
                    }}>
                      {key.replace(/_/g, ' ').toUpperCase()}: {value ? '✓ Granted' : '✗ Not granted'}
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#9ca3af' }}>No permissions granted</div>
                )}
              </div>
            </div>

            <PermissionCheckboxes 
              userId={selectedUser.id}
              onGrantPermissions={grantSpecificPermissions}
              onClose={() => setShowPermissionModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Permission Checkboxes Component
function PermissionCheckboxes({ 
  userId, 
  onGrantPermissions, 
  onClose 
}: { 
  userId: string; 
  onGrantPermissions: (userId: string, permissions: Record<string, boolean>) => void;
  onClose: () => void;
}) {
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});

  const availablePermissions = [
    { key: 'user_management', label: 'User Management', description: 'Manage user accounts and roles' },
    { key: 'content_moderation', label: 'Content Moderation', description: 'Moderate posts, reviews, and discussions' },
    { key: 'band_management', label: 'Band Management', description: 'Add/edit/remove bands from the database' },
    { key: 'tour_management', label: 'Tour Management', description: 'Manage tour dates and venues' },
    { key: 'review_moderation', label: 'Review Moderation', description: 'Moderate band and album reviews' },
    { key: 'photo_moderation', label: 'Photo Moderation', description: 'Moderate uploaded photos and images' },
    { key: 'messaging_moderation', label: 'Messaging Moderation', description: 'Moderate private messages and reports' }
  ];

  const handlePermissionToggle = (key: string, checked: boolean) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleGrantPermissions = () => {
    // Filter out unchecked permissions
    const filteredPermissions = Object.fromEntries(
      Object.entries(selectedPermissions).filter(([_, value]) => value)
    );
    
    if (Object.keys(filteredPermissions).length === 0) {
      alert('Please select at least one permission to grant.');
      return;
    }
    
    onGrantPermissions(userId, filteredPermissions);
  };

  return (
    <div>
      <p style={{ color: '#facc15', marginBottom: '1rem' }}>
        Select permissions to grant:
      </p>
      
      <div style={{ marginBottom: '1.5rem' }}>
        {availablePermissions.map((permission) => (
          <div key={permission.key} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#1f2937',
            borderRadius: '4px'
          }}>
            <input
              type="checkbox"
              id={permission.key}
              checked={selectedPermissions[permission.key] || false}
              onChange={(e) => handlePermissionToggle(permission.key, e.target.checked)}
              style={{
                marginTop: '0.125rem',
                accentColor: '#dc2626'
              }}
            />
            <div style={{ flex: 1 }}>
              <label
                htmlFor={permission.key}
                style={{
                  color: '#ffffff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}
              >
                {permission.label}
              </label>
              <p style={{
                color: '#9ca3af',
                fontSize: '0.8rem',
                margin: 0
              }}>
                {permission.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem'
      }}>
        <button
          onClick={onClose}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#374151',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        
        <button
          onClick={handleGrantPermissions}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Grant Selected Permissions
        </button>
      </div>
    </div>
  );
}