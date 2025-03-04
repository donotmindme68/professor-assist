# Suggested Missing API Endpoints

Based on the client-side implementation, here are some API endpoints that appear to be missing from the server implementation:

## 1. Get Subscribed Contents with Details

**Endpoint:** `GET /api/subscribers/contents`

**Description:** Returns the full content details for all subscriptions of the current subscriber. This is more efficient than requiring the client to first fetch subscriptions and then fetch each content separately.

**Implementation Suggestion:**
```javascript
const getSubscribedContents = [authorizeSubscriber, async (req: Request, res: Response) => {
  try {
    const subscriberId = req.user!.id;
    
    // Get all subscriptions for this subscriber
    const subscriptions = await ContentRegistration.findAll({
      where: { subscriberId }
    });
    
    // Get content IDs from subscriptions
    const contentIds = subscriptions.map(sub => sub.contentId);
    
    // Fetch all content details in one query
    const contents = await Content.findAll({
      where: {
        id: contentIds
      }
    });
    
    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscribed contents' });
  }
}];
```

## 2. Get Content by Invite Link

**Endpoint:** `GET /api/contents/by-invite`

**Description:** Allows fetching content details using a sharing/invite link.

**Implementation Suggestion:**
```javascript
const getContentByInviteLink = async (req: Request, res: Response) => {
  try {
    const inviteLink = req.query.link as string;
    
    // Extract the sharing ID from the invite link
    // This is just an example - actual implementation depends on link format
    const sharingId = inviteLink.split('/').pop();
    
    if (!sharingId) {
      return res.status(400).json({ error: 'Invalid invite link format' });
    }
    
    // Find content by sharing ID
    const content = await Content.findOne({
      where: { sharingId }
    });
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found or invite link expired' });
    }
    
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content by invite link' });
  }
};
```

## 3. List Threads by Content

**Endpoint:** `GET /api/threads/by-content/:contentId`

**Description:** Returns all threads for a specific content that the current subscriber has access to.

**Implementation Suggestion:**
```javascript
const listThreadsByContent = [authorizeSubscriber, async (req: Request, res: Response) => {
  try {
    const contentId = parseInt(req.params.contentId);
    const subscriberId = req.user!.id;
    
    // First verify the subscriber has access to this content
    const subscription = await ContentRegistration.findOne({
      where: {
        subscriberId,
        contentId
      }
    });
    
    if (!subscription) {
      return res.status(403).json({ error: 'Not subscribed to this content' });
    }
    
    // Fetch all threads for this content and subscriber
    const threads = await Thread.findAll({
      where: {
        subscriberId,
        contentId
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
}];
```

## 4. User Profile Endpoint

**Endpoint:** `GET /api/user/profile`

**Description:** Returns the current user's profile information.

**Implementation Suggestion:**
```javascript
const getUserProfile = [authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Fetch user details (excluding password)
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}];
```

## 5. Update Thread Name

**Endpoint:** `PATCH /api/threads/:id/name`

**Description:** Allows updating just the thread name without modifying messages.

**Implementation Suggestion:**
```javascript
const updateThreadName = [authorizeSubscriber, async (req: Request, res: Response) => {
  try {
    const threadId = parseInt(req.params.id);
    const { name } = req.body;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Valid name is required' });
    }
    
    const [updated] = await Thread.update(
      { name },
      { where: { id: threadId, subscriberId: req.user!.id } }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Thread not found or not authorized' });
    }
    
    const updatedThread = await Thread.findByPk(threadId);
    res.json(updatedThread);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update thread name' });
  }
}];
```

## 6. Search Public Contents

**Endpoint:** `GET /api/public-contents/search`

**Description:** Allows searching through public contents.

**Implementation Suggestion:**
```javascript
const searchPublicContents = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // This is a simplified example - actual implementation would depend on your database
    const contents = await Content.findAll({
      where: {
        isPublic: true,
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } }
        ]
      }
    });
    
    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search contents' });
  }
};
```