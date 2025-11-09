# LinkedIn Posting Agent

An automated LinkedIn posting agent that allows you to post text updates, articles, and images to LinkedIn via the LinkedIn API v2.

## Features

- Post text updates to LinkedIn
- Share articles with custom commentary
- Upload and share images
- Schedule posts for future publication
- Control post visibility (PUBLIC, CONNECTIONS, LOGGED_IN)
- Full CLI interface for easy automation
- OAuth 2.0 authentication

## Prerequisites

- Node.js 12.x or higher
- A LinkedIn Developer account
- LinkedIn API credentials (Access Token and Person URN)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Configure your LinkedIn credentials in `.env`:
```
LINKEDIN_ACCESS_TOKEN=your_access_token_here
LINKEDIN_PERSON_URN=urn:li:person:your_person_id_here
```

## Getting LinkedIn API Credentials

### Step 1: Create a LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in the required information:
   - App name
   - LinkedIn Page (you need to associate the app with a LinkedIn page)
   - Privacy policy URL
   - App logo
4. Click "Create app"

### Step 2: Request API Access

1. In your app settings, go to the "Products" tab
2. Request access to "Share on LinkedIn" and "Sign In with LinkedIn"
3. Wait for approval (usually instant for development)

### Step 3: Get Your Access Token

1. Go to the "Auth" tab in your app
2. Note your **Client ID** and **Client Secret**
3. Add a redirect URL (e.g., `http://localhost:3000/auth/linkedin/callback`)
4. Use the OAuth 2.0 flow to get an access token:

**Authorization URL:**
```
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={YOUR_CLIENT_ID}&redirect_uri={YOUR_REDIRECT_URI}&scope=w_member_social,r_liteprofile
```

Replace `{YOUR_CLIENT_ID}` and `{YOUR_REDIRECT_URI}` with your values.

5. After authorization, exchange the code for an access token:

```bash
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code={AUTHORIZATION_CODE}" \
  -d "redirect_uri={YOUR_REDIRECT_URI}" \
  -d "client_id={YOUR_CLIENT_ID}" \
  -d "client_secret={YOUR_CLIENT_SECRET}"
```

### Step 4: Get Your Person URN

Once you have an access token, get your Person URN:

```bash
curl -X GET https://api.linkedin.com/v2/me \
  -H "Authorization: Bearer {YOUR_ACCESS_TOKEN}"
```

The response will contain your ID. Your Person URN is: `urn:li:person:{YOUR_ID}`

## Usage

### CLI Commands

#### Post a Text Update

```bash
# Using npm script
npm run linkedin:post -- --text "Hello LinkedIn! This is an automated post."

# Using node directly
node linkedin-agent.js post --text "Hello LinkedIn!"

# With custom visibility
node linkedin-agent.js post --text "Post for connections only" --visibility CONNECTIONS
```

**Visibility Options:**
- `PUBLIC` - Visible to everyone (default)
- `CONNECTIONS` - Visible to your connections only
- `LOGGED_IN` - Visible to logged-in LinkedIn members

#### Post an Article

```bash
node linkedin-agent.js post-article \
  --text "Check out this amazing article!" \
  --url "https://example.com/article" \
  --title "Article Title" \
  --description "Brief description of the article"
```

#### Post an Image

```bash
node linkedin-agent.js post-image \
  --text "Check out this image!" \
  --image "./path/to/image.jpg"
```

Supported image formats: JPG, PNG, GIF

#### Get Your Profile

```bash
node linkedin-agent.js profile
```

#### Schedule a Post

```bash
node linkedin-agent.js schedule \
  --text "This post is scheduled!" \
  --time "2025-11-10T14:00:00"
```

**Note:** The process must remain running for scheduled posts to execute. For production use, consider using a process manager like PM2 or a cron job.

### Programmatic Usage

You can also use the agent in your Node.js code:

