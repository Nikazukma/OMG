#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const schedule = require('node-schedule');
const { program } = require('commander');

class LinkedInAgent {
  constructor() {
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    this.personURN = process.env.LINKEDIN_PERSON_URN;
    this.apiVersion = '202311';
    this.baseURL = 'https://api.linkedin.com/v2';
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    if (!this.accessToken) {
      throw new Error('LINKEDIN_ACCESS_TOKEN is not set in .env file');
    }
    if (!this.personURN) {
      throw new Error('LINKEDIN_PERSON_URN is not set in .env file');
    }
  }

  /**
   * Create headers for API requests
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': this.apiVersion
    };
  }

  /**
   * Post a text update to LinkedIn
   * @param {string} text - The text content to post
   * @param {string} visibility - Visibility: PUBLIC, CONNECTIONS, or LOGGED_IN
   */
  async postTextUpdate(text, visibility = 'PUBLIC') {
    try {
      this.validateConfig();

      const postData = {
        author: this.personURN,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': visibility
        }
      };

      const response = await axios.post(
        `${this.baseURL}/ugcPosts`,
        postData,
        { headers: this.getHeaders() }
      );

      console.log('Successfully posted to LinkedIn!');
      console.log('Post ID:', response.data.id);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Post an article (link) to LinkedIn
   * @param {string} text - The commentary text
   * @param {string} articleUrl - URL of the article
   * @param {string} articleTitle - Title of the article
   * @param {string} articleDescription - Description of the article
   * @param {string} visibility - Visibility setting
   */
  async postArticle(text, articleUrl, articleTitle, articleDescription, visibility = 'PUBLIC') {
    try {
      this.validateConfig();

      const postData = {
        author: this.personURN,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text
            },
            shareMediaCategory: 'ARTICLE',
            media: [{
              status: 'READY',
              originalUrl: articleUrl,
              title: {
                text: articleTitle
              },
              description: {
                text: articleDescription
              }
            }]
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': visibility
        }
      };

      const response = await axios.post(
        `${this.baseURL}/ugcPosts`,
        postData,
        { headers: this.getHeaders() }
      );

      console.log('Successfully posted article to LinkedIn!');
      console.log('Post ID:', response.data.id);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Post an image to LinkedIn
   * @param {string} text - The commentary text
   * @param {string} imagePath - Local path to the image file
   * @param {string} visibility - Visibility setting
   */
  async postImage(text, imagePath, visibility = 'PUBLIC') {
    try {
      this.validateConfig();

      // Step 1: Register upload
      const registerUploadResponse = await this.registerImageUpload();
      const uploadUrl = registerUploadResponse.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const asset = registerUploadResponse.value.asset;

      // Step 2: Upload image
      await this.uploadImage(uploadUrl, imagePath);

      // Step 3: Create post with image
      const postData = {
        author: this.personURN,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text
            },
            shareMediaCategory: 'IMAGE',
            media: [{
              status: 'READY',
              media: asset
            }]
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': visibility
        }
      };

      const response = await axios.post(
        `${this.baseURL}/ugcPosts`,
        postData,
        { headers: this.getHeaders() }
      );

      console.log('Successfully posted image to LinkedIn!');
      console.log('Post ID:', response.data.id);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Register an image upload
   */
  async registerImageUpload() {
    const registerData = {
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: this.personURN,
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent'
        }]
      }
    };

    const response = await axios.post(
      'https://api.linkedin.com/v2/assets?action=registerUpload',
      registerData,
      { headers: this.getHeaders() }
    );

    return response.data;
  }

  /**
   * Upload image to LinkedIn
   */
  async uploadImage(uploadUrl, imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);

    await axios.put(uploadUrl, imageBuffer, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/octet-stream'
      }
    });
  }

  /**
   * Schedule a post for later
   * @param {Object} postConfig - Post configuration
   * @param {Date} scheduledTime - When to post
   */
  schedulePost(postConfig, scheduledTime) {
    console.log(`Post scheduled for ${scheduledTime}`);

    const job = schedule.scheduleJob(scheduledTime, async () => {
      console.log('Executing scheduled post...');

      if (postConfig.type === 'text') {
        await this.postTextUpdate(postConfig.text, postConfig.visibility);
      } else if (postConfig.type === 'article') {
        await this.postArticle(
          postConfig.text,
          postConfig.articleUrl,
          postConfig.articleTitle,
          postConfig.articleDescription,
          postConfig.visibility
        );
      } else if (postConfig.type === 'image') {
        await this.postImage(postConfig.text, postConfig.imagePath, postConfig.visibility);
      }
    });

    return job;
  }

  /**
   * Get user profile information
   */
  async getUserProfile() {
    try {
      this.validateConfig();

      const response = await axios.get(
        `${this.baseURL}/me`,
        { headers: this.getHeaders() }
      );

      console.log('User Profile:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      console.error('LinkedIn API Error:');
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data);
    } else if (error.request) {
      console.error('No response received from LinkedIn API');
      console.error(error.message);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

// CLI Interface
program
  .name('linkedin-agent')
  .description('LinkedIn posting automation agent')
  .version('1.0.0');

program
  .command('post')
  .description('Post a text update to LinkedIn')
  .option('-t, --text <text>', 'Text content to post')
  .option('-v, --visibility <visibility>', 'Visibility: PUBLIC, CONNECTIONS, or LOGGED_IN', 'PUBLIC')
  .action(async (options) => {
    if (!options.text) {
      console.error('Error: --text option is required');
      process.exit(1);
    }

    const agent = new LinkedInAgent();
    await agent.postTextUpdate(options.text, options.visibility);
  });

program
  .command('post-article')
  .description('Post an article to LinkedIn')
  .option('-t, --text <text>', 'Commentary text')
  .option('-u, --url <url>', 'Article URL')
  .option('--title <title>', 'Article title')
  .option('--description <description>', 'Article description')
  .option('-v, --visibility <visibility>', 'Visibility: PUBLIC, CONNECTIONS, or LOGGED_IN', 'PUBLIC')
  .action(async (options) => {
    if (!options.text || !options.url || !options.title) {
      console.error('Error: --text, --url, and --title options are required');
      process.exit(1);
    }

    const agent = new LinkedInAgent();
    await agent.postArticle(
      options.text,
      options.url,
      options.title,
      options.description || '',
      options.visibility
    );
  });

program
  .command('post-image')
  .description('Post an image to LinkedIn')
  .option('-t, --text <text>', 'Commentary text')
  .option('-i, --image <path>', 'Path to image file')
  .option('-v, --visibility <visibility>', 'Visibility: PUBLIC, CONNECTIONS, or LOGGED_IN', 'PUBLIC')
  .action(async (options) => {
    if (!options.text || !options.image) {
      console.error('Error: --text and --image options are required');
      process.exit(1);
    }

    const agent = new LinkedInAgent();
    await agent.postImage(options.text, options.image, options.visibility);
  });

program
  .command('profile')
  .description('Get your LinkedIn profile information')
  .action(async () => {
    const agent = new LinkedInAgent();
    await agent.getUserProfile();
  });

program
  .command('schedule')
  .description('Schedule a post for later')
  .option('-t, --text <text>', 'Text content to post')
  .option('--time <time>', 'ISO 8601 datetime (e.g., 2025-11-10T14:00:00)')
  .option('-v, --visibility <visibility>', 'Visibility: PUBLIC, CONNECTIONS, or LOGGED_IN', 'PUBLIC')
  .action(async (options) => {
    if (!options.text || !options.time) {
      console.error('Error: --text and --time options are required');
      process.exit(1);
    }

    const scheduledTime = new Date(options.time);
    if (isNaN(scheduledTime.getTime())) {
      console.error('Error: Invalid datetime format. Use ISO 8601 format.');
      process.exit(1);
    }

    const agent = new LinkedInAgent();
    const postConfig = {
      type: 'text',
      text: options.text,
      visibility: options.visibility
    };

    agent.schedulePost(postConfig, scheduledTime);
    console.log('Scheduled post will run in the background. Keep this process running.');

    // Keep process alive
    setInterval(() => {}, 1000);
  });

// Parse CLI arguments
if (require.main === module) {
  program.parse(process.argv);
}

module.exports = LinkedInAgent;
