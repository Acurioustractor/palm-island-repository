/**
 * Cultural Protocols Enforcement
 * Ensures cultural safety and respect for Indigenous data sovereignty
 *
 * CRITICAL: These checks protect sacred and sensitive content
 */

export interface Story {
  id: string;
  title: string;
  contains_traditional_knowledge?: boolean;
  elder_approval_given?: boolean;
  elder_approval_required?: boolean;
  elder_approval_date?: string;
  cultural_sensitivity_level?: 'low' | 'medium' | 'high' | 'restricted';
  access_level?: 'public' | 'community' | 'restricted';
  is_public?: boolean;
}

export interface CulturalCheckResult {
  allowed: boolean;
  reason?: string;
  warnings?: string[];
}

/**
 * Check if a story can be publicly displayed
 */
export function canDisplayPublicly(story: Story): CulturalCheckResult {
  const warnings: string[] = [];

  // RESTRICTED stories NEVER display publicly
  if (story.cultural_sensitivity_level === 'restricted') {
    return {
      allowed: false,
      reason: 'Story contains restricted cultural content'
    };
  }

  // Access level check
  if (story.access_level === 'restricted') {
    return {
      allowed: false,
      reason: 'Story is restricted access only'
    };
  }

  if (story.access_level === 'community') {
    return {
      allowed: false,
      reason: 'Story is community-only access'
    };
  }

  // Public flag check
  if (story.is_public === false) {
    return {
      allowed: false,
      reason: 'Story is not marked as public'
    };
  }

  // Traditional knowledge requires elder approval
  if (story.contains_traditional_knowledge) {
    if (story.elder_approval_required && !story.elder_approval_given) {
      return {
        allowed: false,
        reason: 'Traditional knowledge requires elder approval'
      };
    }

    // Add warning for high sensitivity even with approval
    if (story.cultural_sensitivity_level === 'high') {
      warnings.push('High cultural sensitivity - ensure cultural context displayed');
    }
  }

  return {
    allowed: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Check if a story can auto-place (algorithm-driven)
 */
export function canAutoPlace(story: Story): CulturalCheckResult {
  // First check if can display publicly
  const publicCheck = canDisplayPublicly(story);
  if (!publicCheck.allowed) {
    return publicCheck;
  }

  const warnings: string[] = [...(publicCheck.warnings || [])];

  // HIGH sensitivity traditional knowledge should be manually curated
  if (
    story.contains_traditional_knowledge &&
    story.cultural_sensitivity_level === 'high'
  ) {
    return {
      allowed: false,
      reason: 'High-sensitivity traditional knowledge requires manual curation'
    };
  }

  // MEDIUM sensitivity requires extra care
  if (story.cultural_sensitivity_level === 'medium') {
    warnings.push('Medium sensitivity - review placement context carefully');
  }

  return {
    allowed: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Check if story is appropriate for a specific page context
 */
export function canPlaceInContext(
  story: Story,
  pageContext: string
): CulturalCheckResult {
  // First check basic placement eligibility
  const placementCheck = canAutoPlace(story);
  if (!placementCheck.allowed) {
    return placementCheck;
  }

  const warnings: string[] = [...(placementCheck.warnings || [])];

  // Traditional knowledge should only appear in cultural/elder contexts
  if (story.contains_traditional_knowledge) {
    const culturalContexts = ['culture', 'elders', 'stories', 'community'];

    if (!culturalContexts.includes(pageContext)) {
      warnings.push(
        `Traditional knowledge story in ${pageContext} context - ensure appropriate framing`
      );
    }
  }

  // High sensitivity stories need appropriate context
  if (story.cultural_sensitivity_level === 'high') {
    const sensitiveContexts = ['culture', 'elders', 'stories'];

    if (!sensitiveContexts.includes(pageContext)) {
      return {
        allowed: false,
        reason: `High-sensitivity story requires cultural context (culture/elders/stories pages only)`
      };
    }
  }

  return {
    allowed: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Get cultural warning text for display
 */
export function getCulturalWarning(story: Story): string | null {
  if (!story.contains_traditional_knowledge) {
    return null;
  }

  if (story.cultural_sensitivity_level === 'high') {
    return 'This story contains sacred traditional knowledge shared with permission from elders and knowledge keepers. Please treat with the utmost respect and cultural sensitivity.';
  }

  if (story.cultural_sensitivity_level === 'medium') {
    return 'This story contains traditional knowledge shared with permission. Please treat with respect and cultural sensitivity.';
  }

  return 'This story contains cultural knowledge shared with permission from the community.';
}

/**
 * Check if elder approval is current (within 2 years)
 */
export function isElderApprovalCurrent(story: Story): boolean {
  if (!story.elder_approval_given || !story.elder_approval_date) {
    return false;
  }

  const approvalDate = new Date(story.elder_approval_date);
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  return approvalDate >= twoYearsAgo;
}

/**
 * Get cultural protocol status summary
 */
export interface CulturalProtocolStatus {
  has_traditional_knowledge: boolean;
  elder_approval_status: 'not_required' | 'pending' | 'approved' | 'expired';
  sensitivity_level: string;
  public_display_allowed: boolean;
  auto_place_allowed: boolean;
  warnings: string[];
}

export function getCulturalProtocolStatus(story: Story): CulturalProtocolStatus {
  const warnings: string[] = [];

  // Determine elder approval status
  let elder_approval_status: 'not_required' | 'pending' | 'approved' | 'expired' =
    'not_required';

  if (story.elder_approval_required) {
    if (!story.elder_approval_given) {
      elder_approval_status = 'pending';
      warnings.push('Elder approval required but not yet given');
    } else if (!isElderApprovalCurrent(story)) {
      elder_approval_status = 'expired';
      warnings.push('Elder approval has expired (>2 years old) - requires renewal');
    } else {
      elder_approval_status = 'approved';
    }
  }

  const publicCheck = canDisplayPublicly(story);
  const autoPlaceCheck = canAutoPlace(story);

  if (publicCheck.warnings) warnings.push(...publicCheck.warnings);
  if (autoPlaceCheck.warnings) warnings.push(...autoPlaceCheck.warnings);

  return {
    has_traditional_knowledge: story.contains_traditional_knowledge || false,
    elder_approval_status,
    sensitivity_level: story.cultural_sensitivity_level || 'low',
    public_display_allowed: publicCheck.allowed,
    auto_place_allowed: autoPlaceCheck.allowed,
    warnings
  };
}

/**
 * Log cultural protocol violation (for monitoring)
 */
export function logCulturalViolation(
  story: Story,
  action: string,
  reason: string
): void {
  console.error('[CULTURAL PROTOCOL VIOLATION]', {
    story_id: story.id,
    story_title: story.title,
    action,
    reason,
    timestamp: new Date().toISOString()
  });

  // In production, this should also:
  // 1. Send alert to cultural advisors
  // 2. Log to audit trail
  // 3. Potentially block the action
}

/**
 * Alias for canPlaceInContext to match auto-assignment script naming
 */
export const canDisplayInContext = canPlaceInContext;