```javascript
const LinkedInAgent = require('./linkedin-agent');

const agent = new LinkedInAgent();

// Post a text update
async function postUpdate() {
  try {
    await agent.postTextUpdate('Hello from Node.js!', 'PUBLIC');
  } catch (error) {
    console.error('Failed to post:', error);
  }
}

// Post an article
async function postArticle() {
  await agent.postArticle(
    'Great article!',
    'https://example.com/article',
    'Article Title',
    'Article description',
    'PUBLIC'
  );
}

// Post an image
async function postImage() {
  await agent.postImage(
    'Check this out!',
    './image.jpg',
    'PUBLIC'
  );
}

// Schedule a post
function schedulePost() {
  const scheduledTime = new Date('2025-11-10T14:00:00');
  const postConfig = {
    type: 'text',
    text: 'Scheduled post',
    visibility: 'PUBLIC'
  };

  agent.schedulePost(postConfig, scheduledTime);
}
```

## Advanced Features

### Batch Posting

Create a script to post multiple updates:

```javascript
const LinkedInAgent = require('./linkedin-agent');
const agent = new LinkedInAgent();

const posts = [
  'First update',
  'Second update',
  'Third update'
];

async function batchPost() {
  for (const post of posts) {
    await agent.postTextUpdate(post, 'PUBLIC');
    // Wait 5 seconds between posts
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

batchPost();
```

### Scheduled Campaign

Create a scheduled posting campaign:

```javascript
const LinkedInAgent = require('./linkedin-agent');
const agent = new LinkedInAgent();

const campaign = [
  {
    text: 'Day 1: Introduction',
    time: new Date('2025-11-10T09:00:00')
  },
  {
    text: 'Day 2: Features',
    time: new Date('2025-11-11T09:00:00')
  },
  {
    text: 'Day 3: Benefits',
    time: new Date('2025-11-12T09:00:00')
  }
];

campaign.forEach(post => {
  agent.schedulePost({
    type: 'text',
    text: post.text,
    visibility: 'PUBLIC'
  }, post.time);
});

console.log('Campaign scheduled!');
// Keep process running
setInterval(() => {}, 1000);
```

## API Rate Limits

LinkedIn API has rate limits:
- **Application-level**: Throttle limits apply to all requests from your app
- **Member-level**: Additional limits per authenticated member

Be mindful of these limits when posting frequently. Add delays between posts if needed.

## Troubleshooting

### "LINKEDIN_ACCESS_TOKEN is not set"

Make sure you've created a `.env` file with your credentials. Check that the file is in the same directory as `linkedin-agent.js`.

### "401 Unauthorized"

Your access token may be expired or invalid. LinkedIn access tokens typically expire after 60 days. Generate a new token using the OAuth flow.

### "403 Forbidden"

Check that your LinkedIn app has the necessary permissions:
- `w_member_social` - Required for posting
- `r_liteprofile` - Required for profile access

### "Image upload failed"

Ensure:
- Image file exists and path is correct
- Image is in a supported format (JPG, PNG, GIF)
- Image size is under 5MB

## Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Rotate access tokens regularly** - Generate new tokens periodically
3. **Use environment variables** - Never hardcode credentials
4. **Limit token scope** - Only request necessary permissions
5. **Monitor API usage** - Track requests to avoid rate limits

## Contributing

To extend the agent with new features:

1. Add new methods to the `LinkedInAgent` class
2. Create corresponding CLI commands in the program section
3. Update this README with usage examples

## License

ISC

## Resources

- [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)
- [LinkedIn Share API](https://docs.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/share-api)
- [LinkedIn OAuth 2.0](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [LinkedIn Developer Portal](https://www.linkedin.com/developers/)

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review LinkedIn API documentation
3. Check your app settings in LinkedIn Developer Portal
4. Verify your access token and permissions

## Example Workflow

Here's a complete example workflow:

```bash
# 1. Install dependencies
npm install

# 2. Set up credentials
cp .env.example .env
# Edit .env with your credentials

# 3. Test connection
node linkedin-agent.js profile

# 4. Post your first update
node linkedin-agent.js post --text "Hello LinkedIn! 🚀"

# 5. Share an article
node linkedin-agent.js post-article \
  --text "Must-read article!" \
  --url "https://example.com/article" \
  --title "Amazing Article"

# 6. Schedule a post
node linkedin-agent.js schedule \
  --text "Scheduled for tomorrow" \
  --time "2025-11-10T09:00:00"
```

Happy automating!
