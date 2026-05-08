"use client";

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useProfileStore } from '@/stores/useProfileStore'
import { FiX, FiUser, FiEdit3, FiMapPin, FiGlobe, FiTwitter } from 'react-icons/fi'
import { FaDiscord, FaTelegram } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import Button from '@/components/button'

export default function ProfileCreationModal() {
  const { address } = useAccount()
  const { 
    isProfileModalOpen, 
    closeProfileModal, 
    setProfile, 
    hasProfile,
    openProfileModal 
  } = useProfileStore()

  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
    location: '',
    website: '',
    twitter: '',
    discord: '',
    telegram: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if user needs profile creation when wallet connects
  useEffect(() => {
    if (address && !hasProfile(address)) {
      console.log('Profile creation modal should open for address:', address)
      // Small delay to ensure wallet connection is complete
      const timer = setTimeout(() => {
        console.log('Opening profile modal for new user')
        openProfileModal()
      }, 1000)
      return () => clearTimeout(timer)
    } else if (address) {
      console.log('User already has profile, modal not needed')
    }
  }, [address, hasProfile, openProfileModal])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required'
    }

    if (formData.bio.length > 160) {
      newErrors.bio = 'Bio must be 160 characters or less'
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Website must be a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address) return
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      // Save profile to store
      setProfile(address, {
        username: formData.username.trim(),
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        website: formData.website.trim(),
        twitter: formData.twitter.trim(),
        discord: formData.discord.trim(),
        telegram: formData.telegram.trim(),
      })
      
      // Close modal immediately after saving
      closeProfileModal()
      
      // Show success message
      toast.success('Profile created successfully!')
    } catch (error) {
      console.error('Error creating profile:', error)
      toast.error('Failed to create profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Allow users to close the modal even without creating a profile
    closeProfileModal()
  }

  const handleSkip = () => {
    // Create a minimal default profile so modal doesn't reappear
    if (address) {
      setProfile(address, {
        username: `user_${address.slice(0, 6)}`,
        displayName: `User ${address.slice(0, 6)}`,
        bio: '',
      })
    }
    closeProfileModal()
  }

  // Temporarily disabled - will fix after video
  return null
  
  if (!isProfileModalOpen || !address) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4">
      <div className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden rounded-lg border border-border-primary bg-bg-card backdrop-blur-lg">
        {/* Header with Close Button */}
        <div className="flex items-start justify-between border-b border-border-primary bg-bg-card/80 p-4 sm:p-6 flex-shrink-0">
          <div className="flex-1 pr-4">
            <h2 className="text-xl sm:text-2xl font-bold text-text-secondary">Create Your Profile</h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">Welcome to CeloPredict! Let&apos;s set up your profile.</p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 rounded-full p-2 text-text-muted hover:bg-bg-card-hover hover:text-text-secondary transition-colors"
            aria-label="Close modal"
          >
            <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-text-secondary flex items-center gap-2">
              <FiUser className="text-primary flex-shrink-0" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className={`w-full rounded-button border bg-bg-card px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.username ? 'border-error' : 'border-border-input'
                  }`}
                  placeholder="your_username"
                />
                {errors.username && (
                  <p className="text-error text-xs mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className={`w-full rounded-button border bg-bg-card px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.displayName ? 'border-error' : 'border-border-input'
                  }`}
                  placeholder="Your Name"
                />
                {errors.displayName && (
                  <p className="text-error text-xs mt-1">{errors.displayName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className={`w-full rounded-button border bg-bg-card px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                  errors.bio ? 'border-error' : 'border-border-input'
                }`}
                placeholder="Tell us about yourself..."
                rows={3}
                maxLength={160}
              />
              <div className="flex justify-between text-xs sm:text-sm mt-1">
                {errors.bio ? (
                  <p className="text-error">{errors.bio}</p>
                ) : (
                  <span />
                )}
                <span className="text-text-muted">{formData.bio.length}/160</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-text-secondary flex items-center gap-2">
              <FiEdit3 className="text-primary flex-shrink-0" />
              Additional Information (Optional)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                  <FiMapPin className="h-4 w-4 flex-shrink-0" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full rounded-button border border-border-input bg-bg-card px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                  <FiGlobe className="h-4 w-4 flex-shrink-0" />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className={`w-full rounded-button border bg-bg-card px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.website ? 'border-error' : 'border-border-input'
                  }`}
                  placeholder="https://yourwebsite.com"
                />
                {errors.website && (
                  <p className="text-error text-xs mt-1">{errors.website}</p>
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-text-secondary">Social Links (Optional)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                  <FiTwitter className="h-4 w-4 flex-shrink-0" />
                  Twitter
                </label>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                  className="w-full rounded-button border border-border-input bg-bg-card px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="@username"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                  <FaDiscord className="h-4 w-4 flex-shrink-0" />
                  Discord
                </label>
                <input
                  type="text"
                  value={formData.discord}
                  onChange={(e) => setFormData(prev => ({ ...prev, discord: e.target.value }))}
                  className="w-full rounded-button border border-border-input bg-bg-card px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="username#1234"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                  <FaTelegram className="h-4 w-4 flex-shrink-0" />
                  Telegram
                </label>
                <input
                  type="text"
                  value={formData.telegram}
                  onChange={(e) => setFormData(prev => ({ ...prev, telegram: e.target.value }))}
                  className="w-full rounded-button border border-border-input bg-bg-card px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          {/* Wallet Address Display */}
          <div className="rounded-lg bg-bg-card p-3 sm:p-4">
            <h4 className="text-xs sm:text-sm font-medium text-text-secondary mb-2">Connected Wallet</h4>
            <p className="text-xs text-text-muted font-mono break-all">{address}</p>
          </div>

        </form>

        {/* Submit Buttons - Sticky Footer */}
        <div className="border-t border-border-primary bg-bg-card/80 p-4 sm:p-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Skip for now
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {address && hasProfile(address as string) && (
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              )}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2 sm:py-3 bg-primary text-bg-card font-semibold rounded-button hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 